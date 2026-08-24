import { IsUUID, IsBoolean, IsOptional } from 'class-validator';

export class CreateDependencyDto {
  @IsUUID()
  requiredId: string;

  @IsUUID()
  versionId: string;

  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}

export class UpdateDependencyDto {
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @IsOptional()
  @IsBoolean()
  isOptional?: boolean;
}
