import { IsString, IsOptional, IsBoolean, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateCollectionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
