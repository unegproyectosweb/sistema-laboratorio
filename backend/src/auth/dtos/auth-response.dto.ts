import { ApiProperty } from "@nestjs/swagger";
import { UserDto } from "./user.dto.js";

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  user: UserDto;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
