export enum ThreadType {
  PROJECT_REPORT = 'PROJECT_REPORT',
  USER_REPORT = 'USER_REPORT',
  VERSION_REPORT = 'VERSION_REPORT',
  MODERATION = 'MODERATION',
  DMCA = 'DMCA',
  APPEAL = 'APPEAL',
  DIRECT_MESSAGE = 'DIRECT_MESSAGE',
  TEAM_INVITE = 'TEAM_INVITE',
}

export type ThreadStatus = 'open' | 'closed' | 'archived';

export interface Thread {
  id: string;
  type: ThreadType;
  subjectId?: string;
  subjectType?: string;
  initiatorId: string;
  title: string;
  status: ThreadStatus;
  lastMessageAt: string;
  closedAt?: string;
  closedById?: string;
  createdAt: string;
  updatedAt: string;
  messages?: ThreadMessage[];
  participants?: ThreadParticipant[];
}

export interface ThreadMessage {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  hidden: boolean;
  createdAt: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export interface ThreadParticipant {
  id: string;
  threadId: string;
  userId: string;
  joinedAt: string;
  lastReadAt?: string;
  role: string;
}
