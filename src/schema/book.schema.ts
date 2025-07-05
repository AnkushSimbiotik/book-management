import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsDataURI } from "class-validator";
import { Types } from "mongoose";

@Schema({
  toJSON: { virtuals: true },
})
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: [{ type: Types.ObjectId,ref: 'Topic', }] })
  topics: Types.ObjectId[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({default : Date.now()})
    @IsDataURI({})
    createdAt: Date;
  
    @Prop({ default: Date.now() })
    updatedAt: Date;
  

  
}

export const BookSchema = SchemaFactory.createForClass(Book);