import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`border-b transition-colors ${
      isDark 
        ? 'border-orange-500/20 bg-slate-950/80 backdrop-blur' 
        : 'border-orange-200 bg-white/50 backdrop-blur'
    }`}>
      <div className='max-w-7xl mx-auto p-4 flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center'>
            <span className='text-white font-bold text-lg'>📊</span>
          </div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            IoT Stress Dashboard
          </h1>
        </div>
        <div className='flex items-center gap-4'>
          <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Live Monitoring
          </span>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${
              isDark
                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400'
                : 'bg-orange-100 hover:bg-orange-200 text-orange-600'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}