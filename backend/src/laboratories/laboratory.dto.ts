import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  MinLength,
} from "class-validator";

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

import { PartialType } from "@nestjs/mapped-types";
export class UpdateLaboratoryDto extends PartialType(CreateLaboratoryDto) {}
