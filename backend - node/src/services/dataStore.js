const fs = require('fs');
const path = require('path');

let mongoAvailable = false;
let useInMemory = true;

const flights = [];
const gates = [];
const events = [];
const passengers = [];

function loadMockData() {
  try {
    const flightsPath = path.join(__dirname, '..', '..', '..', 'shared', 'mock-data', 'flights.json');
    const gatesPath = path.join(__dirname, '..', '..', '..', 'shared', 'mock-data', 'gates.json');

    if (fs.existsSync(flightsPath)) {
      const fData = JSON.parse(fs.readFileSync(flightsPath, 'utf8'));
      const parsed = fData.map(f => ({
        ...f,
        scheduledDeparture: new Date(f.scheduledDeparture),
        scheduledArrival: new Date(f.scheduledArrival),
        estimatedDeparture: f.estimatedDeparture ? new Date(f.estimatedDeparture) : null,
        estimatedArrival: f.estimatedArrival ? new Date(f.estimatedArrival) : null,
      }));

      const earliestDep = parsed.reduce((min, f) => f.scheduledDeparture < min ? f.scheduledDeparture : min, parsed[0].scheduledDeparture);
      const now = new Date();
      const shiftMs = now.getTime() - earliestDep.getTime() + 30 * 60 * 1000;

      flights.push(...parsed.map(f => {
        const shiftedDep = new Date(f.scheduledDeparture.getTime() + shiftMs);
        const shiftedArr = new Date(f.scheduledArrival.getTime() + shiftMs);
        return {
          ...f,
          _id: f.flightId,
          scheduledDeparture: shiftedDep,
          scheduledArrival: shiftedArr,
          estimatedDeparture: f.estimatedDeparture ? new Date(f.estimatedDeparture.getTime() + shiftMs) : null,
          estimatedArrival: f.estimatedArrival ? new Date(f.estimatedArrival.getTime() + shiftMs) : null,
          save: async function () { return updateFlight(this.flightId, this); },
          toObject: function () { return { ...this }; }
        };
      }));
    }

    if (fs.existsSync(gatesPath)) {
      const gData = JSON.parse(fs.readFileSync(gatesPath, 'utf8'));
      gates.push(...gData.map(g => ({
        ...g,
        _id: g.gateId,
        save: async function () { return updateGate(this.gateId, this); },
        toObject: function () { return { ...this }; }
      })));
    }

    console.log(`Loaded ${flights.length} flights and ${gates.length} gates into memory`);
  } catch (err) {
    console.error('Failed to load mock data:', err.message);
  }
}

function updateFlight(flightId, data) {
  const idx = flights.findIndex(f => f.flightId === flightId);
  if (idx >= 0) {
    flights[idx] = { ...flights[idx], ...data };
    return flights[idx];
  }
  return null;
}

function updateGate(gateId, data) {
  const idx = gates.findIndex(g => g.gateId === gateId);
  if (idx >= 0) {
    gates[idx] = { ...gates[idx], ...data };
    return gates[idx];
  }
  return null;
}

function addFlight(flight) {
  const newFlight = {
    ...flight,
    _id: flight.flightId || `FL-${Date.now()}`,
    save: async function () { return updateFlight(this.flightId, this); },
    toObject: function () { return { ...this }; }
  };
  flights.push(newFlight);
  return newFlight;
}

function removeFlight(flightId) {
  const idx = flights.findIndex(f => f.flightId === flightId);
  if (idx >= 0) {
    flights.splice(idx, 1);
    return true;
  }
  return false;
}

function getFlights(filter = {}) {
  let result = [...flights];
  if (filter.status) result = result.filter(f => f.status === filter.status);
  if (filter.gate) result = result.filter(f => f.gate === filter.gate);
  return result;
}

function getFlight(flightId) {
  return flights.find(f => f.flightId === flightId) || null;
}

function addGate(gate) {
  const newGate = {
    ...gate,
    _id: gate.gateId,
    save: async function () { return updateGate(this.gateId, this); },
    toObject: function () { return { ...this }; }
  };
  gates.push(newGate);
  return newGate;
}

function getGates(filter = {}) {
  let result = [...gates];
  if (filter.status) result = result.filter(g => g.status === filter.status);
  if (filter.terminal) result = result.filter(g => g.terminal === filter.terminal);
  return result;
}

function getGate(gateId) {
  return gates.find(g => g.gateId === gateId) || null;
}

function addEvent(eventData) {
  const evt = { ...eventData, _id: eventData.eventId || `EVT-${Date.now()}` };
  events.push(evt);
  return evt;
}

function getEvents(filter = {}) {
  let result = [...events];
  if (filter.status) result = result.filter(e => e.status === filter.status);
  if (filter.type) result = result.filter(e => e.type === filter.type);
  return result;
}

function addPassenger(p) {
  passengers.push({ ...p, _id: `P-${Date.now()}-${Math.random()}` });
}

function getPassengers() {
  return [...passengers];
}

function clearPassengers() {
  passengers.length = 0;
}

function setMongoAvailable(available) {
  mongoAvailable = available;
  useInMemory = !available;
}

function isUsingInMemory() {
  return useInMemory;
}

loadMockData();

module.exports = {
  getFlights,
  getFlight,
  addFlight,
  updateFlight,
  removeFlight,
  getGates,
  getGate,
  addGate,
  updateGate,
  addEvent,
  getEvents,
  addPassenger,
  getPassengers,
  clearPassengers,
  setMongoAvailable,
  isUsingInMemory,
  flights,
  gates,
  events
};
