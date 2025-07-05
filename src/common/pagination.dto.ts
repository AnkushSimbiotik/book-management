// src/common/pagination.dto.ts
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Page number must be a positive number' })
  offset?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Limit must be a positive number' })
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @Matches(/^(\w+:(asc|desc))(,\w+:(asc|desc))*$/, {
    message:
      "Sort must be in format like 'genre:asc' or 'genre:desc,description:asc'",
  })
  sort?: string;
}
