import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiKeyScope } from '@prisma/client';

export class CreateApiKeyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(ApiKeyScope, { each: true })
  scopes?: ApiKeyScope[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ipAllowlist?: string[];
}
