import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '@/context/ThemeContext';
import { TrendingUp, AlertCircle, Clock, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const API = 'http://localhost:5000/api';

export default function Analytics() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`${API}/analytics`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Loading analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        No analytics data available
      </div>
    );
  }

  const { summary, series } = data;

  const summaryCards = [
    {
      title: 'Build-up Detected',
      value: summary.buildupDetected ? 'Yes' : 'No',
      icon: TrendingUp,
      color: summary.buildupDetected ? 'orange' : 'blue',
    },
    {
      title: 'Spike Count',
      value: summary.spikeCount,
      icon: AlertCircle,
      color: 'red',
    },
    {
      title: 'Recovery Time',
      value: summary.recoverySeconds ? `${summary.recoverySeconds} s` : '-- s',
      icon: Clock,
      color: 'green',
    },
    {
      title: 'Average Stress',
      value: Math.round(summary.avgStress),
      icon: Activity,
      color: 'purple',
    },
  ];

  return (
    <div
      className={`p-6 space-y-6 ${
        isDark
          ? 'bg-slate-950 text-white'
          : 'bg-gradient-to-br from-white via-orange-50 to-white text-slate-900'
      }`}
    >
      <div>
        <h1 className='text-3xl font-bold'>Stress Analytics Engine</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Instantaneous • Short-term Trend • Session Summary
        </p>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          const colorMap = {
            orange: isDark
              ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
              : 'bg-orange-100 text-orange-700 border-orange-300',
            red: isDark
              ? 'bg-red-500/20 text-red-400 border-red-500/30'
              : 'bg-red-100 text-red-700 border-red-300',
            green: isDark
              ? 'bg-green-500/20 text-green-400 border-green-500/30'
              : 'bg-green-100 text-green-700 border-green-300',
            blue: isDark
              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
              : 'bg-blue-100 text-blue-700 border-blue-300',
            purple: isDark
              ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
              : 'bg-purple-100 text-purple-700 border-purple-300',
          };

          return (
            <div
              key={i}
              className={`p-4 rounded-lg border ${colorMap[card.color]} ${
                isDark ? 'bg-slate-800/50' : 'bg-opacity-50'
              }`}
            >
              <div className='flex justify-between items-start'>
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {card.title}
                  </p>
                  <p className='text-2xl font-bold mt-1'>{card.value}</p>
                </div>
                <Icon className='w-6 h-6 opacity-60' />
              </div>
            </div>
          );
        })}
      </div>

      {/* Stress Trend Chart */}
      <div
        className={`p-6 rounded-lg border ${
          isDark
            ? 'bg-slate-800/50 border-orange-500/20'
            : 'bg-white border-orange-200'
        }`}
      >
        <h2 className='text-lg font-semibold mb-4'>Stress Trend with Rolling Mean</h2>
        <div className='h-96'>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart data={series}>
              <defs>
                <linearGradient id='stressGrad' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#f97316' stopOpacity={0.8} />
                  <stop offset='95%' stopColor='#f97316' stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray='3 3'
                opacity={0.1}
                stroke={isDark ? '#f97316' : '#fb923c'}
              />
              <XAxis
                dataKey='time'
                tickFormatter={(val) =>
                  new Date(val).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                stroke={isDark ? '#94a3b8' : '#64748b'}
              />
              <YAxis
                domain={[0, 100]}
                stroke={isDark ? '#94a3b8' : '#64748b'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff7ed',
                  border: `2px solid ${isDark ? '#f97316' : '#fb923c'}`,
                  borderRadius: '8px',
                }}
                labelFormatter={(val) => new Date(val).toLocaleTimeString()}
              />
              <Legend />
              <Line
                dataKey='stress'
                stroke='#f97316'
                strokeWidth={2}
                dot={false}
                name='Stress Index'
              />
              <Line
                dataKey='rolling'
                stroke='#60a5fa'
                strokeWidth={3}
                dot={false}
                name='Rolling Mean'
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Spike Detection */}
      <div
        className={`p-6 rounded-lg border ${
          isDark
            ? 'bg-slate-800/50 border-orange-500/20'
            : 'bg-white border-orange-200'
        }`}
      >
        <h2 className='text-lg font-semibold mb-4'>Acute Spike Detection</h2>
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={series.filter((_, i) => i % 5 === 0)}
            >
              <CartesianGrid
                strokeDasharray='3 3'
                opacity={0.1}
                stroke={isDark ? '#f97316' : '#fb923c'}
              />
              <XAxis
                dataKey='time'
                tickFormatter={(val) =>
                  new Date(val).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                stroke={isDark ? '#94a3b8' : '#64748b'}
              />
              <YAxis
                stroke={isDark ? '#94a3b8' : '#64748b'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? '#1e293b' : '#fff7ed',
                  border: `2px solid ${isDark ? '#f97316' : '#fb923c'}`,
                }}
              />
              <Bar
                dataKey='spike'
                fill='#ef4444'
                name='Spike Detected'
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Footer */}
      <div
        className={`p-4 rounded-lg text-sm ${
          isDark
            ? 'bg-slate-800/50 text-gray-400'
            : 'bg-orange-50 text-gray-600'
        }`}
      >
        <p>
          📈 Max Stress: <span className='font-bold'>{Math.round(summary.maxStress)}</span> | 
          📊 Total Data Points: <span className='font-bold'>{series.length}</span> | 
          ⚠️ Anomalies: <span className='font-bold'>{summary.spikeCount}</span>
        </p>
      </div>
    </div>
  );
}
