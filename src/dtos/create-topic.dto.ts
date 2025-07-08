import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTopicDto {
  @ApiProperty({required : true })
  genre: string;
  @ApiProperty({required : true })
  description: string;
}
export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  id: string;
}
