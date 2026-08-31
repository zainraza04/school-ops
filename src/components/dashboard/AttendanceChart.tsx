'use client';

import type { ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MOCK_DASHBOARD } from '@/lib/mockData';

const PRESENT_COLOR = '#10B981';
const ABSENT_COLOR = '#F43F5E';

const data = [
  { name: 'Present', value: MOCK_DASHBOARD.presentToday, color: PRESENT_COLOR },
  { name: 'Absent', value: MOCK_DASHBOARD.absentToday, color: ABSENT_COLOR },
];

export function AttendanceChart(): ReactNode {
  return (
    <Card className="rounded-xl border bg-card shadow-sm ring-1 ring-border/60">
      <CardHeader>
        <CardTitle>Attendance Today</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value): string =>
                  typeof value === 'number' ? String(value) : String(value ?? 0)
                }
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
