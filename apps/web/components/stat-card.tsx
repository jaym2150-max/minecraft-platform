'use client';

import React from 'react';
import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@mcp/ui/components/card';

export type ChangeType = 'up' | 'down' | 'neutral';

export interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  change: string;
  changeType: ChangeType;
}

export function StatCard({ label, value, icon: Icon, change, changeType }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:shadow-md" data-testid="stat-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">{label}</CardTitle>
        <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-lg">
          <Icon className="text-primary h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 flex items-center gap-1">
          {changeType === 'up' && <TrendingUp className="h-3 w-3 text-emerald-500" />}
          <p
            className={`text-xs ${
              changeType === 'up'
                ? 'text-emerald-500'
                : changeType === 'down'
                  ? 'text-red-500'
                  : 'text-muted-foreground'
            }`}
          >
            {change}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
