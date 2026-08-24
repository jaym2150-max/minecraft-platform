export enum NotificationType {
  PROJECT_UPDATE = 'PROJECT_UPDATE',
  VERSION_RELEASE = 'VERSION_RELEASE',
  REVIEW = 'REVIEW',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  TEAM_INVITE = 'TEAM_INVITE',
  MODERATION = 'MODERATION',
  PAYOUT = 'PAYOUT',
  SYSTEM = 'SYSTEM',
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}
