import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

/**
 * Permission keys are dotted namespaces: `domain.verb`.
 * Listed in `seedDefaults` so the catalog is self-documenting.
 */
export const PERMISSION_KEYS = [
  'project.create',
  'project.publish',
  'project.feature',
  'project.delete',
  'comment.delete',
  'review.delete',
  'thread.report.resolve',
  'user.ban',
  'user.change_role',
  'user.grant_permission',
  'modpack.publish',
  'guide.publish',
  'admin.access',
] as const;

export type PermissionKey = (typeof PERMISSION_KEYS)[number];

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Defaults: a tiny role matrix that mirrors the existing `@Roles()` guard. */
  private static readonly DEFAULT_ROLE_MATRIX: Record<UserRole, ReadonlySet<PermissionKey>> = {
    USER: new Set<PermissionKey>(['project.create']),
    MODERATOR: new Set<PermissionKey>([
      'project.create',
      'project.feature',
      'comment.delete',
      'review.delete',
      'thread.report.resolve',
    ]),
    ADMIN: new Set<PermissionKey>([
      'project.create',
      'project.publish',
      'project.feature',
      'project.delete',
      'comment.delete',
      'review.delete',
      'thread.report.resolve',
      'user.ban',
      'modpack.publish',
      'guide.publish',
      'admin.access',
    ]),
    OWNER: new Set<PermissionKey>(PERMISSION_KEYS),
  };

  async list() {
    return this.prisma.permission.findMany({
      orderBy: { key: 'asc' },
      include: { rolePermissions: { select: { role: true, granted: true } } },
    });
  }

  async getByKey(key: string) {
    return this.prisma.permission.findUnique({ where: { key } });
  }

  async seedDefaults() {
    let created = 0;
    const permissionIds: Record<string, string> = {};
    for (const key of PERMISSION_KEYS) {
      const p = await this.prisma.permission.upsert({
        where: { key },
        update: {},
        create: { key, description: this.describe(key) },
      });
      permissionIds[key] = p.id;
      if (p.createdAt.getTime() === Date.now()) {
        // upsert returns the existing row on update; the timestamp check is
        // best-effort and only used to report "newly created" count.
        created++;
      }
    }

    // Reset role_permissions for any role that doesn't yet have rows.
    const roles: UserRole[] = ['USER', 'MODERATOR', 'ADMIN', 'OWNER'];
    for (const role of roles) {
      const existing = await this.prisma.rolePermission.count({ where: { role } });
      if (existing > 0) continue;
      const allowed = PermissionsService.DEFAULT_ROLE_MATRIX[role];
      for (const key of allowed) {
        const pid = permissionIds[key];
        if (!pid) continue;
        await this.prisma.rolePermission.create({
          data: { role, permissionId: pid, granted: true },
        });
      }
    }
    return { created, total: PERMISSION_KEYS.length };
  }

  /**
   * Resolve the set of effective permission keys for a user:
   * role baseline (with explicit `granted` removes) + per-user overrides (granted/denied).
   */
  async effectivePermissions(userId: string, role: UserRole): Promise<Set<string>> {
    const perms = new Set<string>();

    const [roleRows, userRows] = await Promise.all([
      this.prisma.rolePermission.findMany({
        where: { role },
        include: { permission: { select: { key: true } } },
      }),
      this.prisma.userPermissionOverride.findMany({
        where: { userId },
        include: { permission: { select: { key: true } } },
      }),
    ]);
    for (const row of roleRows) {
      if (row.granted) perms.add(row.permission.key);
      else perms.delete(row.permission.key);
    }
    for (const row of userRows) {
      if (row.granted) perms.add(row.permission.key);
      else perms.delete(row.permission.key);
    }
    return perms;
  }

  async hasPermission(userId: string, role: UserRole, key: string): Promise<boolean> {
    const set = await this.effectivePermissions(userId, role);
    return set.has(key);
  }

  async setRolePermission(role: UserRole, permissionId: string, granted: boolean) {
    return this.prisma.rolePermission.upsert({
      where: { role_permissionId: { role, permissionId } },
      update: { granted },
      create: { role, permissionId, granted },
    });
  }

  async setUserOverride(
    userId: string,
    permissionId: string,
    granted: boolean,
    reason: string | null,
    createdBy: string,
  ) {
    return this.prisma.userPermissionOverride.upsert({
      where: { userId_permissionId: { userId, permissionId } },
      update: { granted, reason, createdBy },
      create: { userId, permissionId, granted, reason, createdBy },
    });
  }

  async removeUserOverride(userId: string, permissionId: string) {
    return this.prisma.userPermissionOverride.delete({
      where: { userId_permissionId: { userId, permissionId } },
    });
  }

  async listUserOverrides(userId: string) {
    return this.prisma.userPermissionOverride.findMany({
      where: { userId },
      include: { permission: { select: { key: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createPermission(key: string, description?: string) {
    return this.prisma.permission.create({ data: { key, description } });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }

  private describe(key: string): string {
    const [domain, verb] = key.split('.');
    return `Allow user to ${verb} ${domain}`;
  }
}
