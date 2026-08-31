'use client';

import type { ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_FEE_CHART } from '@/lib/mockData';
import { formatCurrency } from '@/lib/utils';

function formatAxisAmount(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `Rs. ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `Rs. ${thousands % 1 === 0 ? thousands.toFixed(0) : thousands.toFixed(1)}k`;
  }
  return `Rs. ${value}`;
}

export function FeeCollectionChart(): ReactNode {
  return (
    <Card className="rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle>Fee Collection (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_FEE_CHART} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis
                tickFormatter={formatAxisAmount}
                tickLine={false}
                axisLine={false}
                width={72}
                className="text-xs"
              />
              <Tooltip
                formatter={(value): string =>
                  formatCurrency(typeof value === 'number' ? value : Number(value) || 0)
                }
                labelFormatter={(label): string => String(label)}
              />
              <Line
                type="monotone"
                dataKey="amount"
                name="Collected"
                stroke="#4F46E5"
                strokeWidth={2}
                dot={{ r: 4, fill: '#4F46E5' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
