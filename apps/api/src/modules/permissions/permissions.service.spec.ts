import { PERMISSION_KEYS, PermissionsService } from './permissions.service';
import { UserRole } from '@prisma/client';

function mockPrisma(opts: any) {
  const base: any = {
    permission: { findMany: jest.fn(), upsert: jest.fn(), findUnique: jest.fn() },
    rolePermission: { findMany: jest.fn(), count: jest.fn() },
    userPermissionOverride: { findMany: jest.fn() },
  };
  if (opts?.rolePermissionFindMany)
    base.rolePermission.findMany.mockResolvedValue(opts.rolePermissionFindMany);
  if (opts?.userOverrideFindMany)
    base.userPermissionOverride.findMany.mockResolvedValue(opts.userOverrideFindMany);
  return base;
}

describe('PermissionsService.effectivePermissions', () => {
  it('combines role baseline with user overrides', async () => {
    const prisma = mockPrisma({
      rolePermissionFindMany: [
        { granted: true, permission: { key: 'project.create' } },
        { granted: true, permission: { key: 'project.publish' } },
        { granted: false, permission: { key: 'user.ban' } },
      ],
      userOverrideFindMany: [{ granted: true, permission: { key: 'user.ban' } }],
    });
    const svc = new PermissionsService(prisma as any);
    const set = await svc.effectivePermissions('u1', UserRole.MODERATOR);
    expect(set.has('project.create')).toBe(true);
    expect(set.has('project.publish')).toBe(true);
    expect(set.has('user.ban')).toBe(true); // role denied, override granted
  });

  it('user override denies a permission even if role grants it', async () => {
    const prisma = mockPrisma({
      rolePermissionFindMany: [{ granted: true, permission: { key: 'admin.access' } }],
      userOverrideFindMany: [{ granted: false, permission: { key: 'admin.access' } }],
    });
    const svc = new PermissionsService(prisma as any);
    const set = await svc.effectivePermissions('u1', UserRole.ADMIN);
    expect(set.has('admin.access')).toBe(false);
  });

  it('hasPermission reflects effectivePermissions', async () => {
    const prisma = mockPrisma({
      rolePermissionFindMany: [{ granted: true, permission: { key: 'project.feature' } }],
      userOverrideFindMany: [],
    });
    const svc = new PermissionsService(prisma as any);
    expect(await svc.hasPermission('u1', UserRole.MODERATOR, 'project.feature')).toBe(true);
    expect(await svc.hasPermission('u1', UserRole.MODERATOR, 'admin.access')).toBe(false);
  });

  it('exposes a stable permission key catalog', () => {
    expect(PERMISSION_KEYS.length).toBeGreaterThan(5);
    expect(PERMISSION_KEYS).toContain('project.publish');
    expect(PERMISSION_KEYS).toContain('user.ban');
  });
});
