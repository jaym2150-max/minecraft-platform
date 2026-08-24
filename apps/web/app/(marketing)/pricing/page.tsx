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
    <div className={`relative rounded-2xl border p-6 flex flex-col ${
      plan.popular
        ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
        : 'border-border'
    }`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <div className="mb-6">
        <h3 className="text-lg font-bold">{plan.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
      </div>
      <div className="mb-6">
        <span className="text-3xl font-bold">${(plan.price / 100).toFixed(2)}</span>
        <span className="text-muted-foreground text-sm ml-1">
          / {plan.interval === 'year' ? 'year' : 'month'}
        </span>
        {plan.price === 0 && <span className="text-muted-foreground text-sm ml-1">— Free forever</span>}
      </div>
      <ul className="space-y-3 mb-8 flex-1">
        {plan.features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
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
    sdk.listPlans?.()
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
      <section className="border-b bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container text-center max-w-2xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3">Choose Your Creator Plan</h1>
          <p className="text-lg text-muted-foreground">
            Unlock powerful features for your mods. Free tier included — upgrade when you grow.
          </p>
        </div>
      </section>

      <section className="container py-12">
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border p-6 space-y-4 animate-pulse">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-4 w-40 bg-muted rounded" />
                <div className="h-8 w-28 bg-muted rounded" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 w-full bg-muted rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.filter(p => p.active !== false).map((plan) => (
              <PricingCard key={plan.id} plan={plan} onSelect={() => handleSelect(plan)} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t py-12">
        <div className="container text-center max-w-xl">
          <h2 className="text-xl font-bold mb-2">Need Higher Limits?</h2>
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
