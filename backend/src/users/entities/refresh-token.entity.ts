import * as bcrypt from "bcrypt";
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { User } from "./user.entity.js";

@Entity()
@Index(["user", "createdAt"])
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text", { nullable: false })
  tokenHash: string;

  @ManyToOne(() => User, { onDelete: "CASCADE", nullable: false })
  user: Relation<User>;

  @CreateDateColumn()
  createdAt: Date;

  @Column("timestamptz", { nullable: false })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  isRevoked: boolean;

  validateHash(hash: string): Promise<boolean> {
    return bcrypt.compare(hash, this.tokenHash);
  }
}
