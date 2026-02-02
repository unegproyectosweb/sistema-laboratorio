import { MigrationInterface, QueryRunner } from "typeorm";

export class Cascade1769994421736 implements MigrationInterface {
    name = 'Cascade1769994421736'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "FK_6c80056680d2a9f6957c75c823b"
        `);
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_533c4577ca9237da25428cd9a95"
        `);
        await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "FK_6c80056680d2a9f6957c75c823b" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_533c4577ca9237da25428cd9a95" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "events" DROP CONSTRAINT "FK_533c4577ca9237da25428cd9a95"
        `);
        await queryRunner.query(`
            ALTER TABLE "classes" DROP CONSTRAINT "FK_6c80056680d2a9f6957c75c823b"
        `);
        await queryRunner.query(`
            ALTER TABLE "events"
            ADD CONSTRAINT "FK_533c4577ca9237da25428cd9a95" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "classes"
            ADD CONSTRAINT "FK_6c80056680d2a9f6957c75c823b" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
