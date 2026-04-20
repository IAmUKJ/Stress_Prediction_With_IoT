import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';

export default function StatCard({ title, value, icon: Icon, subtitle }) {
  const { isDark } = useTheme();

  return (
    <Card className={`rounded-2xl border-0 transition-all hover:shadow-lg hover:scale-105 ${
      isDark
        ? 'bg-gradient-to-br from-slate-900/90 to-slate-950/95 border border-orange-500/40'
        : 'bg-gradient-to-br from-orange-50 to-white border border-orange-200'
    }`}>
      <CardContent className='p-5 flex justify-between items-center'>
        <div>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{title}</p>
          <h3 className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {value}
          </h3>
          {subtitle && (
            <p className={`text-xs mt-1 ${isDark ? 'text-orange-400/70' : 'text-orange-600'}`}>
              {subtitle}
            </p>
          )}
        </div>
        <Icon className={`w-8 h-8 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
      </CardContent>
    </Card>
  );
}