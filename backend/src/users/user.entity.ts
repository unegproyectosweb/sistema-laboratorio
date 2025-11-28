import * as bcrypt from "bcrypt";
import { Exclude } from "class-transformer";
import { nanoid } from "nanoid";
import {
  BeforeInsert,
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Relation,
} from "typeorm";
import type { TokenPayload } from "../auth/token-payload.interface.js";
import { RefreshToken } from "./refresh-token.entity.js";

export enum RoleEnum {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class User {
  @PrimaryColumn("text", { default: () => `'${nanoid()}'` })
  id: string;

  @Column("text", { unique: true, nullable: false })
  username: string;

  @Column("text", { unique: true, nullable: true })
  email: string | null;

  @Exclude()
  @Column("text", { nullable: false })
  password: string;

  @Column("text")
  name: string;

  @Column("text", {
    default: RoleEnum.USER,
    nullable: false,
  })
  role: RoleEnum;

  @ManyToOne(() => RefreshToken, (token) => token.user)
  refreshTokens: Relation<RefreshToken>[];

  @BeforeInsert()
  async hashPassword() {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJwtPayload(): TokenPayload {
    return {
      sub: this.id,
      username: this.username,
      role: this.role,
    };
  }
}
