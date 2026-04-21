import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '@/context/ThemeContext';

export default function HeartRateChart({ data }) {
  const { isDark } = useTheme();
  const chart = data.map((r, i) => ({ idx: i+1, hr: r.heartRate }));

  return (
    <Card className={`rounded-2xl border-0 transition-all ${
      isDark
        ? 'bg-linear-to-br from-slate-900/90 to-slate-950/95 border border-orange-500/40'
        : 'bg-linear-to-br from-orange-50 to-white border border-orange-200'
    }`}>
      <CardContent className='p-5'>
        <h2 className={`font-semibold mb-4 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          ❤️ Heart Rate Trend
        </h2>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chart}>
              <CartesianGrid strokeDasharray='3 3' opacity={0.1} stroke={isDark ? '#f97316' : '#fb923c'} />
              <XAxis dataKey='idx' stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff7ed',
                  border: `2px solid ${isDark ? '#f97316' : '#fb923c'}`,
                  borderRadius: '8px'
                }}
                labelStyle={{ color: isDark ? '#ffffff' : '#000000' }}
              />
              <Line dataKey='hr' strokeWidth={3} dot={false} stroke='#f97316' />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}