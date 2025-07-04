import { PartialType } from "@nestjs/mapped-types";

// create-book.dto.ts
export class CreateBookDto {
  title: string;
  author: string;
  topics: string[]; // array of Topic IDs
}
export class UpdateBookDto extends PartialType(CreateBookDto) {}