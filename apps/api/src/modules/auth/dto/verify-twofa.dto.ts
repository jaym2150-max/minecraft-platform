import { IsString, IsNotEmpty, Length } from 'class-validator';

export class VerifyTwoFADto {
  @IsString({ message: 'Verification code must be a string' })
  @IsNotEmpty({ message: 'Verification code is required' })
  @Length(6, 8, { message: 'Verification code must be 6-8 characters' })
  code: string;
}
