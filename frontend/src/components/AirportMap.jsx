import React from 'react';

export default function AirportMap({ gates = [], flights = [] }) {
  const getGateColor = (status) => {
    switch (status) {
      case 'available': return '#22c55e';
      case 'occupied': return '#eab308';
      case 'maintenance': return '#64748b';
      case 'closed': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🗺️ Airport Map</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {flights.length} active flights
        </span>
      </div>
      <div className="map-container">
        <svg viewBox="0 0 800 400" className="map-svg">
          <rect x="20" y="20" width="760" height="360" rx="12" fill="none" stroke="var(--border-color)" strokeWidth="1" />

          <rect x="40" y="40" width="340" height="150" rx="8" className="terminal-block" />
          <text x="210" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">Terminal 1</text>

          <rect x="420" y="40" width="340" height="150" rx="8" className="terminal-block" />
          <text x="590" y="100" textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">Terminal 2</text>

          <rect x="40" y="220" width="340" height="140" rx="8" className="terminal-block" />
          <text x="210" y="275" textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">Parking / Cargo</text>

          <rect x="420" y="220" width="340" height="140" rx="8" className="terminal-block" />
          <text x="590" y="275" textAnchor="middle" fill="var(--text-secondary)" fontSize="14" fontWeight="600">Maintenance</text>

          <line x1="380" y1="115" x2="420" y2="115" stroke="var(--accent-cyan)" strokeWidth="2" strokeDasharray="5,5" />

          {gates.slice(0, 20).map((gate, i) => {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const x = 55 + col * 55;
            const y = 130 + row * 30;
            return (
              <g key={gate.gateId || i} className="gate-marker">
                <circle cx={x} cy={y} r="8" fill={getGateColor(gate.status)} opacity="0.8" />
                <text x={x} y={y + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                  {gate.name || gate.gateId}
                </text>
              </g>
            );
          })}

          {flights.slice(0, 5).map((flight, i) => (
            <g key={flight.flightId || i} opacity="0.6">
              <circle cx={150 + i * 120} cy={350} r="4" fill="var(--accent-cyan)" />
              <text x={150 + i * 120} y={365} textAnchor="middle" fill="var(--text-muted)" fontSize="8">
                {flight.flightNumber}
              </text>
            </g>
          ))}

          <text x="40" y="390" fill="var(--text-muted)" fontSize="10">
            ● Available  ● Occupied  ● Maintenance  ● Closed
          </text>
        </svg>
      </div>
    </div>
  );
}
