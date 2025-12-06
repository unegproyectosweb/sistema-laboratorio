import { UserType } from "@uneg-lab/api-types/auth.js";
import { User } from "../../users/entities/user.entity.js";

export class UserMapper {
  static toDto(user: User): UserType {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
