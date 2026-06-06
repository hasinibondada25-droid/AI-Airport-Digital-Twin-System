import React, { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import socketService from '../services/socket';
import api from '../services/api';
import { CHART_COLORS } from '../utils/constants';

Chart.register(...registerables);

export default function Analytics() {
  const [metrics, setMetrics] = useState({
    flights: [], gates: [], events: [],
    efficiencyHistory: [],
    congestionHistory: [],
    delayHistory: []
  });
  const [aiPrediction, setAiPrediction] = useState(null);

  useEffect(() => {
    const handleStateUpdate = (data) => {
      if (data.metrics) {
        setMetrics(prev => ({
          ...prev,
          flights: data.flights || prev.flights,
          gates: data.gates || prev.gates,
          events: data.events || prev.events,
          efficiencyHistory: [
            ...(prev.efficiencyHistory || []).slice(-20),
            data.metrics.efficiencyScore || 0
          ],
          congestionHistory: [
            ...(prev.congestionHistory || []).slice(-20),
            data.metrics.congestionIndex || 0
          ],
          delayHistory: [
            ...(prev.delayHistory || []).slice(-20),
            data.metrics.delayIndex || 0
          ]
        }));
      }
    };

    socketService.on('state-update', handleStateUpdate);
    socketService.connect();

    return () => {
      socketService.off('state-update', handleStateUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const result = await api.predictDelay({
          hour: new Date().getHours(),
          weather_impact: 'medium',
          traffic_level: 'high'
        });
        setAiPrediction(result.data || result);
      } catch (e) {
        // ignore
      }
    };
    fetchPrediction();
  }, []);

  const labels = metrics.efficiencyHistory.map((_, i) => `T${i + 1}`);

  const lineData = {
    labels,
    datasets: [
      {
        label: 'Efficiency',
        data: metrics.efficiencyHistory,
        borderColor: CHART_COLORS.blue,
        backgroundColor: CHART_COLORS.blueBg,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Congestion',
        data: metrics.congestionHistory,
        borderColor: CHART_COLORS.yellow,
        backgroundColor: CHART_COLORS.yellowBg,
        fill: true,
        tension: 0.4
      },
      {
        label: 'Delay Index',
        data: metrics.delayHistory,
        borderColor: CHART_COLORS.red,
        backgroundColor: CHART_COLORS.redBg,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const statusCounts = {};
  (metrics.flights || []).forEach(f => {
    statusCounts[f.status] = (statusCounts[f.status] || 0) + 1;
  });

  const doughnutData = {
    labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: ['#3b82f6', '#22c55e', '#a855f7', '#06b6d4', '#eab308', '#ef4444'],
      borderWidth: 0
    }]
  };

  const gateUtil = { available: 0, occupied: 0, maintenance: 0, closed: 0 };
  (metrics.gates || []).forEach(g => {
    gateUtil[g.status] = (gateUtil[g.status] || 0) + 1;
  });

  const barData = {
    labels: ['Available', 'Occupied', 'Maintenance', 'Closed'],
    datasets: [{
      label: 'Gates',
      data: [gateUtil.available, gateUtil.occupied, gateUtil.maintenance, gateUtil.closed],
      backgroundColor: ['#22c55e', '#eab308', '#64748b', '#ef4444']
    }]
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📈 Analytics</h1>
      </div>

      {aiPrediction && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-header">
            <h3 className="card-title">🧠 AI Delay Prediction</h3>
            <span className="badge badge-blue">Live</span>
          </div>
          <div className="metrics-row">
            <div className="metric">
              <div className="metric-value" style={{ color: aiPrediction.risk_level === 'high' ? 'var(--accent-red)' : aiPrediction.risk_level === 'medium' ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                {(aiPrediction.delay_probability * 100).toFixed(1)}%
              </div>
              <div className="metric-label">Delay Probability</div>
            </div>
            <div className="metric">
              <div className="metric-value">{aiPrediction.estimated_delay_minutes || 0}m</div>
              <div className="metric-label">Est. Delay</div>
            </div>
            <div className="metric">
              <div className="metric-value" style={{ textTransform: 'capitalize' }}>{aiPrediction.risk_level}</div>
              <div className="metric-label">Risk Level</div>
            </div>
            <div className="metric">
              <div className="metric-value">{((aiPrediction.confidence || 0) * 100).toFixed(0)}%</div>
              <div className="metric-label">Confidence</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Performance Trends</h3>
          </div>
          <div style={{ height: 250 }}>
            {metrics.efficiencyHistory.length > 0 ? (
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } },
                  scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
                    y: { ticks: { color: '#64748b' }, grid: { color: '#334155' }, beginAtZero: true, max: 100 }
                  }
                }}
              />
            ) : (
              <div className="empty-state"><div className="empty-state-text">Waiting for data...</div></div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Flight Status Distribution</h3>
          </div>
          <div style={{ height: 250, display: 'flex', justifyContent: 'center' }}>
            {Object.keys(statusCounts).length > 0 ? (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 12 } }
                  }
                }}
              />
            ) : (
              <div className="empty-state"><div className="empty-state-text">No flights</div></div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gate Utilization</h3>
          </div>
          <div style={{ height: 250 }}>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { ticks: { color: '#64748b' }, grid: { display: false } },
                  y: { ticks: { color: '#64748b' }, grid: { color: '#334155' }, beginAtZero: true }
                }
              }}
            />
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Metrics</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '8px 0' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Efficiency Score</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {metrics.efficiencyHistory.length > 0 ? `${Math.round(metrics.efficiencyHistory[metrics.efficiencyHistory.length - 1])}%` : 'N/A'}
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill low" style={{ width: `${metrics.efficiencyHistory.length > 0 ? metrics.efficiencyHistory[metrics.efficiencyHistory.length - 1] : 0}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Congestion Level</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {metrics.congestionHistory.length > 0 ? `${Math.round(metrics.congestionHistory[metrics.congestionHistory.length - 1])}%` : 'N/A'}
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${(metrics.congestionHistory.length > 0 ? metrics.congestionHistory[metrics.congestionHistory.length - 1] : 0) > 60 ? 'high' : 'medium'}`}
                  style={{ width: `${metrics.congestionHistory.length > 0 ? metrics.congestionHistory[metrics.congestionHistory.length - 1] : 0}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Delay Rate</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  {metrics.delayHistory.length > 0 ? `${Math.round(metrics.delayHistory[metrics.delayHistory.length - 1])}%` : 'N/A'}
                </span>
              </div>
              <div className="progress-bar">
                <div className={`progress-fill ${(metrics.delayHistory.length > 0 ? metrics.delayHistory[metrics.delayHistory.length - 1] : 0) > 30 ? 'high' : 'medium'}`}
                  style={{ width: `${metrics.delayHistory.length > 0 ? metrics.delayHistory[metrics.delayHistory.length - 1] : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
