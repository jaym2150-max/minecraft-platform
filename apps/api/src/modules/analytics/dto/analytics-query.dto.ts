import { IsOptional, IsString, IsIn } from 'class-validator';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['7d', '30d', '90d', '1y', 'all'])
  period?: string = '30d';
}