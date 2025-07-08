import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from './user.schema';

export type OtpTokenDocument = HydratedDocument<OtpToken>;

@Schema({ timestamps: true })
export class OtpToken {
  @Prop({ required: true })
  otp: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  expiresAt: Date;
}

export const OtpTokenSchema = SchemaFactory.createForClass(OtpToken);