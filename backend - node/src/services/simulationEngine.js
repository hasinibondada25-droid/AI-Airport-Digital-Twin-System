const store = require('./dataStore');
const { getIO } = require('../config/socket');
const { generateRandomFlight } = require('../utils/randomGenerator');
const { getCurrentSimulationTime, advanceTime } = require('../utils/timeSimulator');

let instance = null;

class SimulationEngine {
  constructor() {
    this.interval = null;
    this.running = false;
    this.tickCount = 0;
    this.speed = 5000;
    this.flightCounter = 100;
    this.metrics = {
      totalFlightsProcessed: 0,
      totalDelays: 0,
      totalPassengers: 0,
      efficiencyHistory: [],
      congestionHistory: [],
      delayHistory: []
    };
  }

  static getInstance() {
    if (!instance) {
      instance = new SimulationEngine();
    }
    return instance;
  }

  isRunning() { return this.running; }
  getTick() { return this.tickCount; }
  getSpeed() { return this.speed; }

  start(speed) {
    if (this.running) return;
    this.speed = speed || this.speed;
    this.running = true;
    this.tick();
    console.log(`Simulation started (interval: ${this.speed}ms, using in-memory store)`);
  }

  stop() {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    this.running = false;
    console.log('Simulation stopped');
  }

  getMetrics() {
    return {
      ...this.metrics,
      currentTick: this.tickCount,
      running: this.running,
      efficiencyScore: this.calculateEfficiencyScore(),
      averageCongestion: this.average(this.metrics.congestionHistory),
      averageDelay: this.average(this.metrics.delayHistory)
    };
  }

  average(arr) {
    return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  calculateEfficiencyScore() {
    const recent = this.metrics.efficiencyHistory.slice(-10);
    return recent.length === 0 ? 100 : Math.round(this.average(recent));
  }

  async tick() {
    if (!this.running) return;

    this.tickCount++;
    advanceTime();

    try {
      this.assignGates();
      this.updateFlights();
      this.updateGates();
      this.updatePassengers();
      this.checkAndGenerateEvents();
      this.checkAndGenerateFlights();
      this.updateMetrics();
      this.emitState();
    } catch (err) {
      console.error('Simulation tick error:', err.message);
    }

    this.interval = setTimeout(() => this.tick(), this.speed);
  }

  updateFlights() {
    const activeFlights = store.getFlights().filter(f =>
      !['arrived', 'cancelled', 'diverted'].includes(f.status)
    );

    for (const flight of activeFlights) {
      const delayProbability = Math.random();

      if (delayProbability < 0.15 && flight.status === 'scheduled') {
        const delayMins = Math.floor(Math.random() * 120) + 5;
        flight.delayMinutes = (flight.delayMinutes || 0) + delayMins;
        flight.delayRisk = Math.min(1, (flight.delayRisk || 0) + 0.1);

        if (flight.delayMinutes > 15) {
          flight.status = 'delayed';
          this.metrics.totalDelays++;
        }
      }

      if (flight.status === 'scheduled' && (flight.delayMinutes || 0) < 15) {
        const now = getCurrentSimulationTime();
        const elapsed = (now - new Date(flight.scheduledDeparture)) / 60000;
        if (elapsed > -30 && elapsed <= 0) {
          flight.status = 'boarding';
        }
      }

      if (flight.status === 'boarding') {
        const now = getCurrentSimulationTime();
        const elapsed = (now - new Date(flight.scheduledDeparture)) / 60000;
        if (elapsed > 15) {
          flight.status = 'departed';
          if (flight.gate) {
            const gate = store.getGate(flight.gate);
            if (gate) {
              gate.status = 'available';
              gate.currentFlightId = null;
              gate.currentLoad = 0;
            }
          }
        }
      }

      if (flight.status === 'delayed' && (flight.delayMinutes || 0) > 120) {
        if (Math.random() < 0.3) {
          flight.status = 'cancelled';
        }
      }

      const weatherImpacts = ['none', 'none', 'none', 'low', 'medium', 'high'];
      flight.weatherImpact = weatherImpacts[Math.floor(Math.random() * weatherImpacts.length)];
      flight.delayRisk = Math.min(1, (flight.delayRisk || 0) + (flight.weatherImpact !== 'none' ? 0.05 : 0));

      store.updateFlight(flight.flightId, flight);
      this.metrics.totalFlightsProcessed++;
    }
  }

  updateGates() {
    const allGates = store.getGates();

    for (const gate of allGates) {
      if (gate.status === 'occupied' && gate.currentFlightId) {
        const flight = store.getFlight(gate.currentFlightId);
        if (!flight || ['departed', 'arrived'].includes(flight.status)) {
          gate.status = 'available';
          gate.currentFlightId = null;
          gate.currentLoad = 0;
        } else {
          gate.currentLoad = Math.min(gate.capacity || 200, (gate.currentLoad || 0) + Math.floor(Math.random() * 10));
        }
      }

      if (gate.status === 'available' && Math.random() < 0.05) {
        gate.status = 'maintenance';
      }

      if (gate.status === 'maintenance' && Math.random() < 0.3) {
        gate.status = 'available';
      }

      store.updateGate(gate.gateId, gate);
    }
  }

  updatePassengers() {
    const stages = ['entry', 'check-in', 'security', 'retail', 'gate', 'boarding'];
    const stageDistribution = {};
    let totalPassengers = 0;

    for (const stage of stages) {
      const baseCount = Math.floor(Math.random() * 500) + 100;
      const isBottleneck = stage === 'security' && baseCount > 400;
      const queueTime = isBottleneck ? Math.floor(Math.random() * 30 + 15) : Math.floor(Math.random() * 10 + 2);
      stageDistribution[stage] = { count: baseCount, bottleneck: isBottleneck, queueTime };
      totalPassengers += baseCount;
    }

    this.metrics.totalPassengers += totalPassengers;

    try {
      const io = getIO();
      io.to('simulation').emit('passenger-update', {
        timestamp: new Date(),
        stages: stageDistribution,
        totalPassengers
      });
    } catch (e) { }
  }

  checkAndGenerateEvents() {
    if (Math.random() < 0.08) {
      const eventTypes = ['weather', 'security', 'technical', 'operational'];
      const severities = ['low', 'medium', 'high'];
      const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];

      const eventData = {
        eventId: `EVT-${Date.now()}`,
        type,
        severity,
        title: this.getEventTitle(type, severity),
        description: `${severity.toUpperCase()} severity ${type} event detected`,
        impact: severity,
        status: 'active',
        createdAt: new Date()
      };

      store.addEvent(eventData);

      try {
        const io = getIO();
        io.to('simulation').emit('new-event', eventData);
      } catch (e) { }
    }
  }

