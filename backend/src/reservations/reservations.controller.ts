import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import {
  Paginate,
  PaginatedSwaggerDocs,
  type PaginateQuery,
} from "nestjs-paginate";
import { PermissionEnum } from "../auth/auth.permissions.js";
import { Auth } from "../auth/decorators/auth.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { RequirePermissions } from "../auth/decorators/permissions.decorator.js";
import { StatsDto } from "./dto/stats.dto.js";
import { Reservation } from "./entities/reservation.entity.js";
import {
  CreateReservationDto,
  UpdateReservationDto,
} from "./reservation.dto.js";
import {
  RESERVATION_PAGINATION_CONFIG,
  ReservationsService,
} from "./reservations.service.js";

@Auth()
@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @RequirePermissions(PermissionEnum.CREATE_RESERVATIONS)
  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.reservationsService.create(createReservationDto, user);
  }

  @RequirePermissions(PermissionEnum.READ_RESERVATIONS)
  @Get()
  @PaginatedSwaggerDocs(Reservation, RESERVATION_PAGINATION_CONFIG)
  search(@Paginate() query: PaginateQuery, @CurrentUser() user: Express.User) {
    return this.reservationsService.search(query, user);
  }

  @RequirePermissions(PermissionEnum.READ_RESERVATIONS)
  @Get("stats")
  @ApiOkResponse({ type: StatsDto })
  getStats(@CurrentUser() user: Express.User): Promise<StatsDto> {
    return this.reservationsService.getStats(user);
  }

  @RequirePermissions(PermissionEnum.READ_RESERVATIONS)
  @Get(":id")
  findOne(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.reservationsService.findOne(id, user);
  }

  @RequirePermissions(PermissionEnum.UPDATE_RESERVATIONS)
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
    @CurrentUser() user: Express.User,
  ) {
    return this.reservationsService.update(id, updateReservationDto, user);
  }

  @Patch(":id/state")
  updateState(
    @Param("id", ParseIntPipe) id: number,
    @Body("stateId", ParseIntPipe) stateId: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.reservationsService.updateState(id, stateId, user);
  }

  @RequirePermissions(PermissionEnum.DELETE_RESERVATIONS)
  @Delete(":id")
  remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: Express.User,
  ) {
    return this.reservationsService.remove(id, user);
  }
}
