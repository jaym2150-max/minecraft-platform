import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-static';

export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-2xl">
        <WifiOff className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">You&apos;re offline</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          We couldn&apos;t reach Minecraft Platform right now. Cached pages should still work — try
          again, or come back when you&apos;re online.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">
            <RefreshCw className="mr-2 h-4 w-4" /> Retry
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/mods">Browse cached mods</Link>
        </Button>
      </div>
    </div>
  );
}
