import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Gauge, Activity, Brain, Timer, AlertTriangle, Plus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import InterventionLogs from '@/components/InterventionLogs';

const API = 'http://localhost:5000/api';

function Ring({ value }) {
  const deg = (value / 100) * 180;
  return (
    <div className='relative w-56 h-32 overflow-hidden'>
      <div className='absolute inset-0 rounded-t-full border-[18px] border-white/10 border-b-0'></div>
      <div
        className='absolute inset-0 rounded-t-full border-[18px] border-emerald-400 border-b-0'
        style={{ clipPath: `inset(0 ${100 - deg / 1.8}% 0 0)` }}
      ></div>
      <div className='absolute bottom-0 left-1/2 -translate-x-1/2 text-4xl font-bold'>
        {Math.round(value)}
      </div>
    </div>
  );
}

export default function InterventionDashboard() {
  const [analytics, setAnalytics] = useState({ summary: {}, series: [] });
  const [sensor, setSensor] = useState(null);
  const [stress, setStress] = useState(null);
  const [tip, setTip] = useState('Analyzing your state...');
  const [sessionId, setSessionId] = useState(null);
  const [deviceId, setDeviceId] = useState('device-001');
  const [showLogs, setShowLogs] = useState(false);
  const [interventionCategory, setInterventionCategory] = useState('breathing');

  const load = async () => {
    try {
      const [a, s, p] = await Promise.all([
        axios.get(`${API}/analytics`).catch(() => ({ data: { summary: {}, series: [] } })),
        axios.get(`${API}/sensors/latest`).catch(() => ({ data: { data: null } })),
        axios.get(`${API}/stress/predict`).catch(() => ({ data: { data: null } })),
      ]);
      setAnalytics(a.data);
      setSensor(s.data.data);
      setStress(p.data.data);

      // Initialize session if not already done
      if (!sessionId) {
        setSessionId(`session-${Date.now()}`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  // Log intervention when tip changes
  const logCurrentIntervention = async () => {
    try {
      if (!sessionId || !stress) return;

      // Determine category from tip
      let category = 'breathing';
      if (tip.includes('walk')) category = 'movement';
      else if (tip.includes('hydration')) category = 'hydration';
      else if (tip.includes('recovery')) category = 'recovery';
      else if (tip.includes('maintain')) category = 'maintenance';

      await axios.post(`${API}/interventions/log`, {
        deviceId,
        stressIndex: stress.stressIndex,
        activity: sensor?.activity || 0,
        intervention: tip,
        category,
        sessionId,
        metadata: {
          heartRate: sensor?.heartRate,
          buildupDetected: analytics.summary.buildupDetected,
          recoverySeconds: analytics.summary.recoverySeconds,
        },
      });
    } catch (error) {
      console.error('Error logging intervention:', error);
    }
  };

  useEffect(() => {
    const score = Number(stress?.stressIndex || 0);
    const act = Number(sensor?.activity || 0);
    const buildup = analytics?.summary?.buildupDetected;

    if (score > 75 && act < 0.2)
      setTip("You've been stressed for a while — try box breathing for 60 seconds.");
    else if (score > 70 && act < 0.2)
      setTip('Stand up and walk for 2 minutes.');
    else if (score > 60 && buildup)
      setTip('Stress is gradually rising — take a short hydration break.');
    else if (score < 40)
      setTip('Good recovery detected. Keep maintaining this pace.');
    else
      setTip('Stay focused and maintain steady breathing.');
  }, [analytics, sensor, stress]);

  const chart = useMemo(
    () => (analytics.series || []).slice(-300).map((d, i) => ({ idx: i + 1, ...d })),
    [analytics]
  );

  const activityState = Number(sensor?.activity || 0) > 0.2 ? 'Active' : 'Rest';

  return (
    <div className='min-h-screen bg-slate-950 text-white p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header with Toggle */}
        <div className='flex justify-between items-start'>
          <div>
            <h1 className='text-4xl font-bold'>Intervention Dashboard</h1>
            <p className='text-slate-400'>Sensor → Analysis → Action</p>
          </div>
          <button
            onClick={() => setShowLogs(!showLogs)}
            className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all flex items-center gap-2'
          >
            <Plus size={18} />
            {showLogs ? 'Hide Logs' : 'View Logs'}
          </button>
        </div>

        {/* Main Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
          {/* Stress Gauge */}
          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5 flex flex-col items-center'>
              <Gauge className='mb-2' />
              <Ring value={Number(stress?.stressIndex || 0)} />
            </CardContent>
          </Card>

          {/* Activity State */}
          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5'>
              <p className='text-sm text-slate-400'>Activity State</p>
              <div className='mt-3 flex items-center gap-3'>
                <span
                  className={`w-4 h-4 rounded-full ${
                    activityState === 'Rest' ? 'bg-emerald-400' : 'bg-blue-400'
                  }`}
                ></span>
                <span className='text-2xl font-bold'>{activityState}</span>
              </div>
            </CardContent>
          </Card>

          {/* Session Summary */}
          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5'>
              <p className='text-sm text-slate-400'>Session Summary</p>
              <div className='mt-2 space-y-2 text-sm'>
                <div>Max Stress: {Math.round(analytics.summary.maxStress || 0)}</div>
                <div>Spikes: {analytics.summary.spikeCount || 0}</div>
                <div>Recovery: {analytics.summary.recoverySeconds ?? '--'} s</div>
                <div>Avg: {Math.round(analytics.summary.avgStress || 0)}</div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5'>
              <div className='flex items-center gap-2'>
                <Brain className='w-5 h-5' />
                <p className='font-semibold'>Recommendation</p>
              </div>
              <p className='mt-3 text-sm text-slate-300'>{tip}</p>
              <button
                onClick={logCurrentIntervention}
                className='mt-3 w-full px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-all'
              >
                Log This Intervention
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Time Series Chart */}
        <Card className='rounded-2xl bg-white/5 border-0'>
          <CardContent className='p-5'>
            <h2 className='font-semibold mb-4'>10-Minute Stress Time Series</h2>
            <div className='h-96'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={chart}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.15} />
                  <XAxis dataKey='idx' />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line dataKey='stress' strokeWidth={2} dot={false} />
                  <Line dataKey='rolling' strokeWidth={3} dot={false} strokeOpacity={0.7} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5 flex items-center gap-3'>
              <Timer />
              <div>
                <p className='text-sm text-slate-400'>Live Refresh</p>
                <p>Every 4 seconds</p>
              </div>
            </CardContent>
          </Card>

          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5 flex items-center gap-3'>
              <Activity />
              <div>
                <p className='text-sm text-slate-400'>Current Activity</p>
                <p>{sensor?.activity ?? '--'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className='rounded-2xl bg-white/5 border-0'>
            <CardContent className='p-5 flex items-center gap-3'>
              <AlertTriangle />
              <div>
                <p className='text-sm text-slate-400'>Build-up</p>
                <p>{analytics.summary.buildupDetected ? 'Detected' : 'No'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Intervention Logs Section */}
        {showLogs && sessionId && (
          <InterventionLogs sessionId={sessionId} deviceId={deviceId} />
        )}
      </div>
    </div>
  );
}
