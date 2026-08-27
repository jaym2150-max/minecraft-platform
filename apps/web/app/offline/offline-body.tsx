'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { useI18n } from '@/i18n/provider';

export function OfflineBody() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="bg-muted text-muted-foreground flex h-16 w-16 items-center justify-center rounded-2xl">
        <WifiOff className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-3xl font-bold">{t('common.offlineTitle')}</h1>
        <p className="text-muted-foreground mt-2 max-w-md">{t('common.offlineBody')}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/">
            <RefreshCw className="mr-2 h-4 w-4" /> {t('common.retry')}
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/mods">{t('common.browseCached')}</Link>
        </Button>
      </div>
    </div>
  );
}
