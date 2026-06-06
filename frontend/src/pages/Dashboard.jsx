import React, { useState, useEffect, useCallback } from 'react';
import FlightTable from '../components/FlightTable';
import GateStatus from '../components/GateStatus';
import AirportMap from '../components/AirportMap';
import AlertsPanel from '../components/AlertsPanel';
import PassengerFlow from '../components/PassengerFlow';
import ControlTower from '../components/ControlTower';
import AirportLocator from '../components/AirportLocator';
import LiveDataPanel from '../components/LiveDataPanel';
import RunwayTraffic from '../components/RunwayTraffic';
import socketService from '../services/socket';

export default function Dashboard() {
  const [state, setState] = useState({
    flights: [],
    gates: [],
    events: [],
    metrics: {},
    tick: 0,
    connected: false
  });

  const handleStateUpdate = useCallback((data) => {
    setState(prev => ({
      ...prev,
      flights: data.flights || prev.flights,
      gates: data.gates || prev.gates,
      events: data.events || prev.events,
      metrics: data.metrics || prev.metrics,
      tick: data.tick || prev.tick
    }));
  }, []);

  useEffect(() => {
    socketService.on('state-update', handleStateUpdate);

    socketService.on('new-event', (event) => {
      setState(prev => ({
        ...prev,
        events: [event, ...prev.events].slice(0, 20)
      }));
    });

    socketService.on('passenger-update', (data) => {
      setState(prev => ({
        ...prev,
        passengerStages: data.stages,
        totalPassengers: data.totalPassengers
      }));
    });

    const handleConnect = () => setState(prev => ({ ...prev, connected: true }));
    const handleDisconnect = () => setState(prev => ({ ...prev, connected: false }));
    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    socketService.connect();

    return () => {
      socketService.off('state-update', handleStateUpdate);
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, [handleStateUpdate]);

  const { flights, gates, events, metrics, passengerStages, totalPassengers } = state;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="flight-status-bar">
          <span> Tick: <strong>{state.tick}</strong></span>
          <span>
            <span className={`status-dot ${state.connected ? 'online' : 'offline'}`} />
            {state.connected ? 'Connected' : 'Disconnected'}
          </span>
          {metrics.efficiencyScore !== undefined && (
            <span> Efficiency: <strong>{Math.round(metrics.efficiencyScore)}%</strong></span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4" style={{ marginBottom: 20 }}>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>
            {metrics.totalFlights ?? flights.length}
          </div>
          <div className="stat-label">Total Flights</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-yellow)' }}>
            {metrics.delayedFlights ?? 0}
          </div>
          <div className="stat-label">Delayed</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {metrics.availableGates ?? 0}
          </div>
          <div className="stat-label">Available Gates</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-purple)' }}>
            {Math.round(metrics.congestionIndex ?? 0)}%
          </div>
          <div className="stat-label">Congestion</div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 20 }}>
        <div className="grid" style={{ gap: 20 }}>
          <FlightTable flights={flights} />
          <GateStatus gates={gates} />
        </div>
        <div className="grid" style={{ gap: 20 }}>
          <AirportMap gates={gates} flights={flights} />
          <div className="grid grid-cols-2" style={{ gap: 20 }}>
            <AlertsPanel events={events} flights={flights} gates={gates} metrics={metrics} />
            <ControlTower />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2" style={{ marginBottom: 20, gap: 20 }}>
        <PassengerFlow stages={passengerStages || {}} totalPassengers={totalPassengers || 0} />
        <RunwayTraffic metrics={metrics} />
      </div>
      <div className="grid grid-cols-2" style={{ gap: 20 }}>
        <LiveDataPanel />
        <AirportLocator />
      </div>
    </div>
  );
}
