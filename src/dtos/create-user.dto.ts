import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {

  @ApiProperty({required : true })
  username: string;
  @ApiProperty({required : true })
  email: string;
  @ApiProperty({required : true })
  password: string;
  @ApiProperty({required : true })

  @ApiPropertyOptional({required : false})
  roles?: string[]; // Optional, can be used for user roles
}
export class UpdateUserDto extends PartialType(CreateUserDto) {}
