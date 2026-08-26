'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Wallet,
  TrendingUp,
  Clock,
  Coins,
  ArrowUpRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { Badge } from '@mcp/ui/components/badge';
import { sdk } from '@/services/api';
import { toast } from 'sonner';
import { formatNumber } from '@mcp/utils/helpers';

interface EarningsSummary {
  pointsBalance: number;
  lifetimeCents: number;
  availableCents: number;
  pendingCents: number;
  minWithdrawalCents: number;
  currency: string;
  payoutConnected: boolean;
  payoutsEnabled: boolean;
}

interface PayoutRow {
  id: string;
  amountCents: number;
  status: string;
  createdAt: string;
}

const usd = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function EarningsPanel() {
  const summary = useQuery<EarningsSummary>({
    queryKey: ['creator', 'earnings'],
    queryFn: async () => {
      const res: any = await sdk.client.get('/creator/earnings');
      return res?.data ?? res;
    },
    staleTime: 30_000,
  });

  const payouts = useQuery<PayoutRow[]>({
    queryKey: ['creator', 'payouts'],
    queryFn: async () => {
      const res: any = await sdk.client.get('/creator/earnings/payouts');
      return res?.data ?? res ?? [];
    },
    staleTime: 30_000,
  });

  const connect = useMutation({
    mutationFn: async () => {
      const res: any = await sdk.client.post('/creator/earnings/payout-account');
      return res?.data ?? res;
    },
    onSuccess: (data) => {
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener,noreferrer');
      } else {
        toast.info(
          'Payouts are not configured on this environment yet — your balance is still tracked.',
        );
      }
      summary.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? 'Failed to start payout setup'),
  });

  const withdraw = useMutation({
    mutationFn: async () => {
      const res: any = await sdk.client.post('/creator/earnings/withdraw');
      return res?.data ?? res;
    },
    onSuccess: () => {
      toast.success('Payout requested!');
      summary.refetch();
      payouts.refetch();
    },
    onError: (e: any) => toast.error(e?.message ?? 'Withdrawal failed'),
  });

  if (summary.isLoading) {
    return (
      <div className="bg-card rounded-xl border p-8">
        <div className="text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading earnings…
        </div>
      </div>
    );
  }

  if (summary.error || !summary.data) {
    return (
      <div className="border-destructive/20 bg-destructive/5 text-destructive flex items-center justify-center gap-2 rounded-xl border p-8 text-center text-sm">
        <AlertTriangle className="h-4 w-4" /> Failed to load earnings.
      </div>
    );
  }

  const s = summary.data;

  return (
    <div className="space-y-6">
      {/* Balance cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            icon: Coins,
            label: 'Available to withdraw',
            value: usd(s.availableCents),
            accent: true,
          },
          { icon: Wallet, label: 'Lifetime earnings', value: usd(s.lifetimeCents), accent: false },
          { icon: Clock, label: 'Pending payouts', value: usd(s.pendingCents), accent: false },
          {
            icon: TrendingUp,
            label: 'Reward points',
            value: formatNumber(s.pointsBalance),
            accent: false,
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={`rounded-xl border p-5 ${c.accent ? 'border-primary/30 bg-primary/5' : 'bg-card'}`}
            >
              <div className="bg-primary/10 mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg">
                <Icon className="text-primary h-5 w-5" />
              </div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest">{c.label}</p>
              <p
                className={`mt-1 text-xl font-black tracking-tight ${c.accent ? 'text-primary' : ''}`}
              >
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Payout account + actions */}
      <div className="bg-card grid grid-cols-1 gap-4 rounded-xl border p-6 lg:grid-cols-[1fr_auto]">
        <div>
          <h3 className="font-semibold">Payout account</h3>
          {s.payoutConnected ? (
            s.payoutsEnabled ? (
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Stripe account connected &amp; verified
              </p>
            ) : (
              <p className="mt-1 inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" /> Onboarding incomplete — finish setup to
                withdraw
              </p>
            )
          ) : (
            <p className="text-muted-foreground mt-1 text-sm">
              Connect a Stripe account to receive payouts. Minimum withdrawal{' '}
              {usd(s.minWithdrawalCents)}.
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!s.payoutConnected && (
            <Button onClick={() => connect.mutate()} disabled={connect.isPending} className="gap-2">
              {connect.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUpRight className="h-4 w-4" />
              )}
              Connect Stripe
            </Button>
          )}
          {s.payoutConnected && !s.payoutsEnabled && (
            <Button
              variant="outline"
              onClick={() => connect.mutate()}
              disabled={connect.isPending}
              className="gap-2"
            >
              Finish Setup <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          )}
          <Button
            onClick={() => withdraw.mutate()}
            disabled={
              withdraw.isPending || !s.payoutConnected || s.availableCents < s.minWithdrawalCents
            }
            title={
              s.availableCents < s.minWithdrawalCents
                ? `Minimum ${usd(s.minWithdrawalCents)}`
                : undefined
            }
            className="gap-2"
          >
            {withdraw.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Withdraw {usd(s.availableCents)}
          </Button>
        </div>
      </div>

      {/* Payout history */}
      <div className="bg-card rounded-xl border p-6">
        <h3 className="mb-4 font-semibold">Payout history</h3>
        {payouts.isLoading ? (
          <p className="text-muted-foreground py-4 text-center text-sm">Loading…</p>
        ) : !payouts.data?.length ? (
          <div className="py-8 text-center">
            <Coins className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">
              No payouts yet. Withdrawals appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-left text-xs uppercase tracking-widest">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Amount</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.data.map((p) => (
                <tr key={p.id} className="border-b last:border-b-0">
                  <td className="py-3">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 font-bold">{usd(p.amountCents)}</td>
                  <td className="py-3">
                    <Badge
                      variant={
                        p.status === 'COMPLETED'
                          ? 'default'
                          : p.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {p.status.toLowerCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
