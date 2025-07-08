// src/common/pagination.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Matches } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({required : false })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Page number must be a positive number' })
  offset?: number = 1;

  @ApiPropertyOptional({required : false })
  @IsOptional()
  @Type(() => Number)
  @IsPositive({ message: 'Limit must be a positive number' })
  limit?: number = 10;

  @ApiPropertyOptional({required : false })
  @IsOptional()
  @IsString()
  @Matches(/^(\w+:(asc|desc))(,\w+:(asc|desc))*$/, {
    message:
      "Sort must be in format like 'genre:asc' or 'genre:desc,description:asc'",
  })
  sort?: string;
}
