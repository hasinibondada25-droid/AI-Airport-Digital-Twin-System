import React, { useState, useEffect } from 'react';
import api from '../services/api';
import socketService from '../services/socket';

export default function AdminPanel() {
  const [tab, setTab] = useState('config');
  const [flights, setFlights] = useState([]);
  const [gates, setGates] = useState([]);
  const [events, setEvents] = useState([]);
  const [newFlight, setNewFlight] = useState({
    flightId: '', airline: '', flightNumber: '', origin: '',
    destination: '', scheduledDeparture: '', status: 'scheduled',
    passengerCount: 150
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
    socketService.on('state-update', (data) => {
      if (data.flights) setFlights(data.flights);
      if (data.gates) setGates(data.gates);
      if (data.events) setEvents(data.events);
    });
    socketService.connect();
    return () => socketService.disconnect();
  }, []);

  const loadData = async () => {
    try {
      const [fRes, gRes, eRes] = await Promise.all([
        api.getFlights(),
        api.getGates(),
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events`).catch(() => ({ json: () => ({ data: [] }) }))
      ]);
      if (fRes.success) setFlights(fRes.data);
      if (gRes.success) setGates(gRes.data);
      const eData = await eRes.json();
      if (eData.success) setEvents(eData.data);
    } catch (err) {
      console.error('Load data error:', err);
    }
  };

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await api.createFlight(newFlight);
      if (res.success) {
        setMessage('Flight created successfully!');
        setNewFlight({
          flightId: '', airline: '', flightNumber: '', origin: '',
          destination: '', scheduledDeparture: '', status: 'scheduled',
          passengerCount: 150
        });
        loadData();
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm(`Delete flight ${flightId}?`)) return;
    try {
      await api.deleteFlight(flightId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseGate = async (gateId) => {
    try {
      await api.releaseGate(gateId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Panel</h1>
        <button className="btn btn-primary" onClick={loadData}>🔄 Refresh</button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'config' ? 'active' : ''}`} onClick={() => setTab('config')}>System Config</button>
        <button className={`tab ${tab === 'flights' ? 'active' : ''}`} onClick={() => setTab('flights')}>Manage Flights</button>
        <button className={`tab ${tab === 'gates' ? 'active' : ''}`} onClick={() => setTab('gates')}>Manage Gates</button>
        <button className={`tab ${tab === 'events' ? 'active' : ''}`} onClick={() => setTab('events')}>Events Log</button>
      </div>

      {tab === 'config' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">System Configuration</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 400 }}>
            <div className="form-group">
              <label className="form-label">Backend API URL</label>
              <input className="form-input" value={import.meta.env.VITE_API_URL || 'http://localhost:5000'} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Flask AI URL</label>
              <input className="form-input" value={import.meta.env.VITE_FLASK_URL || 'http://localhost:5001'} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Socket URL</label>
              <input className="form-input" value={import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'} readOnly />
            </div>
            <div className="card" style={{ background: 'var(--bg-input)' }}>
              <div className="metrics-row">
                <div className="metric" style={{ minWidth: 100, padding: 12 }}>
                  <div className="metric-value" style={{ fontSize: 18 }}>{flights.length}</div>
                  <div className="metric-label">Flights</div>
                </div>
                <div className="metric" style={{ minWidth: 100, padding: 12 }}>
                  <div className="metric-value" style={{ fontSize: 18 }}>{gates.length}</div>
                  <div className="metric-label">Gates</div>
                </div>
                <div className="metric" style={{ minWidth: 100, padding: 12 }}>
                  <div className="metric-value" style={{ fontSize: 18 }}>{events.length}</div>
                  <div className="metric-label">Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'flights' && (
        <div className="grid grid-cols-2" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Create Flight</h3>
            </div>
            <form onSubmit={handleCreateFlight}>
              <div className="form-group">
                <label className="form-label">Flight ID</label>
                <input className="form-input" value={newFlight.flightId} onChange={e => setNewFlight({ ...newFlight, flightId: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Airline</label>
                <input className="form-input" value={newFlight.airline} onChange={e => setNewFlight({ ...newFlight, airline: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Flight Number</label>
                <input className="form-input" value={newFlight.flightNumber} onChange={e => setNewFlight({ ...newFlight, flightNumber: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Origin</label>
                  <input className="form-input" value={newFlight.origin} onChange={e => setNewFlight({ ...newFlight, origin: e.target.value })} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Destination</label>
                  <input className="form-input" value={newFlight.destination} onChange={e => setNewFlight({ ...newFlight, destination: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Departure Time</label>
                <input className="form-input" type="datetime-local" value={newFlight.scheduledDeparture} onChange={e => setNewFlight({ ...newFlight, scheduledDeparture: e.target.value })} required />
              </div>
              <button className="btn btn-success" type="submit" disabled={loading}>
                {loading ? 'Creating...' : '✈️ Create Flight'}
              </button>
              {message && <div style={{ marginTop: 8, padding: 8, background: 'var(--bg-input)', borderRadius: 'var(--radius)', fontSize: 13 }}>{message}</div>}
            </form>
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">All Flights ({flights.length})</h3>
            </div>
            <div className="table-wrapper scrollable" style={{ maxHeight: 400 }}>
              <table>
                <thead>
                  <tr>
                    <th>Flight</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Gate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.map(f => (
                    <tr key={f._id || f.flightId}>
                      <td><strong>{f.flightNumber || f.flightId}</strong></td>
                      <td>{f.origin} → {f.destination}</td>
                      <td><span className={`status-badge ${f.status}`}>{f.status}</span></td>
                      <td>{f.gate || '—'}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteFlight(f.flightId)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {flights.length === 0 && (
                    <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No flights</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'gates' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Gate Management ({gates.length})</h3>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Gate</th>
                  <th>Terminal</th>
                  <th>Status</th>
                  <th>Load</th>
                  <th>Flight</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {gates.map(g => (
                  <tr key={g._id || g.gateId}>
                    <td><strong>{g.name || g.gateId}</strong></td>
                    <td>{g.terminal}</td>
                    <td><span className={`status-badge ${g.status}`}>{g.status}</span></td>
                    <td>
                      <div className="progress-bar" style={{ width: 80 }}>
                        <div className={`progress-fill ${g.currentLoad > 80 ? 'high' : g.currentLoad > 50 ? 'medium' : 'low'}`}
                          style={{ width: `${(g.currentLoad / (g.capacity || 200)) * 100}%` }} />
                      </div>
                    </td>
                    <td>{g.currentFlightId || '—'}</td>
                    <td>
                      {g.status === 'occupied' && (
                        <button className="btn btn-warning btn-sm" onClick={() => handleReleaseGate(g.gateId)}>Release</button>
                      )}
                      {g.status !== 'occupied' && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'events' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Events Log ({events.length})</h3>
          </div>
          <div className="table-wrapper scrollable" style={{ maxHeight: 500 }}>
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((e, i) => (
                  <tr key={e._id || e.eventId || i}>
                    <td style={{ fontSize: 12 }}>{e.createdAt ? new Date(e.createdAt).toLocaleString() : '—'}</td>
                    <td><span className={`status-badge ${e.severity || 'low'}`}>{e.type}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{e.severity}</td>
                    <td>{e.title}</td>
                    <td><span className={`status-badge ${e.status || 'active'}`}>{e.status || 'active'}</span></td>
                  </tr>
                ))}
                {events.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
