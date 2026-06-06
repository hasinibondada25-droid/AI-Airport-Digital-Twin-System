import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function RunwayTraffic({ metrics }) {
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const fetchRunwayPrediction = async () => {
      try {
        const now = new Date();
        const result = await api.predictRunway({
          hour: now.getHours(),
          scheduled_takeoffs: Math.floor(Math.random() * 10) + 10,
          scheduled_landings: Math.floor(Math.random() * 10) + 10,
          weather_condition: ['clear', 'rain', 'fog', 'storm'][Math.floor(Math.random() * 3)],
          time_of_day: now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening'
        });
        setPrediction(result.data || result);
      } catch (e) {
        // ignore
      }
    };
    fetchRunwayPrediction();
    const interval = setInterval(fetchRunwayPrediction, 15000);
    return () => clearInterval(interval);
  }, []);

  const occ = prediction?.runway_occupancy_percentage ?? metrics?.runwayOccupancy ?? 0;
  const queue = prediction?.queue_length ?? metrics?.runwayQueueLength ?? 0;
  const wait = prediction?.average_wait_minutes ?? 0;
  const congestion = prediction?.congestion_level ?? (occ > 70 ? 'high' : occ > 40 ? 'moderate' : 'low');
  const spacing = prediction?.recommended_spacing_seconds ?? 0;
  const recs = prediction?.recommendations ?? [];

  const occColor = occ > 80 ? 'var(--accent-red)' : occ > 50 ? 'var(--accent-yellow)' : 'var(--accent-green)';

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Runway Traffic</h3>
        <span className={`badge ${congestion === 'critical' ? 'badge-red' : congestion === 'high' ? 'badge-red' : congestion === 'moderate' ? 'badge-yellow' : 'badge-green'}`}>
          {congestion}
        </span>
      </div>
      <div className="metrics-row" style={{ marginBottom: 12 }}>
        <div className="metric" style={{ padding: 12 }}>
          <div className="metric-value" style={{ color: occColor, fontSize: 24 }}>{occ}%</div>
          <div className="metric-label">Occupancy</div>
        </div>
        <div className="metric" style={{ padding: 12 }}>
          <div className="metric-value" style={{ fontSize: 24 }}>{queue}</div>
          <div className="metric-label">Queue</div>
        </div>
        <div className="metric" style={{ padding: 12 }}>
          <div className="metric-value" style={{ fontSize: 24 }}>{wait}m</div>
          <div className="metric-label">Avg Wait</div>
        </div>
        <div className="metric" style={{ padding: 12 }}>
          <div className="metric-value" style={{ fontSize: 24 }}>{spacing}s</div>
          <div className="metric-label">Spacing</div>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Runway Utilization</span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{occ}%</span>
        </div>
        <div className="progress-bar">
          <div className={`progress-fill ${occ > 70 ? 'high' : occ > 40 ? 'medium' : 'low'}`}
            style={{ width: `${occ}%` }} />
        </div>
      </div>
      {recs.length > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {recs.slice(0, 2).map((r, i) => (
            <div key={i} style={{ padding: '4px 0', borderTop: '1px solid var(--border-color)', marginTop: 4 }}>
              {r}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
