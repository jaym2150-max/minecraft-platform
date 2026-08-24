import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}
