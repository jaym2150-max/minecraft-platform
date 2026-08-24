import { IsString, IsOptional, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @MinLength(1, { message: 'Comment content is required' })
  @MaxLength(2000, { message: 'Comment must be 2000 characters or fewer' })
  content: string;

  @IsUUID()
  projectId: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}
