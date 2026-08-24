import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TeamRole } from '@prisma/client';

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class AddTeamMemberDto {
  @IsString()
  userId: string;

  @IsEnum(TeamRole)
  role: TeamRole;
}

export class UpdateTeamMemberDto {
  @IsEnum(TeamRole)
  role: TeamRole;
}
