import { Module } from "@nestjs/common";
import { DashboardController } from "./dashboard.controller.js";
import { DashboardService } from "./dashboard.service.js";
import { ReservationsModule } from "../reservations/reservations.module.js";

@Module({
  imports: [ReservationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
