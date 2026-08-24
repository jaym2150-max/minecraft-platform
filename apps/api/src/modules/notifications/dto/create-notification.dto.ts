import { IsString, IsOptional, IsIn } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class CreateNotificationDto {
  @IsString()
  userId: string;

  @IsIn(Object.values(NotificationType) as string[])
  type: NotificationType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  body?: string;
}
