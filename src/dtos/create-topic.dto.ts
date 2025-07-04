import { PartialType } from '@nestjs/mapped-types';

export class CreateTopicDto {
  genre: string;
  description: string;
}
export class UpdateTopicDto extends PartialType(CreateTopicDto) {
  id: string;
}
