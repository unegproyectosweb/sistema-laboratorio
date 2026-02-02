import { MigrationInterface, QueryRunner } from "typeorm";

export class OcupationCascade1769994344114 implements MigrationInterface {
    name = 'OcupationCascade1769994344114'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ocupations" DROP CONSTRAINT "FK_4b714458ce89c08974d00bee116"
        `);
        await queryRunner.query(`
            ALTER TABLE "ocupations"
            ADD CONSTRAINT "FK_4b714458ce89c08974d00bee116" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "ocupations" DROP CONSTRAINT "FK_4b714458ce89c08974d00bee116"
        `);
        await queryRunner.query(`
            ALTER TABLE "ocupations"
            ADD CONSTRAINT "FK_4b714458ce89c08974d00bee116" FOREIGN KEY ("reservation_id") REFERENCES "reservations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
