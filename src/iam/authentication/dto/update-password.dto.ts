import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsStrongPassword,
  MinLength,
  Validate,
} from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';

export class UpdatePasswordDto {

  @ApiProperty({required : true , description : "Enter your old Password" })
  @IsString()
  oldPassword : string

  @ApiProperty({required : true , description : "Enter your new Password" })
  @IsString()
  @MinLength(8)
  @IsStrongPassword({
    minLength: 8,
    minUppercase: 1,
    minLowercase: 1,
    minSymbols: 1,
    minNumbers: 1,
  }, { message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character' })
  newPassword: string;


  @IsStrongPassword()
  @Validate(MatchPasswordConstraint, ['newPassword'])
  @IsString()
  confirmPassword : string
}
