'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Download, ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { useAuth } from '@mcp/auth';

interface Subscription {
  id: string;
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: { name: string; price: number; interval: string };
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  pdf: string | null;
}

export default function BillingPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    Promise.all([
      fetch('/api/v1/billing/subscription', { credentials: 'include' }).then((r) => r.json()),
      fetch('/api/v1/billing/history', { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([subRes, invRes]) => {
        setSubscription(subRes.data ?? null);
        setInvoices(Array.isArray(invRes.data) ? invRes.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  const handlePortal = async () => {
    try {
      const res = await fetch('/api/v1/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.data?.url) window.location.href = data.data.url;
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="text-muted-foreground">Manage your subscription and payment history.</p>
      </div>

      {/* Current Plan */}
      <div className="rounded-xl border p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Current Plan</h3>
            <p className="text-muted-foreground text-sm">
              {subscription
                ? `${subscription.plan.name} — $${(subscription.plan.price / 100).toFixed(2)}/${subscription.plan.interval}`
                : 'Free Plan'}
            </p>
          </div>
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              subscription?.status === 'ACTIVE'
                ? 'bg-green-500/15 text-green-600'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {subscription?.status === 'ACTIVE' ? 'Active' : 'Free'}
          </div>
        </div>

        {subscription?.currentPeriodEnd && (
          <p className="text-muted-foreground mb-4 text-sm">
            {subscription.cancelAtPeriodEnd
              ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
              : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
          </p>
        )}

        <div className="flex gap-3">
          {!subscription && (
            <Button asChild>
              <a href="/pricing">View Plans</a>
            </Button>
          )}
          {subscription && (
            <Button variant="outline" onClick={handlePortal} className="gap-2">
              <ExternalLink className="h-4 w-4" /> Manage in Stripe
            </Button>
          )}
        </div>
      </div>

      {/* Billing History */}
      <div className="rounded-xl border">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Payment History</h3>
        </div>
        {invoices.length === 0 ? (
          <div className="text-muted-foreground px-6 py-8 text-center text-sm">
            <CreditCard className="mx-auto mb-2 h-8 w-8 opacity-50" />
            No payments yet.
          </div>
        ) : (
          <div className="divide-y">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  {inv.status === 'paid' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      ${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(inv.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {inv.pdf && (
                  <Button variant="ghost" size="sm" asChild className="gap-1">
                    <a href={inv.pdf} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" /> PDF
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
