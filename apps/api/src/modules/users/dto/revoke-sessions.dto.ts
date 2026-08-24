import { IsOptional, IsString } from 'class-validator';

export class RevokeSessionsDto {
  @IsOptional()
  @IsString()
  currentSessionId?: string;
}