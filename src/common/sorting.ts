import { IsOptional, IsString, IsIn } from "class-validator";

export class SortingDto {
  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc';
}