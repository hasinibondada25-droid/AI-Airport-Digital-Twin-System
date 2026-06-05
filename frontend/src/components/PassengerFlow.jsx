import React from 'react';
import { PASSENGER_STAGES } from '../utils/constants';

export default function PassengerFlow({ stages = {}, totalPassengers = 0 }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🧍 Passenger Flow</h3>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {totalPassengers.toLocaleString()} total
        </span>
      </div>
      <div className="passenger-flow">
        {PASSENGER_STAGES.map((stage, idx) => {
          const data = stages[stage.id] || { count: 0, bottleneck: false, queueTime: 0 };
          return (
            <React.Fragment key={stage.id}>
              <div className="flow-stage">
                <div className="flow-stage-icon">{stage.icon}</div>
                <div className="flow-stage-name">{stage.label}</div>
                <div className="flow-stage-count">{data.count || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {data.queueTime || 0}min wait
                </div>
                {data.bottleneck && (
                  <span className="badge badge-red" style={{ marginTop: 4 }}>Bottleneck</span>
                )}
              </div>
              {idx < PASSENGER_STAGES.length - 1 && (
                <div className="flow-arrow">→</div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
