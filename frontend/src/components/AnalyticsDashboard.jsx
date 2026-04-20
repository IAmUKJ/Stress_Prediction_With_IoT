import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, TrendingUp, AlertTriangle, Timer } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ScatterChart, Scatter } from 'recharts';

const API='http://localhost:5000/api/analytics';

const Metric=({title,value,icon:Icon})=>(<Card className='rounded-2xl bg-white/5 border-0'><CardContent className='p-5 flex justify-between'><div><p className='text-sm text-slate-400'>{title}</p><h3 className='text-2xl font-bold'>{value}</h3></div><Icon className='w-6 h-6'/></CardContent></Card>);

export default function AnalyticsDashboard(){
 const [data,setData]=useState([]); const [summary,setSummary]=useState({});
 const load=async()=>{const res=await axios.get(API); setData(res.data.series||[]); setSummary(res.data.summary||{});};
 useEffect(()=>{load(); const id=setInterval(load,4000); return ()=>clearInterval(id)},[]);
 const spikes=data.filter((d,i)=>d.spike).map((d,i)=>({x:i+1,y:d.stress}));
 const chart=data.map((d,i)=>({idx:i+1,...d}));
 return <div className='min-h-screen bg-slate-950 text-white p-6'><div className='max-w-7xl mx-auto space-y-6'>
 <div><h1 className='text-4xl font-bold'>Stress Analytics Engine</h1><p className='text-slate-400'>Instantaneous • Short-term Trend • Session Summary</p></div>
 <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
 <Metric title='Build-up Detected' value={summary.buildupDetected?'Yes':'No'} icon={TrendingUp}/>
 <Metric title='Spike Count' value={summary.spikeCount||0} icon={AlertTriangle}/>
 <Metric title='Recovery Time' value={(summary.recoverySeconds??'--') + ' s'} icon={Timer}/>
 <Metric title='Average Stress' value={Math.round(summary.avgStress||0)} icon={Activity}/>
 </div>
 <Card className='rounded-2xl bg-white/5 border-0'><CardContent className='p-5'><h2 className='font-semibold mb-4'>Stress Trend with Rolling Mean</h2><div className='h-96'><ResponsiveContainer width='100%' height='100%'><LineChart data={chart}><CartesianGrid strokeDasharray='3 3' opacity={0.15}/><XAxis dataKey='idx'/><YAxis domain={[0,100]}/><Tooltip/><Line dataKey='stress' strokeWidth={2} dot={false}/><Line dataKey='rolling' strokeWidth={3} dot={false} strokeOpacity={0.7}/></LineChart></ResponsiveContainer></div></CardContent></Card>
 <Card className='rounded-2xl bg-white/5 border-0'><CardContent className='p-5'><h2 className='font-semibold mb-4'>Acute Spike Detection</h2><div className='h-80'><ResponsiveContainer width='100%' height='100%'><ScatterChart><CartesianGrid strokeDasharray='3 3' opacity={0.15}/><XAxis dataKey='x' type='number'/><YAxis dataKey='y' domain={[0,100]} type='number'/><Tooltip cursor={{strokeDasharray:'3 3'}}/><Scatter data={spikes}/></ScatterChart></ResponsiveContainer></div></CardContent></Card>
 </div></div>}
