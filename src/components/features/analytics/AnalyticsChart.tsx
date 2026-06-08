'use client';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsChartProps {
  data: { day: string; scans: number }[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} barSize={32}>
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#7a7a92', fontSize: 12 }} />
        <YAxis hide />
        <Tooltip
          contentStyle={{ background: '#111118', border: '1px solid #2a2a38', borderRadius: 8, fontSize: 12 }}
          labelStyle={{ color: '#f0f0f5' }}
          cursor={{ fill: 'rgba(0,229,160,0.05)' }}
        />
        <Bar dataKey="scans" fill="url(#grad2)" radius={[4, 4, 0, 0]} />
        <defs>
          <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5a0" />
            <stop offset="100%" stopColor="#00e5a0" stopOpacity={0.35} />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
