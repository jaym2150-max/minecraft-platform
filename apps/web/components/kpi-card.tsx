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
    <Card className="hover:shadow-md transition-shadow" data-testid="kpi-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1 mt-1">
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