  getEventTitle(type, severity) {
    const titles = {
      weather: { low: 'Light Rain Expected', medium: 'Storm Warning', high: 'Severe Weather Alert' },
      security: { low: 'Suspicious Activity', medium: 'Security Breach', high: 'Terminal Lockdown' },
      technical: { low: 'System Maintenance', medium: 'System Outage', high: 'Critical System Failure' },
      operational: { low: 'Staff Shortage', medium: 'Runway Closure', high: 'Airport Closure' }
    };
    return (titles[type] && titles[type][severity]) || `${type} ${severity}`;
  }

  checkAndGenerateFlights() {
    if (Math.random() < 0.2) {
      const count = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < count; i++) {
        this.flightCounter++;
        store.addFlight(generateRandomFlight(this.flightCounter));
      }
    }
  }

  assignGates() {
    const unassigned = store.getFlights().filter(f =>
      !f.gate && ['scheduled', 'boarding', 'delayed'].includes(f.status)
    );
    const available = store.getGates().filter(g => g.status === 'available');

    for (const flight of unassigned) {
      if (available.length === 0) break;
      const gate = available.shift();
      gate.status = 'occupied';
      gate.currentFlightId = flight.flightId;
      gate.currentLoad = Math.floor(Math.random() * 60) + 10;
      flight.gate = gate.gateId;
      flight.terminal = gate.terminal;
      store.updateGate(gate.gateId, gate);
      store.updateFlight(flight.flightId, flight);
    }
  }

  updateMetrics() {
    const allGates = store.getGates();
    const avail = allGates.filter(g => g.status === 'available').length;
    const total = allGates.length;

    const congestion = total > 0 ? ((total - avail) / total) * 100 : 0;
    this.metrics.congestionHistory.push(congestion);
    if (this.metrics.congestionHistory.length > 100) this.metrics.congestionHistory.shift();

    const efficiency = total > 0 ? (avail / total) * 100 : 100;
    this.metrics.efficiencyHistory.push(efficiency);
    if (this.metrics.efficiencyHistory.length > 100) this.metrics.efficiencyHistory.shift();

    const delayRate = this.metrics.totalDelays / Math.max(1, this.metrics.totalFlightsProcessed);
    this.metrics.delayHistory.push(delayRate * 100);
    if (this.metrics.delayHistory.length > 100) this.metrics.delayHistory.shift();
  }

  async emitState() {
    try {
      const flights = store.getFlights().slice(0, 50);
      const gates = store.getGates();
      const events = store.getEvents({ status: 'active' }).slice(0, 10);
      const allGates = store.getGates();

      const metrics = {
        totalFlights: flights.length,
        activeFlights: flights.filter(f => ['scheduled', 'boarding', 'delayed'].includes(f.status)).length,
        delayedFlights: flights.filter(f => f.status === 'delayed').length,
        availableGates: allGates.filter(g => g.status === 'available').length,
        totalGates: allGates.length,
        efficiencyScore: this.calculateEfficiencyScore(),
        congestionIndex: allGates.length > 0 ? ((allGates.length - allGates.filter(g => g.status === 'available').length) / allGates.length) * 100 : 0,
        delayIndex: 0
      };

      const activeFlights = metrics.activeFlights;
      metrics.delayIndex = activeFlights > 0 ? (metrics.delayedFlights / activeFlights) * 100 : 0;

      const io = getIO();
      io.to('simulation').emit('state-update', {
        tick: this.tickCount,
        timestamp: new Date(),
        flights,
        gates,
        events,
        metrics
      });
    } catch (err) {
      console.error('Emit state error:', err.message);
    }
  }

  async triggerEvent({ type, severity, title, description }) {
    const eventData = {
      eventId: `EVT-${Date.now()}`,
      type: type || 'operational',
      severity: severity || 'medium',
      title: title || 'Manual Event',
      description: description || 'Event triggered by operator',
      impact: severity || 'medium',
      status: 'active',
      createdAt: new Date()
    };

    store.addEvent(eventData);

    try {
      const io = getIO();
      io.to('simulation').emit('new-event', eventData);
    } catch (e) { }

    return eventData;
  }
}

module.exports = SimulationEngine;
