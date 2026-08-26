import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsUUID,
  MinLength,
} from 'class-validator';
import { LoaderType, VersionStatus } from '@prisma/client';

export class CreateVersionDto {
  @IsString()
  @MinLength(1, { message: 'Version string is required' })
  version: string;

  @IsOptional()
  @IsString()
  changelog?: string;

  /**
   * The platform-managed upload id returned by POST /uploads. The server
   * resolves the fileUrl/fileSize/hash from the persisted ProjectVersion
   * stub that the upload flow created and the virus scanner cleared. The
   * client MUST NOT supply fileUrl/hash directly — that would let a
   * (compromised) author point downloads at attacker-controlled content
   * while reporting a benign hash.
   */
  @IsString()
  @IsUUID('4', { message: 'uploadId must be a valid UUID' })
  uploadId: string;

  @IsNumber()
  fileSize: number;

  @IsOptional()
  @IsEnum(VersionStatus)
  status?: VersionStatus;

  @IsArray()
  @IsEnum(LoaderType, { each: true })
  loaders: LoaderType[];

  @IsOptional()
  @IsString()
  minecraftVersionId?: string;

  @IsOptional()
  @IsArray()
  dependencies?: Array<{
    projectId: string;
    required: boolean;
  }>;

  @IsOptional()
  @IsBoolean()
  clientSide?: boolean;

  @IsOptional()
  @IsBoolean()
  serverSide?: boolean;
}
