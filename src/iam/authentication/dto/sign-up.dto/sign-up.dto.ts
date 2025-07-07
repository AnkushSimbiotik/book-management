import { IsEmail, IsNotEmpty, IsStrongPassword, MinLength, Validate , ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, IsString, Matches, IsBoolean} from 'class-validator';
import { MatchPasswordConstraint } from 'src/common/validators/match-password.validator';
export class SignUpDto {

    @IsString()
    username: string;

    @IsEmail()
    email: string;

    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/, 
        { message: 'Password must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character' })
    @IsString()
    password: string;

    @IsNotEmpty({ message: 'Confirm password is required' })
  @MinLength(8, { message: 'Confirm password must be at least 8 characters long' })
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
  confirmPassword: string;

    @IsBoolean()
    isVerified: boolean;
   
   
    

    
}
