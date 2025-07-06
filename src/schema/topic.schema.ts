import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsDataURI } from 'class-validator';
import { Types } from 'mongoose';

@Schema({
  toJSON: {
    virtuals: true,
  },
  timestamps : true
})
export class Topic {
  id: string;

  @Prop({ required: true })
  genre: string;

  @Prop({ required: true })
  description: string;
  
  @Prop({ default: false })
isDeleted: boolean;

 @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

 
  
}

export const TopicSchema = SchemaFactory.createForClass(Topic);