import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword, MinLength, Validate } from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';

export class ResetPasswordDto {

  @ApiProperty({required : true})
  @IsEmail()
  email: string;

  @ApiProperty({required : true })
  @IsString()
  @IsStrongPassword(
    {
      minLength: 8,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  newPassword: string;


  @ApiProperty({required : true })
   @IsString()
  @MinLength(8)
  @Validate(MatchPasswordConstraint, ['password'])
  confirmPassword: string;
}
