import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "@uneg-lab/api-types/auth.js";
import {
  ReservationStateNames,
  ReservationStateEnum,
} from "@uneg-lab/api-types/reservation.js";
import {
  FilterOperator,
  paginate,
  PaginateConfig,
  PaginateQuery,
} from "nestjs-paginate";
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
  defaultSortBy: [
    ["createdAt", "DESC"],
    ["id", "DESC"],
  ],
  searchableColumns: ["name", "user.name", "laboratory.name"],
  filterableColumns: {
    "state.name": [FilterOperator.EQ],
    "type.name": [FilterOperator.EQ],
    "laboratory.id": [FilterOperator.EQ],
    "user.id": [FilterOperator.EQ],
  },
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

  async create(dto: CreateReservationDto, user: Express.User) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const reservation = manager.create(Reservation, {
          ...dto,
          user: { id: user.id },
          laboratory: { id: dto.laboratoryId },
          type: { id: dto.typeId },
          state: { id: dto.stateId },
        });
        const savedReservation = await manager.save(reservation);

        const dates = this.generateOcupationDates(
          dto.startDate,
          dto.endDate,
          dto.rrule,
        );

        const ocupations = dates.map((date) => {
          return manager.create(Ocupation, {
            date: date,
            startHour: dto.defaultStartTime,
            endHour: dto.defaultEndTime,
            reservation: savedReservation,
            active: true,
          });
        });

        await manager.save(Ocupation, ocupations);

        return savedReservation;
      });
    } catch (error) {
      console.error("Detaile del error al crear reserva:", error);

      if (error.code === "23505") {
        throw new ConflictException(
          "El laboratorio ya está ocupado en una de las fechas seleccionadas.",
        );
      }
      throw new InternalServerErrorException(error.message);
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
  async search(query: PaginateQuery, user: Express.User) {
    const queryBuilder = this.reservationRepo.createQueryBuilder("reservation");

    if (user.role !== RoleEnum.ADMIN) {
      queryBuilder.where("reservation.user.id = :userId", { userId: user.id });
    }

    return await paginate(query, queryBuilder, RESERVATION_PAGINATION_CONFIG);
  }

  async findOne(id: number, user: Express.User) {
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

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (user.role !== RoleEnum.ADMIN && reservation.user?.id !== user.id) {
      throw new ForbiddenException("No tienes permiso para ver esta reserva");
    }

    return reservation;
  }

  async update(id: number, dto: UpdateReservationDto, user: Express.User) {
    await this.findOne(id, user); // Check if exists and user has permission

    const reservation = await this.reservationRepo.preload({
      ...dto,
      id,
      laboratory: dto.laboratoryId ? { id: dto.laboratoryId } : undefined,
      type: dto.typeId ? { id: dto.typeId } : undefined,
      state: dto.stateId ? { id: dto.stateId } : undefined,
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    return await this.reservationRepo.save(reservation);
  }

  async updateState(id: number, stateId: number, user: Express.User) {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ["user", "state"],
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (user.role !== RoleEnum.ADMIN) {
      if (reservation.user?.id !== user.id) {
        throw new ForbiddenException(
          "No tienes permiso para cambiar el estado de esta reserva",
        );
      }

      if (stateId !== ReservationStateEnum.CANCELADO) {
        throw new ForbiddenException(
          "Los usuarios solo pueden cancelar sus propias reservas",
        );
      }
    }

    reservation.state = { id: stateId } as any;

    if (stateId === ReservationStateEnum.APROBADO) {
      // APROBADO
      reservation.approvedAt = new Date();
    }

    return await this.reservationRepo.save(reservation);
  }

  async remove(id: number, user: Express.User) {
    const reservation = await this.findOne(id, user);
    return await this.reservationRepo.remove(reservation);
  }

  async getStats(user: Express.User) {
    const queryBuilder = this.reservationRepo
      .createQueryBuilder("reservation")
      .leftJoin("reservation.state", "state");

    if (user.role !== RoleEnum.ADMIN) {
      queryBuilder.where("reservation.user.id = :userId", { userId: user.id });
    }

    const raw = await queryBuilder
      .select([
        "COUNT(*) as total",
        "COUNT(*) FILTER (WHERE state.name = :pendiente) as pendientes",
        "COUNT(*) FILTER (WHERE state.name = :aprobada) as aprobadas",
        "COUNT(*) FILTER (WHERE state.name = :rechazada) as rechazadas",
        "COUNT(*) FILTER (WHERE state.name = :cancelada) as canceladas",
      ])
      .setParameters({
        pendiente: ReservationStateNames.PENDIENTE,
        aprobada: ReservationStateNames.APROBADO,
        rechazada: ReservationStateNames.RECHAZADO,
        cancelada: ReservationStateNames.CANCELADO,
      })
      .getRawOne();

    return new StatsDto({
      pendientes: Number(raw.pendientes) || 0,
      aprobadas: Number(raw.aprobadas) || 0,
      rechazadas: Number(raw.rechazadas) || 0,
      canceladas: Number(raw.canceladas) || 0,
      total: Number(raw.total) || 0,
    });
  }
}
