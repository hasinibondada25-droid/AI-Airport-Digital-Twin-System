import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function LiveDataPanel() {
  const [status, setStatus] = useState(null);
  const [liveFlights, setLiveFlights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  useEffect(() => {
    api.getLiveStatus().then(res => {
      if (res.success) setStatus(res.data);
    }).catch(() => {});
  }, []);

  const handleFetchLive = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getLiveFlights('?limit=10');
      if (res.success) {
        setLiveFlights(res.data || []);
      } else {
        setError(res.error || 'Failed to fetch live flights');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await api.seedLiveFlights();
      setSeedResult(res);
    } catch (err) {
      setSeedResult({ success: false, error: err.message });
    }
    setSeeding(false);
  };

  const getTime = (dateStr) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">✈️ Live Aviation Data</h3>
        <span className={`badge ${status?.configured ? 'badge-green' : 'badge-yellow'}`}>
          {status?.configured ? 'API Connected' : 'Demo Mode'}
        </span>
      </div>

      {!status?.configured && (
        <div style={{ padding: '8px 12px', marginBottom: 8, background: 'rgba(234,179,8,0.1)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--accent-yellow)' }}>
          Running in demo mode with generated flight data.
          <br />
          Set <code>LIVE_AVIATION_API_KEY</code> env var for real data from AviationStack.
          <br />
          <a href="https://aviationstack.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)' }}>
            Get a free API key
          </a>
        </div>
      )}

      {error && (
        <div style={{ padding: '8px 12px', marginBottom: 8, background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--accent-red)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button className="btn btn-primary btn-sm" onClick={handleFetchLive} disabled={loading}>
          {loading ? 'Fetching...' : '📡 Fetch Live Flights'}
        </button>
        <button className="btn btn-success btn-sm" onClick={handleSeed} disabled={seeding}>
          {seeding ? 'Seeding...' : '🌱 Seed Simulation'}
        </button>
      </div>

      {seedResult && (
        <div style={{ padding: '8px 12px', marginBottom: 8, background: seedResult.success ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius)', fontSize: 12 }}>
          {seedResult.success
            ? `✓ ${seedResult.count} live flights added to simulation`
            : `✗ ${seedResult.error || 'Seed failed'}`}
        </div>
      )}

      {liveFlights.length > 0 && (
        <div className="table-wrapper" style={{ maxHeight: 300 }}>
          <table>
            <thead>
              <tr>
                <th>Flight</th>
                <th>Route</th>
                <th>Dep</th>
                <th>Arr</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {liveFlights.map(f => (
                <tr key={f.flightId}>
                  <td><strong>{f.flightNumber}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{f.airline}</span></td>
                  <td style={{ fontSize: 13 }}>{f.origin} → {f.destination}</td>
                  <td style={{ fontSize: 12 }}>{getTime(f.scheduledDeparture)}</td>
                  <td style={{ fontSize: 12 }}>{getTime(f.scheduledArrival)}</td>
                  <td><span className={`status-badge ${f.status}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {liveFlights.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>
          Click "Fetch Live Flights" to see real-time aviation data
        </div>
      )}
    </div>
  );
}
