import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { Repository } from "typeorm";
import {
  BCRYPT_SALT_ROUNDS,
  MAX_ACTIVE_REFRESH_SESSIONS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from "../../auth/auth.constants.js";
import { RefreshToken } from "../entities/refresh-token.entity.js";

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokensRepository: Repository<RefreshToken>,
  ) {}

  async create(userId: string, oldRefreshTokenId: string | null) {
    const { token, hash } = await this.getHashedToken();

    const newTokenId = await this.saveAndTrimSessions({
      userId,
      oldRefreshTokenId,
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
      tokenHash: hash,
    });

    return `${newTokenId}.${token}`;
  }

  async validate(
    refreshToken: string | undefined,
  ): Promise<RefreshToken | null> {
    if (!refreshToken) return null;

    const [id, hash] = refreshToken.split(".", 2);
    if (!id || !hash) return null;

    const qb = this.refreshTokensRepository.createQueryBuilder("tokens");

    const [stored] = await qb
      .where({ id })
      .leftJoinAndSelect("tokens.user", "user")
      .getMany();

    if (!stored) {
      throw new UnauthorizedException({
        message: "Invalid refresh token",
        code: "INVALID_TOKEN",
      });
    }

    if (stored.isRevoked) {
      throw new UnauthorizedException({
        message: "Session has been revoked",
        code: "INVALID_TOKEN",
      });
    }

    if (stored.expiresAt < new Date()) {
      throw new UnauthorizedException({
        message: "Refresh token has expired",
        code: "EXPIRED_TOKEN",
      });
    }

    const isMatching = await stored.validateHash(hash);
    if (!isMatching) return null;

    return stored;
  }

  async dispose(refreshToken: string) {
    try {
      const token = await this.validate(refreshToken);
      if (token) {
        await this.refreshTokensRepository.delete(token.id);
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        // Token is already invalid, nothing to do
      } else {
        throw error;
      }
    }
  }

  private async getHashedToken() {
    const token = randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(token, BCRYPT_SALT_ROUNDS);
    return { token, hash };
  }

  private async saveAndTrimSessions({
    userId,
    oldRefreshTokenId,
    maxAge,
    tokenHash,
  }: {
    userId: string;
    oldRefreshTokenId: string | null;
    maxAge: number;
    tokenHash: string;
  }): Promise<string | null> {
    const mainQb = this.refreshTokensRepository.createQueryBuilder("tokens");
    if (oldRefreshTokenId) {
      mainQb.addCommonTableExpression(
        this.refreshTokensRepository
          .createQueryBuilder()
          .delete()
          .where("id = :oldRefreshTokenId", { oldRefreshTokenId }),
        "deleted_old_token",
      );
    }

    const deletedTokensQuery = this.refreshTokensRepository
      .createQueryBuilder()
      .delete()
      .where(
        `id IN (${this.refreshTokensRepository
          .createQueryBuilder("tokens")
          .subQuery()
          .select("tokens.id")
          .from(RefreshToken, "tokens")
          .where("tokens.userId = :userId")
          .andWhere("NOT tokens.isRevoked")
          .andWhere("tokens.expiresAt > NOW()")
          .orderBy("tokens.createdAt", "DESC")
          .addOrderBy("tokens.id", "DESC")
          .offset(MAX_ACTIVE_REFRESH_SESSIONS)
          .getQuery()})`,
        { userId },
      );

    const query = mainQb
      .addCommonTableExpression(deletedTokensQuery, "deleted_tokens")
      .insert()
      .values({
        tokenHash,
        expiresAt: new Date(Date.now() + maxAge),
        user: { id: userId },
      })
      .returning("id");

    const result = await query.execute();

    return result.raw[0]!.id! as string;
  }
}
