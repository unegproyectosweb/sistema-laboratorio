import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "laboratories" })
export class Laboratory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  name: string;

  @Column("int")
  number: number;

  @Column("boolean", { default: true })
  active: boolean;
}
