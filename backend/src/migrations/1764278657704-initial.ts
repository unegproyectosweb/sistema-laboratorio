import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1764278657704 implements MigrationInterface {
    name = 'Initial1764278657704'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tokenHash" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "isRevoked" boolean NOT NULL DEFAULT false, "userId" text NOT NULL, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6d6dae9dd488f628af469bf3ce" ON "refresh_token" ("userId", "createdAt") `);
        await queryRunner.query(`CREATE TABLE "user" ("id" text NOT NULL DEFAULT 'tnl_znzzEMcm1kAaAKK7n', "username" text NOT NULL, "email" text, "password" text NOT NULL, "name" text NOT NULL, "role" text NOT NULL DEFAULT 'user', "refreshTokensId" uuid, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT '5G4Y8ZiFHsL3F25KFxXyd'`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_6358c15fd858c79a45514caa3ef" FOREIGN KEY ("refreshTokensId") REFERENCES "refresh_token"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_6358c15fd858c79a45514caa3ef"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "id" SET DEFAULT 'tnl_znzzEMcm1kAaAKK7n'`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d6dae9dd488f628af469bf3ce"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
