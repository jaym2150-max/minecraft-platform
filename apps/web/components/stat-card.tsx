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
    <Card className="hover:shadow-md transition-shadow" data-testid="stat-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1 mt-1">
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
