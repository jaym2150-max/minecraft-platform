import type { Metadata } from 'next';
import { EarningsPanel } from '@/components/earnings-panel';

export const metadata: Metadata = {
  title: 'Earnings',
};

export default function DashboardEarningsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Creator Earnings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Earn points on every download of your projects. Convert to cash via Stripe payouts.
        </p>
      </div>
      <EarningsPanel />
    </div>
  );
}
