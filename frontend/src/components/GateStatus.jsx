import React from 'react';

export default function GateStatus({ gates = [], onSelectGate }) {
  const available = gates.filter(g => g.status === 'available').length;
  const occupied = gates.filter(g => g.status === 'occupied').length;
  const maintenance = gates.filter(g => g.status === 'maintenance').length;
  const closed = gates.filter(g => g.status === 'closed').length;

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🚪 Gate Status</h3>
        <div style={{ display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--accent-green)' }}>● {available} Free</span>
          <span style={{ fontSize: 12, color: 'var(--accent-yellow)' }}>● {occupied} Used</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>● {maintenance} Maint</span>
        </div>
      </div>
      <div className="gate-grid">
        {gates.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <div className="empty-state-text">No gates loaded</div>
          </div>
        )}
        {gates.map(gate => (
          <div
            key={gate._id || gate.gateId}
            className={`gate-cell ${gate.status}`}
            onClick={() => onSelectGate && onSelectGate(gate)}
          >
            <div className="gate-name">{gate.name || gate.gateId}</div>
            <div className="gate-status-text">{gate.status}</div>
            <div className="progress-bar" style={{ marginTop: 4, width: '100%' }}>
              <div
                className={`progress-fill ${gate.currentLoad > 80 ? 'high' : gate.currentLoad > 50 ? 'medium' : 'low'}`}
                style={{ width: `${(gate.currentLoad / (gate.capacity || 200)) * 100}%` }}
              />
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {gate.currentLoad}/{gate.capacity}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
