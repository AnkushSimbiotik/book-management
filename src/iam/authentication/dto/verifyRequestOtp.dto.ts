import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class VerifyResetOtpDto {
  @ApiProperty({required : true , description : "Enter your registerd email"})
  @IsEmail()
  email: string;

  @ApiProperty({required : true })
  @IsString()
  @Length(6, 6)
  otp: string;
}