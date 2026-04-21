import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import HeartRateChart from '../components/HeartRateChart';
import StressChart from '../components/StressChart';
import SensorTable from '../components/SensorTable';
import { HeartPulse, ShieldAlert, Droplets, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const API = 'http://localhost:5000/api';

export default function Dashboard() {
    const { isDark } = useTheme();
    const [sensor, setSensor] = useState(null);
    const [history, setHistory] = useState([]);
    const [stress, setStress] = useState(null);
    const fetchData = async () => {
    const latest = await axios.get(`${API}/sensors/latest`);
    const hist = await axios.get(`${API}/sensors/history?limit=20`);
    setSensor(latest.data.data);
    setHistory(hist.data.data.reverse());
    try {
      const pred = await axios.get(`${API}/stress/predict`);
      if (pred.data && pred.data.success) {
        setStress(pred.data.data);
      } else {
        console.warn("Stress prediction not available:", pred.data?.message);
        setStress(null);
      }
    } catch (err) {
      console.warn("Stress prediction error:", err.message);
      setStress(null);
    }
  };

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, 3000);
        return () => clearInterval(id);
    }, []);

  return (
    <div className={`min-h-screen transition-colors ${
      isDark
        ? 'bg-slate-950 text-white'
        : 'bg-linear-to-br from-white via-orange-50 to-white text-slate-900'
    }`}>
      <div className='max-w-7xl mx-auto p-4 space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
          <StatCard title='Stress Status' value={stress?.predictedClass || 'Waiting'} icon={ShieldAlert} subtitle={`${Math.round((stress?.confidence || 0)*100)}% confidence`} />
          <StatCard title='Heart Rate' value={`${Math.round(sensor?.derivedHeartRate || 0)} bpm`} icon={HeartPulse} />
          <StatCard title='SpO₂' value={`${sensor?.spo2 || '--'} %`} icon={Droplets} />
          <StatCard title='HRV / Activity' value={`${sensor?.hrv || '--'} / ${sensor?.activity || '--'}`} icon={Activity} />
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          <HeartRateChart data={history} />
          <StressChart data={history} stress={stress?.stressIndex || 0} />
        </div>

        <SensorTable data={history} />
      </div>
    </div>
  );
}