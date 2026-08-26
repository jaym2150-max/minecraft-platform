'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@mcp/ui/components/card';

export interface KpiCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: 'up' | 'down';
}

export function KpiCard({ label, value, icon: Icon, change, changeType }: KpiCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md" data-testid="kpi-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
            <Icon className="text-primary h-4 w-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1">
          {changeType === 'up' ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span
            className={`text-xs font-medium ${
              changeType === 'up' ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
