import { RoleEnum } from "@uneg-lab/api-types/auth.js";
import * as argon2 from "argon2";
import { Exclude } from "class-transformer";
import { nanoid } from "nanoid";
import {
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  type Relation,
} from "typeorm";
import type { TokenPayload } from "../../auth/token-payload.interface.js";
import { RefreshToken } from "./refresh-token.entity.js";

@Entity()
export class User {
  @PrimaryColumn({ type: "text" })
  id: string;

  @Column("text", { unique: true })
  username: string;

  @Column("text", { unique: true, nullable: true })
  email: string | null;

  @Exclude()
  @Column("text")
  password: string;

  @Column("text")
  name: string;

  @Column("text", { default: RoleEnum.USER })
  role: RoleEnum;

  @OneToMany(() => RefreshToken, (token) => token.user)
  refreshTokens: Relation<RefreshToken>[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }

  toJwtPayload(): TokenPayload {
    return {
      sub: this.id,
      username: this.username,
      role: this.role,
    };
  }

  @BeforeInsert()
  generateId() {
    if (!this.id) {
      this.id = nanoid();
    }
  }
}
