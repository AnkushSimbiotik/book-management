import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Min, MinLength, Validate } from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';

export class SignInDto {
  @ApiProperty({ required: true })
  @IsEmail()
  email: string;

  @ApiProperty({
    required: true,
    description: 'Password of the user',
    
  })
  @MinLength(8)
  password: string;

  @ApiProperty({ required: true , description : "Should be same as password" })
  @MinLength(8)
  @Validate(MatchPasswordConstraint, ['password'])
  confirmPassword: string;
}
