import { IsIn, IsString } from 'class-validator';

export class ChangeTierDto {
  @IsString()
  @IsIn(['FREE', 'CREATOR', 'PRO'])
  tier: string;
}
