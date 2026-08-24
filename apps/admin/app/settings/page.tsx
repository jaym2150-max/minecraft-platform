'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600 mt-1">Manage platform configuration.</p>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="p-6 border-b">
          <h2 className="font-semibold">Platform Settings</h2>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Site Name</label>
            <input
              type="text"
              defaultValue="Minecraft Platform"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Site Description</label>
            <textarea
              defaultValue="Discover, download, and share Minecraft mods, modpacks, and plugins."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Maintenance Mode</label>
            <select className="w-full px-3 py-2 border rounded-lg text-sm">
              <option>Disabled</option>
              <option>Enabled</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
            >
              <Save className="h-4 w-4" />
              Save Settings
            </button>
            {saved && <span className="text-sm text-emerald-600">Settings saved!</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
