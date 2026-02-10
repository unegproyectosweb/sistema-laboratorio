import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { Auth } from "../auth/decorators/auth.decorator.js";
import { CurrentUser } from "../auth/decorators/current-user.decorator.js";
import { DashboardService } from "./dashboard.service.js";

@Auth()
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("pdf")
  async getPdf(
    @Res({ passthrough: false }) res: Response,
    @CurrentUser() user: Express.User,
  ) {
    const buffer = await this.dashboardService.generatePdf(user);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="reservas-uneg.pdf"',
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  }
}
