import {
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdatePasswordDto {
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
}
