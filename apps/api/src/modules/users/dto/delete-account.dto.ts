import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  password: string;
}
