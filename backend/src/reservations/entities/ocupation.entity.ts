import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";

import { Reservation } from "./reservation.entity.js";

@Entity({ name: "ocupations" })
@Index(["reservation", "date", "startHour"], { unique: true })
export class Ocupation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("date", { nullable: false })
  date: Date;

  @Column("time", { name: "start_hour", nullable: false })
  startHour: string;

  @Column("time", { name: "end_hour", nullable: false })
  endHour: string;

  @Column("boolean", { default: true })
  active: boolean;

  @ManyToOne(() => Reservation, (reservation) => reservation.ocupations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "reservation_id" })
  reservation: Relation<Reservation>;
}
