import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LaboratoriesService } from "./laboratories.service";
import { LaboratoriesController } from "./laboratories.controller";
import { Laboratory } from "./entities/laboratory.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Laboratory])],
  controllers: [LaboratoriesController],
  providers: [LaboratoriesService],
  exports: [LaboratoriesService],
})
export class LaboratoriesModule {}
