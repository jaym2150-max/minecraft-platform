export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
}

export enum CreatorTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  PRO = 'PRO',
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  email: string;
  emailVerified: boolean;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  creatorTier?: CreatorTier;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends Omit<User, 'email' | 'emailVerified'> {
  projectCount: number;
  totalDownloads: number;
}

export interface AuthUser extends Pick<User, 'id' | 'username' | 'email' | 'role'> {
}