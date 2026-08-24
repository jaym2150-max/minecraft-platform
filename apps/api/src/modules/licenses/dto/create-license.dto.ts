import { IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { LicenseType } from '@prisma/client';

export class CreateLicenseDto {
  @IsString()
  @MaxLength(64)
  shortId: string;

  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsEnum(LicenseType)
  type?: LicenseType;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}
