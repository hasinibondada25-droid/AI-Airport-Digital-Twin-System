import React from 'react';

export default function AlertsPanel({ events = [] }) {
  const sorted = [...events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  const sortedBySeverity = [...sorted].sort((a, b) => {
    return (severityOrder[a.severity] || 99) - (severityOrder[b.severity] || 99);
  });

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🚨 Alerts & Events</h3>
        {events.length > 0 && (
          <span className="badge badge-red">{events.length} active</span>
        )}
      </div>
      <div className="scrollable" style={{ maxHeight: 350 }}>
        {sortedBySeverity.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <div className="empty-state-text">No active alerts</div>
          </div>
        )}
        {sortedBySeverity.map((event, i) => (
          <div key={event._id || event.eventId || i} className={`alert-item ${event.severity || 'low'}`}>
            <div className="alert-title">{event.title || 'Unknown Event'}</div>
            {event.description && (
              <div className="alert-description">{event.description}</div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
              <span className={`status-badge ${event.severity}`} style={{ fontSize: 10 }}>
                {event.severity}
              </span>
              <span className="alert-time">
                {event.createdAt ? new Date(event.createdAt).toLocaleTimeString() : ''}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {event.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
