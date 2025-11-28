import { ApiProperty } from "@nestjs/swagger";
import { RoleEnum } from "../auth.permissions.js";

export class UserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string | null;

  @ApiProperty()
  name: string;

  @ApiProperty()
  role: RoleEnum;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
