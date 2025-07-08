import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsStrongPassword,
  MinLength,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsString,
  Matches,
  IsBoolean,
} from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';
export class SignUpDto {
  @ApiProperty({
    description: 'Username of the user',
    example: 'Akshay',
    minLength: 1,
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password (min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 symbol)',
    example: 'Ankush@123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Must match the password field',
    example: 'Ankush@123',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(8, {
    message: 'Confirm password must be at least 8 characters long',
  })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Confirm password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character',
    },
  )
  @Validate(MatchPasswordConstraint, ['password'], {
    message: 'Confirm password must match password',
  })
  confirmPassword : string

  @ApiProperty()
  @IsString()
  isVerified: string;
}
