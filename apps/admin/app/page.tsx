'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRoot() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-slate-600">Redirecting to dashboard...</p>
    </div>
  );
}
