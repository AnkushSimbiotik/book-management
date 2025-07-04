import { IsBoolean, IsEmail, IsString, Matches, MinLength } from "class-validator";

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

    @IsBoolean()
    isVerified: boolean;
   
   
    

    
}
