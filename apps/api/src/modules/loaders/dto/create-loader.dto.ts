import { IsString, IsOptional, IsEnum } from 'class-validator';
import { LoaderType } from '@prisma/client';

export class CreateLoaderDto {
  @IsEnum(LoaderType)
  type: LoaderType;

  @IsOptional()
  @IsString()
  versionString?: string;

  @IsString()
  projectId: string;

  @IsString()
  versionId: string;
}
