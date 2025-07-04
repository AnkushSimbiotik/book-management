import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDataURI, IsEmail, IsStrongPassword, Matches, MinLength } from 'class-validator';

@Schema({
  toJSON: {
    virtuals: true,
  },
})
export class User {
  @Prop({})
  username: string;

  @Prop({ required: true, type: String })
  @IsEmail()
  email: string;

  @Prop({ required: true })
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

  @Prop({default : Date.now()})
  @IsDataURI({})
  createdAt: Date;

  @Prop({ default: Date.now() })
  updatedAt: Date;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  verificationToken: string;

  @Prop()
  verificationCode: string;

  @Prop()
  verificationCodeExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
