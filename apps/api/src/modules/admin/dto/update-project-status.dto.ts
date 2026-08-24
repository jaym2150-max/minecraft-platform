import { IsIn } from 'class-validator';

export class UpdateProjectStatusDto {
  @IsIn(['DRAFT', 'SUBMITTED', 'PUBLISHED', 'ARCHIVED', 'REJECTED'])
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED' | 'ARCHIVED' | 'REJECTED';
}
