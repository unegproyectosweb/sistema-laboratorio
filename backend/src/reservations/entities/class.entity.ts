import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Reservation } from "./reservation.entity.js";

@Entity({ name: "classes" })
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  professor: string;

  @OneToOne(() => Reservation, (reservation) => reservation.classInstance, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "reservation_id" })
  reservation: Relation<Reservation>;
}
