import { IsString, IsOptional, IsUUID, IsArray } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  projectId: string;

  @IsArray()
  members: Array<{
    userId: string;
    role: TeamRole;
  }>;
}
