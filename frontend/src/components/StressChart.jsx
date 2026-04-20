import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useTheme } from '@/context/ThemeContext';

export default function StressChart({ data, stress }) {
  const { isDark } = useTheme();
  const chart = data.map((r, i) => ({ idx: i+1, stress }));

  return (
    <Card className={`rounded-2xl border-0 transition-all ${
      isDark
        ? 'bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-orange-500/40'
        : 'bg-gradient-to-br from-orange-50 to-white border border-orange-200'
    }`}>
      <CardContent className='p-5'>
        <h2 className={`font-semibold mb-4 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          ⚡ Stress Index
        </h2>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chart}>
              <defs>
                <linearGradient id='colorStress' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.8}/>
                  <stop offset='95%' stopColor='#ea580c' stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' opacity={0.1} stroke={isDark ? '#f97316' : '#fb923c'} />
              <XAxis dataKey='idx' stroke={isDark ? '#94a3b8' : '#64748b'} />
              <YAxis domain={[0,100]} stroke={isDark ? '#94a3b8' : '#64748b'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff7ed',
                  border: `2px solid ${isDark ? '#f97316' : '#fb923c'}`,
                  borderRadius: '8px'
                }}
                labelStyle={{ color: isDark ? '#ffffff' : '#000000' }}
              />
              <Area dataKey='stress' fillOpacity={1} strokeWidth={2} stroke='#f97316' fill='url(#colorStress)' />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}