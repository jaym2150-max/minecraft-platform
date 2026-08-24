import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsUUID,
} from 'class-validator';
import { LoaderType, ProjectType } from '@mcp/types';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @IsOptional()
  @IsString()
  discordUrl?: string;

  @IsOptional()
  @IsString()
  wikiUrl?: string;

  @IsOptional()
  @IsBoolean()
  clientSide?: boolean;

  @IsOptional()
  @IsBoolean()
  serverSide?: boolean;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(LoaderType, { each: true })
  loaders?: LoaderType[];

  @IsOptional()
  @IsEnum(ProjectType)
  projectType?: ProjectType;
}