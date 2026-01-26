import { IsInt } from "class-validator";

export class StatsDto {
  @IsInt()
  pendientes: number;

  @IsInt()
  aprobadas: number;

  @IsInt()
  rechazadas: number;

  @IsInt()
  canceladas: number;

  @IsInt()
  total: number;

  constructor(partial: Partial<StatsDto>) {
    Object.assign(this, partial);
  }
}
