'use client';

import { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

const USERS = [
  { id: '1', username: 'caffeinemc', email: 'team@caffeinemc.net', role: 'USER', status: 'active', joined: '2023-04-12', projects: 4 },
  { id: '2', username: 'mezz', email: 'mezz@jei.example', role: 'USER', status: 'active', joined: '2022-11-05', projects: 1 },
  { id: '3', username: 'simibubi', email: 'simi@create.example', role: 'USER', status: 'active', joined: '2022-08-19', projects: 8 },
  { id: '4', username: 'spammer_42', email: 'spam@example.com', role: 'USER', status: 'banned', joined: '2024-01-23', projects: 0 },
  { id: '5', username: 'irisshaders', email: 'team@irisshaders.dev', role: 'USER', status: 'active', joined: '2023-02-10', projects: 2 },
  { id: '6', username: 'admin', email: 'admin@minecraftplatform.com', role: 'OWNER', status: 'active', joined: '2021-01-01', projects: 0 },
  { id: '7', username: 'newmodder', email: 'new@example.com', role: 'USER', status: 'active', joined: '2025-12-15', projects: 0 },
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const filtered = USERS.filter(
    (u) => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-slate-600 mt-1">Manage platform users and their permissions</p>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="search"
          placeholder="Search by username or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 rounded-lg border bg-white"
        />
        <select className="px-4 py-2 rounded-lg border bg-white">
          <option>All roles</option>
          <option>USER</option>
          <option>MODERATOR</option>
          <option>ADMIN</option>
          <option>OWNER</option>
        </select>
        <select className="px-4 py-2 rounded-lg border bg-white">
          <option>All statuses</option>
          <option>Active</option>
          <option>Banned</option>
        </select>
      </div>

      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium">User</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Joined</th>
              <th className="text-left p-4 font-medium">Projects</th>
              <th className="text-right p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium">
                      {u.username[0].toUpperCase()}
                    </div>
                    <span className="font-medium">@{u.username}</span>
                  </div>
                </td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      u.role === 'OWNER'
                        ? 'bg-purple-100 text-purple-700'
                        : u.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-700'
                        : u.role === 'MODERATOR'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      u.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600">{u.joined}</td>
                <td className="p-4 text-slate-600">{u.projects}</td>
                <td className="p-4 text-right">
                  <button className="p-1 rounded hover:bg-slate-200">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
