import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function Sidebar({ currentView, setCurrentView }) {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-4 left-4 z-50 p-2 rounded-lg lg:hidden transition-all ${
          isDark
            ? 'bg-slate-700 hover:bg-slate-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
        }`}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-screen w-80 transform transition-transform lg:translate-x-0 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-slate-900'
            : 'bg-white'
        }`}
      >
        <div className='p-6 space-y-6 h-full overflow-y-auto scrollbar-hide' style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>

          {/* Header */}
          <div>
            <h2 className={`text-xl font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Navigation
            </h2>
          </div>

          {/* Divider */}
          <div className={`h-px ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />

          {/* Dashboard Section */}
          <div className='space-y-4'>
            <h3 className={`text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              View Selection
            </h3>

            {/* Dashboard Button */}
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                currentView === 'dashboard'
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : isDark
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📈 Live Dashboard
            </button>

            {/* Analytics Button */}
            <button
              onClick={() => {
                setCurrentView('analytics');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                currentView === 'analytics'
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : isDark
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Analytics
            </button>

            {/* Intervention Dashboard Button */}
            <button
              onClick={() => {
                setCurrentView('intervention');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg text-left font-medium transition-all ${
                currentView === 'intervention'
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : isDark
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🧠 Intervention Dashboard
            </button>
          </div>

          {/* Divider */}
          <div className={`h-px ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />

          {/* Display Options */}
          <div className='space-y-4'>
            <h3 className={`text-xs font-bold uppercase tracking-widest ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Display Options
            </h3>

            <div className={`flex items-center justify-between p-3 rounded-lg ${
              isDark 
                ? 'bg-slate-800/50' 
                : 'bg-gray-50'
            }`}>
              <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Real-time Data
              </span>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                ✓
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${
              isDark 
                ? 'bg-slate-800/50' 
                : 'bg-gray-50'
            }`}>
              <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Stress Trends
              </span>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'
              }`}>
                ✓
              </span>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${
              isDark 
                ? 'bg-slate-800/50' 
                : 'bg-gray-50'
            }`}>
              <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                ML Predictions
              </span>
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
              }`}>
                ✓
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className={`h-px ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />

          {/* Reset Button */}
          <button
            onClick={() => {
              setCurrentView('dashboard');
            }}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-all ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
            }`}
          >
            Reset to Dashboard
          </button>

          {/* Status Info */}
          <div className={`p-4 rounded-lg text-xs space-y-2 ${
            isDark 
              ? 'bg-slate-800/50 border border-slate-700' 
              : 'bg-gray-50 border border-gray-200'
          }`}>
            <p className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Current View
            </p>
            <p className={`font-semibold text-blue-500`}>
              {currentView === 'dashboard' && '📈 Live Dashboard'}
              {currentView === 'analytics' && '📊 Analytics View'}
              {currentView === 'intervention' && '🧠 Intervention Dashboard'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-30 lg:hidden'
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Content Margin Adjustment */}
      <div className='hidden lg:block lg:w-80' />
    </>
  );
}
