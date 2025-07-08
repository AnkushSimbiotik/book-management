import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';

export class CreateBookDto {
  @ApiProperty({ required: true })
  @IsString()
  title: string;

  @ApiProperty({ required: true })
  @IsString() // ✅ Add this
  author: string;

  @ApiProperty({
    required: true,
    type: [String],
    description: 'Array of Topic MongoDB ObjectIds',
  })
  @IsArray() // ✅ Add this
  @ArrayNotEmpty()
  @IsMongoId({ each: true }) // ✅ If you expect MongoDB IDs
  topics: string[];

  @ApiProperty({description : "Created by ?"})
  @IsString()
  createdBy : string
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}
