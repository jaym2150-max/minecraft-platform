import { IsString, IsOptional, IsBoolean, IsIn } from 'class-validator';

export class CreateMinecraftVersionDto {
  @IsString()
  version: string;

  @IsOptional()
  @IsIn(['release', 'snapshot', 'modded', 'beta', 'alpha'])
  type?: string;

  @IsOptional()
  @IsBoolean()
  stable?: boolean;
}
