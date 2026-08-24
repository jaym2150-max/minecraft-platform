import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsString()
  reportedId: string;

  @IsIn(['project', 'user', 'comment', 'version'])
  type: 'project' | 'user' | 'comment' | 'version';

  @IsString()
  @MaxLength(500)
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
