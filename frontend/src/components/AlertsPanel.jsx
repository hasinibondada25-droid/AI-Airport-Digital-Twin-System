import React, { useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

export default function AlertsPanel({ events = [], flights = [], gates = [], metrics = {} }) {
  const [aiAlerts, setAiAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!metrics || Object.keys(metrics).length === 0) return;
    const fetchAlerts = async () => {
      setLoading(true);
      try {
        const result = await api.generateAlerts({
          flights: flights.slice(0, 30),
          gates: gates.slice(0, 30),
          events: events.slice(0, 10),
          metrics
        });
        setAiAlerts(result.data?.alerts || result.alerts || []);
      } catch (e) {
        // fallback alerts on failure
        setAiAlerts(generateLocalAlerts(metrics));
      }
      setLoading(false);
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 20000);
    return () => clearInterval(interval);
  }, [events.length, metrics.tick]);

  useEffect(() => {
    const handleSmartAlerts = (data) => {
      if (!metrics || Object.keys(metrics).length === 0) return;
      api.generateAlerts({
        flights: (data.flights || []).slice(0, 30),
        gates: (data.gates || []).slice(0, 30),
        events: (data.events || []).slice(0, 10),
        metrics: data.metrics || metrics
      }).then(result => {
        setAiAlerts(result.data?.alerts || result.alerts || []);
      }).catch(() => {});
    };
    socketService.on('smart-alerts', handleSmartAlerts);
    return () => socketService.off('smart-alerts', handleSmartAlerts);
  }, [metrics]);

  const allAlerts = [...aiAlerts, ...events.map(e => ({
    id: e.eventId || e._id,
    type: e.type,
    severity: e.severity,
    title: e.title,
    description: e.description,
    recommendation: getDefaultRecommendation(e.type),
    source: e.source || 'system',
    status: e.status,
    createdAt: e.createdAt
  }))];

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
  const sorted = allAlerts.sort((a, b) => {
    const sa = severityOrder[a.severity] ?? 99;
    const sb = severityOrder[b.severity] ?? 99;
    if (sa !== sb) return sa - sb;
    return new Date(b.createdAt || b.generated_at || 0) - new Date(a.createdAt || a.generated_at || 0);
  }).slice(0, 15);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Smart Alerts</h3>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {loading && <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />}
          <span className="badge badge-red">{sorted.filter(a => a.status === 'active').length}</span>
        </div>
      </div>
      <div className="scrollable" style={{ maxHeight: 350 }}>
        {sorted.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No active alerts</div>
          </div>
        )}
        {sorted.map((alert, i) => (
          <div key={alert.id || alert.eventId || alert._id || i} className={`alert-item ${alert.severity || 'low'}`}>
            <div className="alert-title">{alert.title || 'Unknown Alert'}</div>
            {alert.description && (
              <div className="alert-description">{alert.description}</div>
            )}
            {alert.recommendation && (
              <div style={{ fontSize: 11, color: 'var(--accent-cyan)', marginTop: 4, fontStyle: 'italic' }}>
                {alert.recommendation}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`status-badge ${alert.severity}`} style={{ fontSize: 10 }}>
                {alert.severity}
              </span>
              <span className="alert-time">
                {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : alert.generated_at ? new Date(alert.generated_at).toLocaleTimeString() : ''}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {alert.type} {alert.source === 'ai-engine' ? 'AI' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getDefaultRecommendation(type) {
  const recs = {
    weather: 'Monitor weather updates and adjust flight schedules',
    security: 'Coordinate with airport security team',
    technical: 'Dispatch maintenance team to investigate',
    operational: 'Review and adjust operational procedures',
    emergency: 'Activate emergency response protocol',
    delay: 'Prioritize delayed flights for departure',
    congestion: 'Redirect passengers to less congested areas',
    gate: 'Optimize gate assignments',
    system: 'Continue standard monitoring procedures'
  };
  return recs[type] || 'Review and respond as per standard procedures';
}

function generateLocalAlerts(metrics) {
  const alerts = [];
  const c = metrics.congestionIndex || 0;
  const d = metrics.delayedFlights || 0;
  const t = metrics.totalFlights || 0;
  const a = metrics.availableGates ?? 1;
  const tg = metrics.totalGates || 1;
  if (c > 70) alerts.push({ id: `ALT-local-1`, type: 'congestion', severity: 'high', title: 'High Congestion', description: `Congestion at ${Math.round(c)}%`, recommendation: 'Open additional lanes', source: 'ai-engine', status: 'active', createdAt: new Date().toISOString() });
  if (t > 0 && (d / t) > 0.3) alerts.push({ id: `ALT-local-2`, type: 'delay', severity: 'medium', title: `${d} Delayed Flights`, description: `${Math.round((d / t) * 100)}% delay rate`, recommendation: 'Review scheduling', source: 'ai-engine', status: 'active', createdAt: new Date().toISOString() });
  if (a === 0) alerts.push({ id: `ALT-local-3`, type: 'gate', severity: 'critical', title: 'No Available Gates', description: 'All gates occupied', recommendation: 'Release gates or divert', source: 'ai-engine', status: 'active', createdAt: new Date().toISOString() });
  if (alerts.length === 0) alerts.push({ id: `ALT-local-0`, type: 'system', severity: 'low', title: 'Normal Operations', description: 'All metrics within threshold', recommendation: 'Continue monitoring', source: 'ai-engine', status: 'active', createdAt: new Date().toISOString() });
  return alerts;
}
