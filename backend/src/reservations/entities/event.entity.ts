import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import type { Relation } from "typeorm";
import { Reservation } from "./reservation.entity.js";

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { name: "stimated_assistants" })
  stimatedAssistants: number;

  @OneToOne(() => Reservation, (reservation) => reservation.event, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "reservation_id" })
  reservation: Relation<Reservation>;
}
