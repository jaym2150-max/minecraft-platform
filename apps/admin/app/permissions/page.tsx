'use client';

import { useCallback, useEffect, useState } from 'react';
import { Shield, Loader2, Search, Key, Plus, Trash2, Check, X } from 'lucide-react';
import { adminApi } from '@/lib/api';

const ROLES: string[] = ['USER', 'MODERATOR', 'ADMIN', 'OWNER'];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [userId, setUserId] = useState('');
  const [userOverrides, setUserOverrides] = useState<any[]>([]);
  const [selectedPermId, setSelectedPermId] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await adminApi.listPermissions();
      const list = Array.isArray(res?.data) ? res.data : [];
      setPermissions(list);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const seed = async () => {
    setSeeding(true);
    setError(null);
    try {
      await adminApi.seedPermissions();
      await load();
    } catch (err: any) {
      setError(err?.message ?? 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  const create = async () => {
    if (!newKey.trim()) return;
    try {
      await fetch('/api/v1/permissions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: newKey.trim(), description: newDesc.trim() || undefined }),
      }).then((r) => {
        if (!r.ok) throw new Error('Create failed');
        return r.json();
      });
      setNewKey('');
      setNewDesc('');
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Create failed');
    }
  };

  const toggleRole = async (role: string, permId: string, currentlyGranted: boolean) => {
    try {
      await adminApi.setRolePermission(role, permId, !currentlyGranted);
      load();
    } catch (err: any) {
      setError(err?.message ?? 'Role update failed');
    }
  };

  const loadUserOverrides = async () => {
    if (!userId.trim()) return;
    try {
      const res: any = await adminApi.listUserOverrides(userId.trim());
      setUserOverrides(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load user overrides');
    }
  };

  const setOverride = async (granted: boolean) => {
    if (!userId.trim() || !selectedPermId) return;
    try {
      await adminApi.setUserOverride(userId.trim(), selectedPermId, granted);
      loadUserOverrides();
    } catch (err: any) {
      setError(err?.message ?? 'Override failed');
    }
  };

  const removeOverride = async (permId: string) => {
    if (!userId.trim()) return;
    try {
      await adminApi.removeUserOverride(userId.trim(), permId);
      loadUserOverrides();
    } catch (err: any) {
      setError(err?.message ?? 'Remove failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Shield className="h-6 w-6" /> Permissions
          </h1>
          <p className="text-muted-foreground">
            Granular RBAC — role baselines + per-user overrides (§37)
          </p>
        </div>
        <button
          onClick={seed}
          disabled={seeding}
          className="bg-primary text-primary-foreground inline-flex items-center gap-2 rounded px-4 py-2 text-sm disabled:opacity-50"
        >
          {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}{' '}
          Seed defaults
        </button>
      </div>

      {error && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Create permission</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="e.g. project.publish"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Description (optional)"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            onClick={create}
            disabled={!newKey.trim()}
            className="bg-primary text-primary-foreground rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            <Plus className="mr-1 inline h-4 w-4" /> Create
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
        </div>
      ) : permissions.length === 0 ? (
        <div className="text-muted-foreground rounded border bg-white p-8 text-center text-sm">
          No permissions yet — seed defaults.
        </div>
      ) : (
        <div className="overflow-hidden rounded border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr className="text-left">
                <th className="p-2">Key</th>
                <th className="p-2">Description</th>
                {ROLES.map((r) => (
                  <th key={r} className="p-2 text-center">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((p: any) => {
                const grants = new Map<string, boolean>(
                  p.rolePermissions?.map((rp: any) => [rp.role, rp.granted]),
                );
                return (
                  <tr key={p.id} className="border-t">
                    <td className="p-2 font-mono text-xs">{p.key}</td>
                    <td className="text-muted-foreground p-2 text-xs">{p.description ?? '—'}</td>
                    {ROLES.map((role) => {
                      const granted = grants.get(role);
                      const hasRow = grants.has(role);
                      return (
                        <td key={role} className="p-2 text-center">
                          <button
                            onClick={() => toggleRole(role, p.id, !!granted)}
                            className={`rounded px-2 py-1 text-xs ${hasRow ? (granted ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700') : 'bg-slate-100 text-slate-500'}`}
                            title={hasRow ? (granted ? 'Revoke' : 'Grant') : 'Set grant'}
                          >
                            {hasRow ? (
                              granted ? (
                                <Check className="inline h-3 w-3" />
                              ) : (
                                <X className="inline h-3 w-3" />
                              )
                            ) : (
                              '—'
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Per-user overrides</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="User ID"
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <select
            value={selectedPermId}
            onChange={(e) => setSelectedPermId(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            <option value="">Select permission</option>
            {permissions.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.key}
              </option>
            ))}
          </select>
          <button
            onClick={() => setOverride(true)}
            disabled={!userId.trim() || !selectedPermId}
            className="rounded bg-emerald-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Allow
          </button>
          <button
            onClick={() => setOverride(false)}
            disabled={!userId.trim() || !selectedPermId}
            className="rounded bg-red-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Deny
          </button>
          <button
            onClick={loadUserOverrides}
            disabled={!userId.trim()}
            className="rounded border px-3 py-2 text-sm"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
        {userOverrides.length > 0 && (
          <div className="mt-3 overflow-hidden rounded border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="p-2 text-left">Permission</th>
                  <th className="p-2">Granted</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {userOverrides.map((o: any) => (
                  <tr key={o.id} className="border-t">
                    <td className="p-2 font-mono text-xs">{o.permission?.key ?? o.permissionId}</td>
                    <td className="p-2 text-center">{o.granted ? 'Yes' : 'No'}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => removeOverride(o.permissionId)}
                        className="rounded border px-2 py-1 text-xs"
                      >
                        <Trash2 className="inline h-3 w-3" /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
