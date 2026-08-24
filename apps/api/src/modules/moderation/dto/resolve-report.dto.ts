import { IsOptional, IsIn, IsString } from 'class-validator';

export class ResolveReportDto {
  @IsIn(['RESOLVED', 'DISMISSED'])
  status: 'RESOLVED' | 'DISMISSED';

  @IsOptional()
  @IsString()
  resolution?: string;
}
