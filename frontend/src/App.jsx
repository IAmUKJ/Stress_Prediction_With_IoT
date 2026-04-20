import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import InterventionDashboard from './pages/InterventionDashboard';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return <Analytics />;
      case 'intervention':
        return <InterventionDashboard />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <ThemeProvider>
      <div className='flex'>
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
        <div className='flex-1 flex flex-col'>
          {currentView !== 'intervention' && <Navbar />}
          <div className='flex-1 overflow-auto'>
            {renderView()}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}