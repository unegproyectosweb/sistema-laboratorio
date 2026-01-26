import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ReservationTypeNames } from "@uneg-lab/api-types/reservation.js";
import { paginate, PaginateConfig, PaginateQuery } from "nestjs-paginate";
import pkgRRule from "rrule";
import { DataSource, Repository } from "typeorm";
import { StatsDto } from "./dto/stats.dto.js";
import { Ocupation } from "./entities/ocupation.entity.js";
import { Reservation } from "./entities/reservation.entity.js";
import {
  CreateReservationDto,
  UpdateReservationDto,
} from "./reservation.dto.js";

const { RRule, rrulestr } = pkgRRule;

export const RESERVATION_PAGINATION_CONFIG = {
  sortableColumns: ["createdAt", "id", "name"],
  nullSort: "last",
  defaultSortBy: [["createdAt", "DESC"]],
  searchableColumns: ["name", "user.name", "laboratory.name"],
  relations: ["user", "laboratory", "type", "state", "classInstance", "event"],
  defaultLimit: 20,
} satisfies PaginateConfig<Reservation>;

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const reservation = queryRunner.manager.create(Reservation, {
        ...dto,
        user: { id: dto.userId } as any,
        laboratory: { id: dto.laboratoryId } as any,
        type: { id: dto.typeId } as any,
        state: { id: dto.stateId } as any,
      });
      const savedReservation = await queryRunner.manager.save(reservation);

      const dates = this.generateOcupationDates(
        dto.startDate,
        dto.endDate,
        dto.rrule,
      );

      const ocupations = dates.map((date) => {
        return queryRunner.manager.create(Ocupation, {
          date: date,
          startHour: dto.defaultStartTime,
          endHour: dto.defaultEndTime,
          reservation: savedReservation,
          active: true,
        });
      });

      await queryRunner.manager.save(Ocupation, ocupations);

      await queryRunner.commitTransaction();

      return savedReservation;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      console.error("Detaile del error al crear reserva:", error);

      if (error.code === "23505") {
        throw new ConflictException(
          "El laboratorio ya está ocupado en una de las fechas seleccionadas.",
        );
      }
      throw new InternalServerErrorException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  private generateOcupationDates(
    start: string,
    end?: string,
    rruleStr?: string,
  ): Date[] {
    const startDate = new Date(`${start}T12:00:00`);

    if (!rruleStr) {
      return [startDate];
    }

    try {
      const rule = rrulestr(rruleStr, { dtstart: startDate });

      let dates: Date[];

      if (!rule.options.count && !rule.options.until) {
        const options = rule.options;
        if (end) {
          options.until = new Date(`${end}T23:59:59`);
        } else {
          options.count = 12;
        }
        dates = new RRule(options).all();
      } else {
        dates = rule.all();
      }

      return dates;
    } catch (e) {
      console.error("Error en RRULE:", e);
      return [startDate];
    }
  }
  async search(query: PaginateQuery) {
    return await paginate(
      query,
      this.reservationRepo,
      RESERVATION_PAGINATION_CONFIG,
    );
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: [
        "user",
        "laboratory",
        "type",
        "state",
        "ocupations",
        "classInstance",
        "event",
      ],
    });

    if (!reservation)
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    return reservation;
  }

  async update(id: number, dto: UpdateReservationDto) {
    const reservation = await this.findOne(id);

    if (dto.userId) reservation.user = { id: dto.userId } as any;
    if (dto.laboratoryId)
      reservation.laboratory = { id: dto.laboratoryId } as any;
    if (dto.typeId) reservation.type = { id: dto.typeId } as any;
    if (dto.stateId) reservation.state = { id: dto.stateId } as any;

    this.reservationRepo.merge(reservation, dto);
    return await this.reservationRepo.save(reservation);
  }

  async remove(id: number) {
    const reservation = await this.findOne(id);
    return await this.reservationRepo.remove(reservation);
  }

  async getStats() {
    const qb = this.reservationRepo
      .createQueryBuilder("reservation")
      .leftJoin("reservation.state", "state");

    const query = qb
      .select([
        "COUNT(*) as total",
        "COUNT(*) FILTER (WHERE state.name = :pendiente) as pendientes",
        "COUNT(*) FILTER (WHERE state.name = :aprobada) as aprobadas",
        "COUNT(*) FILTER (WHERE state.name = :rechazada) as rechazadas",
        "COUNT(*) FILTER (WHERE state.name = :cancelada) as canceladas",
      ])
      .setParameters({
        pendiente: ReservationTypeNames.PENDIENTE,
        aprobada: ReservationTypeNames.APROBADO,
        rechazada: ReservationTypeNames.RECHAZADO,
        cancelada: ReservationTypeNames.CANCELADO,
      });
    console.log("query builder stats:", query.getSql());
    const raw = await query.getRawOne();

    return new StatsDto({
      pendientes: Number(raw.pendientes) || 0,
      aprobadas: Number(raw.aprobadas) || 0,
      rechazadas: Number(raw.rechazadas) || 0,
      canceladas: Number(raw.canceladas) || 0,
      total: Number(raw.total) || 0,
    });
  }
}
