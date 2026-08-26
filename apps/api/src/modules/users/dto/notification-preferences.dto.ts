import { IsObject, IsBoolean } from 'class-validator';

export class NotificationPreferencesDto {
  @IsObject()
  preferences: Record<string, boolean>;
}
