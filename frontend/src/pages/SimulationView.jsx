import React, { useState, useEffect } from 'react';
import socketService from '../services/socket';
import api from '../services/api';
import FlightTable from '../components/FlightTable';
import GateStatus from '../components/GateStatus';
import AlertsPanel from '../components/AlertsPanel';
import PassengerFlow from '../components/PassengerFlow';
import { SIMULATION_SPEEDS } from '../utils/constants';

export default function SimulationView() {
  const [state, setState] = useState({
    flights: [],
    gates: [],
    events: [],
    metrics: {},
    tick: 0,
    running: false,
    passengerStages: {},
    totalPassengers: 0
  });
  const [speed, setSpeed] = useState(5000);
  const [scenarioInput, setScenarioInput] = useState({
    extra_flights: 5,
    weather_condition: 'normal',
    security_level: 'normal'
  });
  const [scenarioResult, setScenarioResult] = useState(null);

  useEffect(() => {
    const handleStateUpdate = (data) => {
      setState(prev => ({
        ...prev,
        flights: data.flights || prev.flights,
        gates: data.gates || prev.gates,
        events: data.events || prev.events,
        metrics: data.metrics || prev.metrics,
        tick: data.tick || prev.tick
      }));
    };

    const handlePassengerUpdate = (data) => {
      setState(prev => ({
        ...prev,
        passengerStages: data.stages,
        totalPassengers: data.totalPassengers
      }));
    };

    socketService.on('state-update', handleStateUpdate);
    socketService.on('passenger-update', handlePassengerUpdate);
    socketService.connect();

    return () => {
      socketService.off('state-update', handleStateUpdate);
      socketService.off('passenger-update', handlePassengerUpdate);
    };
  }, []);

  useEffect(() => {
    api.getStatus().then(res => {
      if (res.success) {
        setState(prev => ({ ...prev, running: res.data.running, tick: res.data.tick }));
      }
    }).catch(() => {});
  }, []);

  const handleStart = async () => {
    try {
      await api.startSimulation(speed);
      setState(prev => ({ ...prev, running: true }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStop = async () => {
    try {
      await api.stopSimulation();
      setState(prev => ({ ...prev, running: false }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunScenario = async () => {
    try {
      const res = await api.runScenario({
        ...scenarioInput,
        type: 'what-if'
      });
      setScenarioResult(res.data || res);
    } catch (err) {
      console.error(err);
    }
  };

  const { flights, gates, events, metrics, passengerStages, totalPassengers, running, tick } = state;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎮 Simulation Control</h1>
        <div className="flight-status-bar">
          <span>🔄 Tick: <strong>{tick}</strong></span>
          <span>
            <span className={`status-dot ${running ? 'online' : 'offline'}`} />
            {running ? 'Running' : 'Stopped'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚙️ Simulation Controls</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Simulation Speed</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {SIMULATION_SPEEDS.map(s => (
                  <button
                    key={s.value}
                    className={`btn ${speed === s.value ? 'btn-primary' : ''} btn-sm`}
                    onClick={() => setSpeed(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-success"
                onClick={handleStart}
                disabled={running}
              >
                ▶ Start
              </button>
              <button
                className="btn btn-danger"
                onClick={handleStop}
                disabled={!running}
              >
                ⏹ Stop
              </button>
            </div>
            <div className="metrics-row">
              <div className="metric">
                <div className="metric-value">{metrics.totalFlights ?? 0}</div>
                <div className="metric-label">Flights</div>
              </div>
              <div className="metric">
                <div className="metric-value" style={{ color: 'var(--accent-green)' }}>
                  {metrics.availableGates ?? 0}
                </div>
                <div className="metric-label">Free Gates</div>
              </div>
              <div className="metric">
                <div className="metric-value">{tick}</div>
                <div className="metric-label">Ticks</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🔮 What-If Scenario Engine</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Extra Flights</label>
              <input
                className="form-input"
                type="number"
                min={0}
                max={50}
                value={scenarioInput.extra_flights}
                onChange={e => setScenarioInput({ ...scenarioInput, extra_flights: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weather Condition</label>
              <select
                className="form-select"
                value={scenarioInput.weather_condition}
                onChange={e => setScenarioInput({ ...scenarioInput, weather_condition: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="rain">Rain</option>
                <option value="storm">Storm</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Security Level</label>
              <select
                className="form-select"
                value={scenarioInput.security_level}
                onChange={e => setScenarioInput({ ...scenarioInput, security_level: e.target.value })}
              >
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleRunScenario}>
              🚀 Run Scenario
            </button>

            {scenarioResult && (
              <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-input)', borderRadius: 'var(--radius)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Predicted Outcomes</h4>
                <div className="metrics-row">
                  <div className="metric" style={{ minWidth: 100 }}>
                    <div className="metric-value" style={{ fontSize: 18 }}>{scenarioResult.predicted_outcomes?.flight_delays}</div>
                    <div className="metric-label">Delays</div>
                  </div>
                  <div className="metric" style={{ minWidth: 100 }}>
                    <div className="metric-value" style={{ fontSize: 18 }}>{scenarioResult.predicted_outcomes?.passenger_congestion}%</div>
                    <div className="metric-label">Congestion</div>
                  </div>
                  <div className="metric" style={{ minWidth: 100 }}>
                    <div className="metric-value" style={{ fontSize: 18 }}>{scenarioResult.predicted_outcomes?.gate_utilization}%</div>
                    <div className="metric-label">Gate Util</div>
                  </div>
                  <div className="metric" style={{ minWidth: 100 }}>
                    <div className="metric-value" style={{ fontSize: 18 }}>{scenarioResult.predicted_outcomes?.average_wait_time}m</div>
                    <div className="metric-label">Wait Time</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 20 }}>
        <FlightTable flights={flights} />
        <GateStatus gates={gates} />
      </div>

      <div className="grid grid-cols-2">
        <PassengerFlow stages={passengerStages || {}} totalPassengers={totalPassengers || 0} />
        <AlertsPanel events={events} />
      </div>
    </div>
  );
}
