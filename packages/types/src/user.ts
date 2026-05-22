export enum UserRole {
  USER = 'USER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
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
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends Omit<User, 'email' | 'emailVerified'> {
  projectCount: number;
  totalDownloads: number;
}
