import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  q?: string = '';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  loader?: string;

  @IsOptional()
  @IsString()
  sort?: string;
}
