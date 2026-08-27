import type { Metadata } from 'next';
import { OfflineBody } from './offline-body';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-static';

export default function OfflinePage() {
  return <OfflineBody />;
}
