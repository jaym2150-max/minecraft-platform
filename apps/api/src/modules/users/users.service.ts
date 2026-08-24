import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User, UserRole } from '@mcp/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  private formatUser(user: any): User {
    // SECURITY: never surface the password hash. Previously the full Prisma row
    // (including passwordHash) was spread into the returned object, which then
    // flowed into `req.user` via JwtStrategy and leaked into API responses.
    // Selecting it out explicitly is more robust than trusting callers.
    const { passwordHash, ...rest } = user;
    void passwordHash;
    return {
      ...rest,
      displayName: user.displayName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      bio: user.bio ?? undefined,
      role: user.role as UserRole,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
    displayName?: string;
    role?: UserRole;
  }): Promise<User> {
    const existingUsername = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        role: data.role ?? UserRole.USER,
      },
    });

    return this.formatUser(user);
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.formatUser(user);
  }

  async findOneByUsername(username: string): Promise<User & { followerCount: number; followingCount: number } | null> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        emailVerified: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followers: true,
            following: true
          }
        }
      }
    });
    
    if (!user) return null;

    const result: any = {
      ...user,
      displayName: user.displayName ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      bio: user.bio ?? undefined,
      followerCount: user._count.followers,
      followingCount: user._count.following,
    };
    delete result._count;
    return result as User & { followerCount: number; followingCount: number };
  }

  /**
   * Build a public-safe profile for an arbitrary viewer. This MUST NOT include
   * the email address, email-verified flag, or any internal timestamps — the
   * public `/users/:username` endpoint is reachable without authentication,
   * so exposing those lets anyone enumerate accounts and confirm emails.
   */
  toPublicProfile(user: User & { followerCount?: number; followingCount?: number }): {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    bio?: string;
    role: UserRole;
    followerCount?: number;
    followingCount?: number;
  } {
    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      role: user.role,
      followerCount: user.followerCount ?? undefined,
      followingCount: user.followingCount ?? undefined,
    };
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.formatUser(user);
  }

  async findByEmailInternal(email: string): Promise<any> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  /**
   * Fetch only the password hash for a user, used for re-verification before a
   * destructive action (account deletion). Kept separate from the public
   * formatUser() path so the hash is never accidentally carried into req.user.
   */
  async getPasswordHash(id: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { passwordHash: true },
    });
    return user?.passwordHash ?? null;
  }

  async update(id: string, data: Partial<{
    username: string;
    email: string;
    displayName?: string | null;
    bio?: string | null;
    avatarUrl?: string | null;
  }>): Promise<User> {
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.formatUser(updatedUser);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(
    password: string,
    passwordHash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  }
}
