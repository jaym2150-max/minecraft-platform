import { IsString, IsOptional, MaxLength, IsNotEmpty } from 'class-validator';

export class AddProjectDto {
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}
