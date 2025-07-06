// src/schema/verification-token.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';
@Schema({ timestamps: true })
export class VerificationToken extends Document {
  @Prop({ required: true })
  token: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ required: true , expires: 1000 * 60  }) // Token expires in 1 minute
  expiresAt: Date;
}

export const VerificationTokenSchema =
  SchemaFactory.createForClass(VerificationToken);
