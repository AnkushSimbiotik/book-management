import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  roles?: string[]; // Optional, can be used for user roles
}
export class UpdateUserDto extends PartialType(CreateUserDto) {}
