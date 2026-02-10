import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RoleEnum } from "@uneg-lab/api-types/auth";
import {
  ReservationStateEnum,
  ReservationStateNames,
} from "@uneg-lab/api-types/reservation";
import {
  FilterOperator,
  paginate,
  PaginateConfig,
  PaginateQuery,
} from "nestjs-paginate";
import * as pkgRRule from "rrule";
import { DataSource, EntityManager, Repository } from "typeorm";
import { StatsDto } from "./dto/stats.dto";
import { Ocupation } from "./entities/ocupation.entity";
import { Reservation } from "./entities/reservation.entity";
import { CreateReservationDto, UpdateReservationDto } from "./reservation.dto";

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

        await this.replaceOcupations({
          manager,
          reservation: savedReservation,
          startDate: dto.startDate,
          endDate: dto.endDate,
          rrule: dto.rrule,
          startHour: dto.defaultStartTime,
          endHour: dto.defaultEndTime,
        });

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

  private async replaceOcupations({
    manager,
    reservation,
    startDate,
    endDate,
    rrule,
    startHour,
    endHour,
  }: {
    manager: EntityManager;
    reservation: Reservation;
    startDate: string;
    endDate?: string;
    rrule?: string;
    startHour: string;
    endHour: string;
  }) {
    const dates = this.generateOcupationDates(startDate, endDate, rrule);

    const ocupations = dates.map((date) => {
      return manager.create(Ocupation, {
        date,
        startHour,
        endHour,
        reservation,
        active: true,
      });
    });

    await manager.save(Ocupation, ocupations);
  }

  private async updateOcupationHours(
    manager: EntityManager,
    reservationId: number,
    startHour: string,
    endHour: string,
  ) {
    await manager
      .createQueryBuilder()
      .update(Ocupation)
      .set({
        startHour,
        endHour,
      })
      .where("reservation_id = :id", { id: reservationId })
      .execute();
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
    const existingReservation = await this.reservationRepo.findOne({
      where: { id },
      relations: ["user"],
    });

    if (!existingReservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    if (
      user.role !== RoleEnum.ADMIN &&
      existingReservation.user?.id !== user.id
    ) {
      throw new ForbiddenException(
        "No tienes permiso para actualizar esta reserva",
      );
    }

    if (dto.userId && user.role !== RoleEnum.ADMIN) {
      throw new ForbiddenException(
        "No tienes permiso para reasignar esta reserva",
      );
    }

    const stateId = (dto as { stateId?: number }).stateId;
    if (stateId) {
      throw new ForbiddenException(
        "No puedes cambiar el estado desde la edición de la reserva",
      );
    }

    const reservation = await this.reservationRepo.preload({
      ...dto,
      id,
      laboratory: dto.laboratoryId ? { id: dto.laboratoryId } : undefined,
      type: dto.typeId ? { id: dto.typeId } : undefined,
      user: dto.userId ? { id: dto.userId } : undefined,
    });

    if (!reservation) {
      throw new NotFoundException(`Reserva con ID ${id} no encontrada`);
    }

    const shouldRebuildOcupations =
      typeof dto.startDate !== "undefined" ||
      typeof dto.endDate !== "undefined" ||
      typeof dto.rrule !== "undefined";

    const shouldUpdateHours =
      typeof dto.defaultStartTime !== "undefined" ||
      typeof dto.defaultEndTime !== "undefined";

    const normalizeDate = (value?: string | Date | null) => {
      if (!value) return undefined;
      if (typeof value === "string") return value;
      return value.toISOString().split("T")[0];
    };

    const startDate = normalizeDate(
      dto.startDate ?? existingReservation.startDate,
    );
    const endDate = normalizeDate(dto.endDate ?? existingReservation.endDate);
    const rrule = dto.rrule ?? existingReservation.rrule;

    try {
      return await this.dataSource.transaction(async (manager) => {
        const updatedReservation = await manager.save(Reservation, reservation);

        if (shouldRebuildOcupations) {
          await manager
            .createQueryBuilder()
            .delete()
            .from(Ocupation)
            .where("reservation_id = :id", { id })
            .execute();

          await this.replaceOcupations({
            manager,
            reservation: updatedReservation,
            startDate: startDate ?? new Date().toISOString().split("T")[0],
            endDate,
            rrule: rrule ?? undefined,
            startHour: updatedReservation.defaultStartTime,
            endHour: updatedReservation.defaultEndTime,
          });
        } else if (shouldUpdateHours) {
          await this.updateOcupationHours(
            manager,
            id,
            updatedReservation.defaultStartTime,
            updatedReservation.defaultEndTime,
          );
        }

        return updatedReservation;
      });
    } catch (error) {
      console.error("Detalle del error al actualizar reserva:", error);

      if (error.code === "23505") {
        throw new ConflictException(
          "El laboratorio ya está ocupado en una de las fechas seleccionadas.",
        );
      }

      throw new InternalServerErrorException(error.message);
    }
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
