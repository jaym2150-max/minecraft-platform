import { IsBoolean } from 'class-validator';

export class UpdateProjectFeatureDto {
  @IsBoolean()
  featured: boolean;
}
