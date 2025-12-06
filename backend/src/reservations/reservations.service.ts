import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservation } from "./entities/reservation.entity.js";
import { Repository } from "typeorm";

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private reservationsRepository: Repository<Reservation>,
  ) {}

  async findAll() {
    return [
      {
        id: 3,
        nombre: "Carlos López",
        fecha: "19/11/2025",
        estado: "Pendiente",
        descripcion: "Reserva para reunión de equipo",
      },
      {
        id: 4,
        nombre: "Ana Martínez",
        fecha: "21/11/2025",
        estado: "Aprobada",
        descripcion: "Reserva de sala de conferencias",
      },
      {
        id: 5,
        nombre: "Carlos López",
        fecha: "19/11/2025",
        estado: "Pendiente",
        descripcion: "Reserva para reunión de equipo",
      },
      {
        id: 6,
        nombre: "Ana Martínez",
        fecha: "21/11/2025",
        estado: "Aprobada",
        descripcion: "Reserva de sala de conferencias",
      },
    ];
  }
}
