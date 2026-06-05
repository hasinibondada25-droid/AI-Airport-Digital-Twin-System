import React, { useState } from 'react';

export default function FlightTable({ flights = [], onSelectFlight }) {
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('scheduledDeparture');

  const filtered = filterStatus
    ? flights.filter(f => f.status === filterStatus)
    : flights;

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'scheduledDeparture') {
      return new Date(a.scheduledDeparture) - new Date(b.scheduledDeparture);
    }
    if (sortBy === 'delayRisk') return b.delayRisk - a.delayRisk;
    return 0;
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">✈️ Flights</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="boarding">Boarding</option>
            <option value="departed">Departed</option>
            <option value="delayed">Delayed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="badge badge-blue">{flights.length} total</span>
        </div>
      </div>
      <div className="table-wrapper scrollable" style={{ maxHeight: 400 }}>
        <table>
          <thead>
            <tr>
              <th>Flight</th>
              <th>Route</th>
              <th>Departure</th>
              <th>Gate</th>
              <th>Status</th>
              <th>Delay</th>
              <th>Risk</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>
                  No flights found
                </td>
              </tr>
            )}
            {sorted.map(flight => (
              <tr
                key={flight._id || flight.flightId}
                onClick={() => onSelectFlight && onSelectFlight(flight)}
                style={{ cursor: onSelectFlight ? 'pointer' : 'default' }}
              >
                <td>
                  <strong>{flight.flightNumber || flight.flightId}</strong>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{flight.airline}</div>
                </td>
                <td>
                  {flight.origin} → {flight.destination}
                </td>
                <td>
                  {new Date(flight.scheduledDeparture).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td>{flight.gate || '—'}</td>
                <td>
                  <span className={`status-badge ${flight.status}`}>{flight.status}</span>
                </td>
                <td>
                  {flight.delayMinutes > 0 ? (
                    <span style={{ color: 'var(--accent-yellow)' }}>+{flight.delayMinutes}m</span>
                  ) : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div className="progress-bar" style={{ width: 60 }}>
                      <div
                        className={`progress-fill ${flight.delayRisk > 0.6 ? 'high' : flight.delayRisk > 0.3 ? 'medium' : 'low'}`}
                        style={{ width: `${flight.delayRisk * 100}%` }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {Math.round(flight.delayRisk * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
