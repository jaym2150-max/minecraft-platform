'use client';

import { Info } from 'lucide-react';

/**
 * Platform configuration lives in deployment env vars and infrastructure
 * files (docker-compose / Kubernetes manifests), not in this UI. The
 * previous version of this page showed a form with a fake "Settings saved!"
 * confirmation that persisted nothing — that was removed.
 */
const CONFIG_SOURCES = [
  { key: 'Site name & metadata', where: 'apps/web/app/layout.tsx (Next.js metadata)' },
  { key: 'API URL / CORS origins', where: 'apps/api/.env, ALLOWED_CORS_ORIGINS' },
  { key: 'Storage (S3/CDN)', where: 'S3_ENDPOINT, S3_BUCKET, CDN_DOMAIN env vars' },
  { key: 'Email / notifications', where: 'notification-worker env vars' },
  { key: 'Feature flags & maintenance mode', where: 'deployment manifests (docker-compose / k8s)' },
];

export default function AdminSettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-slate-600">
          Platform configuration is managed via deployment configuration.
        </p>
      </div>

      <div className="rounded-lg border bg-white">
        <div className="flex items-start gap-3 border-b p-6">
          <Info className="mt-0.5 h-5 w-5 text-slate-500" />
          <div>
            <h2 className="font-semibold">Where configuration lives</h2>
            <p className="mt-1 text-sm text-slate-500">
              This dashboard is intentionally read-only. Changes take effect on the next
              deployment/restart.
            </p>
          </div>
        </div>
        <div className="divide-y">
          {CONFIG_SOURCES.map((c) => (
            <div key={c.key} className="flex items-center justify-between p-4">
              <span className="text-sm font-medium">{c.key}</span>
              <code className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">
                {c.where}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
