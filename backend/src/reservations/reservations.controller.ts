import { Controller, Get } from "@nestjs/common";
import { ZodResponse } from "nestjs-zod";
import { Auth } from "../auth/decorators/auth.decorator.js";
import { ReservationDto } from "./reservation.dto.js";
import { ReservationsService } from "./reservations.service.js";

@Auth()
@Controller("reservations")
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  @ZodResponse({ type: [ReservationDto] })
  async findAll(): Promise<ReservationDto[]> {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Additional delay
    return this.reservationsService.findAll();
  }
}
