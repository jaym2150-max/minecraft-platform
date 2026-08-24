import { IsString, IsOptional, IsInt, IsEnum, Min } from 'class-validator';
import { GalleryItemType } from '@prisma/client';

export class CreateGalleryItemDto {
  @IsOptional()
  @IsEnum(GalleryItemType)
  type?: GalleryItemType;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}

export class UpdateGalleryItemDto {
  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @IsOptional()
  @IsEnum(GalleryItemType)
  type?: GalleryItemType;
}

export class ReorderGalleryDto {
  @IsString({ each: true })
  ids!: string[];
}
