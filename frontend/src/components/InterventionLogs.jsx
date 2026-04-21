import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Download, RefreshCw, Lightbulb, TrendingUp, Heart } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function InterventionLogs({ sessionId, deviceId }) {
  const [interventions, setInterventions] = useState([]);
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackId, setFeedbackId] = useState(null);
  const [feedback, setFeedback] = useState({ effectiveness: 0, userFeedback: '' });

  // Load interventions and stats
  const loadData = async () => {
    try {
      setLoading(true);
      const [intRes, statsRes] = await Promise.all([
        axios.get(`${API}/interventions/session/${sessionId}`),
        axios.get(`${API}/interventions/${deviceId}/stats`),
      ]);

      setInterventions(intRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load recommendations
  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/interventions/recommendations/${deviceId}`
      );
      setRecommendations(res.data.data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Submit feedback for intervention
  const submitFeedback = async (interventionId) => {
    try {
      await axios.put(
        `${API}/interventions/${interventionId}/feedback`,
        {
          effectiveness: feedback.effectiveness,
          userFeedback: feedback.userFeedback,
          completed: true,
        }
      );
      setFeedbackId(null);
      setFeedback({ effectiveness: 0, userFeedback: '' });
      loadData();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Export session as PDF
  const exportPDF = async () => {
    try {
      const response = await axios.get(
        `${API}/interventions/export/${sessionId}/pdf?deviceId=${deviceId}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `session-${sessionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  useEffect(() => {
    if (sessionId && deviceId) {
      loadData();
    }
  }, [sessionId, deviceId]);

  return (
    <div className='space-y-6 p-6 bg-slate-900 rounded-lg text-white'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h2 className='text-2xl font-bold'>Intervention Logs</h2>
          <p className='text-slate-400'>Session: {sessionId}</p>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={loadRecommendations}
            disabled={loading}
            className='px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 transition-all'
          >
            <Lightbulb size={18} />
            Get AI Recommendations
          </button>
          <button
            onClick={exportPDF}
            className='px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2 transition-all'
          >
            <Download size={18} />
            Export PDF
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className='px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-all'
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <Card className='rounded-lg bg-slate-800 border-slate-700'>
            <CardContent className='p-4'>
              <p className='text-sm text-slate-400'>Total Interventions</p>
              <p className='text-3xl font-bold mt-2'>{stats.total}</p>
            </CardContent>
          </Card>
          <Card className='rounded-lg bg-slate-800 border-slate-700'>
            <CardContent className='p-4'>
              <p className='text-sm text-slate-400'>Completed</p>
              <p className='text-3xl font-bold mt-2 text-green-400'>{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className='rounded-lg bg-slate-800 border-slate-700'>
            <CardContent className='p-4'>
              <p className='text-sm text-slate-400'>Avg Effectiveness</p>
              <p className='text-3xl font-bold mt-2 text-blue-400'>{stats.avgEffectiveness}%</p>
            </CardContent>
          </Card>
          <Card className='rounded-lg bg-slate-800 border-slate-700'>
            <CardContent className='p-4'>
              <p className='text-sm text-slate-400'>Top Intervention</p>
              <p className='text-lg font-bold mt-2 text-purple-400 truncate'>{stats.topIntervention}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gemini Recommendations */}
      {recommendations && (
        <Card className='rounded-lg bg-linear-to-r from-purple-900 to-indigo-900 border-purple-700 p-6'>
          <div className='flex items-start gap-3 mb-4'>
            <Lightbulb className='text-yellow-400' size={24} />
            <div>
              <h3 className='text-xl font-bold'>AI-Powered Recommendations</h3>
              <p className='text-sm text-slate-300'>{recommendations.summary}</p>
            </div>
          </div>

          {recommendations.recommendations && (
            <div className='space-y-3'>
              {recommendations.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className='bg-slate-800/50 p-4 rounded-lg border border-slate-700 hover:border-purple-500 transition-all'
                >
                  <div className='flex justify-between items-start mb-2'>
                    <div>
                      <p className='font-semibold text-white'>{rec.title}</p>
                      <p className='text-xs text-purple-300'>{rec.category}</p>
                    </div>
                    <span className='text-xs bg-purple-600 px-2 py-1 rounded'>{rec.duration} min</span>
                  </div>
                  <p className='text-sm text-slate-300'>{rec.description}</p>
                  <p className='text-xs text-slate-400 mt-2 italic'>{rec.rationale}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Interventions List */}
      <div className='space-y-3'>
        <h3 className='text-lg font-bold'>Recent Interventions</h3>
        {interventions.length > 0 ? (
          interventions.map((intervention) => (
            <Card key={intervention._id} className='rounded-lg bg-slate-800 border-slate-700'>
              <CardContent className='p-4'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-1'>
                      <p className='font-semibold text-lg'>{intervention.intervention}</p>
                      <span className='text-xs bg-blue-600 px-2 py-1 rounded'>{intervention.category}</span>
                      {intervention.completed && (
                        <span className='text-xs bg-green-600 px-2 py-1 rounded'>✓ Completed</span>
                      )}
                    </div>
                    <p className='text-sm text-slate-400'>
                      Stress: {intervention.stressIndex} • Activity: {(intervention.activity * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className='text-right'>
                    {intervention.effectiveness ? (
                      <div>
                        <p className='text-2xl font-bold text-green-400'>{intervention.effectiveness}%</p>
                        <p className='text-xs text-slate-400'>effectiveness</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setFeedbackId(intervention._id)}
                        className='px-3 py-1 bg-amber-600 hover:bg-amber-700 rounded text-sm transition-all'
                      >
                        Rate
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback Form */}
                {feedbackId === intervention._id && (
                  <div className='bg-slate-700/50 p-3 rounded-lg space-y-2 mt-3'>
                    <div>
                      <label className='text-sm text-slate-300'>Effectiveness Score</label>
                      <input
                        type='range'
                        min='0'
                        max='100'
                        value={feedback.effectiveness}
                        onChange={(e) =>
                          setFeedback({ ...feedback, effectiveness: parseInt(e.target.value) })
                        }
                        className='w-full'
                      />
                      <p className='text-xs text-slate-400'>{feedback.effectiveness}%</p>
                    </div>
                    <div>
                      <label className='text-sm text-slate-300'>Your Feedback</label>
                      <textarea
                        value={feedback.userFeedback}
                        onChange={(e) => setFeedback({ ...feedback, userFeedback: e.target.value })}
                        placeholder='How did this intervention work for you?'
                        className='w-full bg-slate-600 text-white rounded px-2 py-1 text-sm'
                        rows='2'
                      />
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => submitFeedback(intervention._id)}
                        className='px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm transition-all'
                      >
                        Submit
                      </button>
                      <button
                        onClick={() => setFeedbackId(null)}
                        className='px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded text-sm transition-all'
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {intervention.userFeedback && (
                  <p className='text-sm text-slate-300 mt-2 italic'>💬 {intervention.userFeedback}</p>
                )}

                <p className='text-xs text-slate-500 mt-2'>
                  {new Date(intervention.createdAt).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className='text-slate-400 text-center py-8'>No interventions logged yet</p>
        )}
      </div>
    </div>
  );
}
