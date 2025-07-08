import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({required : true })
  @IsString()
  genre: string;

  @ApiProperty({required : true })
  @IsString()
  description: string;

  @ApiProperty({description : "Created by ?"})
  @IsString()
  createdBy : string
}
export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  id: string;
}
