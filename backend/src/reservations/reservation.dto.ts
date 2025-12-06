import { ReservationSchema } from "@uneg-lab/api-types/reservation.js";
import { createZodDto } from "nestjs-zod";

export class ReservationDto extends createZodDto(ReservationSchema) {}
