'use client';

import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import { Button } from '@mcp/ui/components/button';
import { useState, useEffect } from 'react';
import { sdk } from '@/services/api';

interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular: boolean;
  active?: boolean;
}

function PricingCard({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-6 ${
        plan.popular ? 'border-primary shadow-primary/10 scale-[1.02] shadow-lg' : 'border-border'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-bold">{plan.name}</h3>
        <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold">${(plan.price / 100).toFixed(2)}</span>
        <span className="text-muted-foreground ml-1 text-sm">
          / {plan.interval === 'year' ? 'year' : 'month'}
        </span>
        {plan.price === 0 && (
          <span className="text-muted-foreground ml-1 text-sm">— Free forever</span>
        )}
      </div>
      <ul className="mb-8 flex-1 space-y-3">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="text-primary mt-0.5 h-4 w-4 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Button
        onClick={onSelect}
        variant={plan.popular ? 'default' : 'outline'}
        className="w-full"
        disabled={plan.price === 0}
      >
        {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
      </Button>
    </div>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sdk
      .listPlans?.()
      .then((res: any) => setPlans(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = async (plan: Plan) => {
    if (plan.price === 0) return;
    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          planSlug: plan.slug,
          successUrl: `${window.location.origin}/dashboard/billing?success=1`,
          cancelUrl: `${window.location.origin}/pricing`,
        }),
      });
      const data = await res.json();
      if (data.data?.url) window.location.href = data.data.url;
    } catch {
      // fallback
    }
  };

  return (
    <main className="flex-1">
      <section className="from-primary/5 to-background border-b bg-gradient-to-b py-16">
        <div className="container max-w-2xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Sparkles className="text-primary h-5 w-5" />
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight">Choose Your Creator Plan</h1>
          <p className="text-muted-foreground text-lg">
            Unlock powerful features for your mods. Free tier included — upgrade when you grow.
          </p>
        </div>
      </section>

      <section className="container py-12">
        {loading ? (
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse space-y-4 rounded-2xl border p-6">
                <div className="bg-muted h-5 w-24 rounded" />
                <div className="bg-muted h-4 w-40 rounded" />
                <div className="bg-muted h-8 w-28 rounded" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-muted h-4 w-full rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
            {plans
              .filter((p) => p.active !== false)
              .map((plan) => (
                <PricingCard key={plan.id} plan={plan} onSelect={() => handleSelect(plan)} />
              ))}
          </div>
        )}
      </section>

      <section className="border-t py-12">
        <div className="container max-w-xl text-center">
          <h2 className="mb-2 text-xl font-bold">Need Higher Limits?</h2>
          <p className="text-muted-foreground mb-6">
            Contact us for enterprise-grade rate limits, dedicated support, and custom integrations.
          </p>
          <Button variant="outline" asChild>
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
