import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  MinLength,
} from "class-validator";
import { PartialType } from "@nestjs/mapped-types";

export class CreateLaboratoryDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  number: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateLaboratoryDto extends PartialType(CreateLaboratoryDto) {}
