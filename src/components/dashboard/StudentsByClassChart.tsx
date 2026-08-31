'use client';

import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_STUDENTS_BY_CLASS } from '@/lib/mockData';

export function StudentsByClassChart(): ReactNode {
  return (
    <Card className="rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle>Students by Class</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={MOCK_STUDENTS_BY_CLASS}
              margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="className"
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis tickLine={false} axisLine={false} className="text-xs" width={40} />
              <Tooltip
                formatter={(value): string =>
                  typeof value === 'number' ? String(value) : String(value ?? 0)
                }
              />
              <Bar
                dataKey="count"
                name="Students"
                fill="#4F46E5"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
