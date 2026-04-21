import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';

export default function SensorTable({ data }) {
  const { isDark } = useTheme();

  return (
    <Card className={`rounded-2xl border-0 transition-all ${
      isDark
        ? 'bg-linear-to-br from-slate-900/90 to-slate-950/95 border border-orange-500/40'
        : 'bg-linear-to-br from-orange-50 to-white border border-orange-200'
    }`}>
      <CardContent className='p-5'>
        <h2 className={`font-semibold mb-4 text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          📋 Recent Readings
        </h2>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className={`text-left ${isDark ? 'text-orange-400/70' : 'text-orange-700'}`}>
                <th className='py-2'>#</th>
                <th>HR</th>
                <th>Avg</th>
                <th>HRV</th>
                <th>SpO₂</th>
                <th>Activity</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r,i)=>(
                <tr 
                  key={r._id} 
                  className={`transition-colors ${
                    isDark
                      ? 'border-b border-orange-500/20 hover:bg-orange-500/10'
                      : 'border-b border-orange-200 hover:bg-orange-100/50'
                  }`}
                >
                  <td className={`py-2 font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    {i+1}
                  </td>
                  <td className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {Math.round(r.derivedHeartRate)}
                  </td>
                  <td className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {r.firebaseHeartRateAvg}
                  </td>
                  <td className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {r.hrv}
                  </td>
                  <td className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {r.spo2}
                  </td>
                  <td className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                    {r.activity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}