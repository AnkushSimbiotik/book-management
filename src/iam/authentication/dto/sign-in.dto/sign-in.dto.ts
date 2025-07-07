import { IsEmail, Min, MinLength, Validate } from "class-validator";
import { MatchPasswordConstraint } from "src/common/validators/match-password.validator";

export class SignInDto {

    @IsEmail()
   email : string

   @MinLength(8)
    password: string;

    @MinLength(8)
    @Validate(MatchPasswordConstraint , ['password'])
    confirmPassword : string
}
