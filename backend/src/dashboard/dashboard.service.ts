import { Injectable } from "@nestjs/common";
import PDFDocument from "pdfkit";
import { ReservationsService } from "../reservations/reservations.service.js";

@Injectable()
export class DashboardService {
  constructor(private readonly reservationsService: ReservationsService) {}

  async generatePdf(user: Express.User): Promise<Buffer> {
    const { data: reservas } = await this.reservationsService.search(
      { path: "", limit: 1000 },
      user,
    );
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc
        .fontSize(20)
        .text("Sistema de Reservas Laboratorio UNEG", { align: "center" });
      doc.moveDown();
      doc
        .fontSize(14)
        .text("Reporte de solicitudes de reserva", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(10);
      reservas.forEach((r, i) => {
        doc.text(`${i + 1}. ${r.nombre}`, { continued: false });
        doc.text(`   Fecha: ${r.fecha} | Estado: ${r.estado}`);
        doc.text(`   ${r.descripcion}`);
        doc.moveDown(0.5);
      });

      doc.end();
    });
  }
}
