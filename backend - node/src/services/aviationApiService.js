const axios = require('axios');

const API_KEY = process.env.LIVE_AVIATION_API_KEY || '';
const BASE_URL = 'https://api.aviationstack.com/v1';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  params: { access_key: API_KEY }
});

function isConfigured() {
  return !!API_KEY;
}

async function fetchFlights(params = {}) {
  if (!isConfigured()) {
    return { success: false, error: 'No API key configured. Set LIVE_AVIATION_API_KEY env var.' };
  }

  const defaults = {
    limit: 100,
    offset: 0
  };

  try {
    const response = await client.get('/flights', { params: { ...defaults, ...params } });
    const data = response.data;

    if (data.error) {
      return { success: false, error: data.error.message || 'AviationStack API error' };
    }

    const flights = (data.data || []).map(mapAviationStackFlight);
    return {
      success: true,
      data: flights,
      pagination: data.pagination || {},
      source: 'aviationstack'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to fetch live flights'
    };
  }
}

async function fetchFlightsByAirport(airportIata) {
  return fetchFlights({
    dep_iata: airportIata,
    limit: 50
  });
}

async function fetchArrivalsByAirport(airportIata) {
  return fetchFlights({
    arr_iata: airportIata,
    limit: 50
  });
}

function mapAviationStackFlight(apiFlight) {
  const dep = apiFlight.departure || {};
  const arr = apiFlight.arrival || {};
  const airline = apiFlight.airline || {};
  const flight = apiFlight.flight || {};

  const statusMap = {
    scheduled: 'scheduled',
    active: 'boarding',
    landed: 'arrived',
    cancelled: 'cancelled',
    incident: 'diverted',
    diverted: 'diverted',
    delayed: 'delayed'
  };

  const mappedStatus = statusMap[apiFlight.flight_status] || 'scheduled';

  const now = new Date();
  const depTime = dep.estimated || dep.scheduled || now.toISOString();
  const arrTime = arr.estimated || arr.scheduled || now.toISOString();

  return {
    flightId: flight.iata || flight.number || `LV-${Date.now()}`,
    airline: airline.name || 'Unknown',
    flightNumber: flight.iata || flight.number || '----',
    origin: dep.iata || dep.airport || 'Unknown',
    destination: arr.iata || arr.airport || 'Unknown',
    originCity: dep.airport || dep.iata || 'Unknown',
    destinationCity: arr.airport || arr.iata || 'Unknown',
    scheduledDeparture: depTime,
    scheduledArrival: arrTime,
    estimatedDeparture: dep.estimated || null,
    estimatedArrival: arr.estimated || null,
    status: mappedStatus,
    gate: dep.gate || null,
    terminal: dep.terminal ? `T${dep.terminal}` : null,
    delayMinutes: dep.delay || 0,
    delayRisk: mappedStatus === 'delayed' ? 0.7 : mappedStatus === 'scheduled' ? 0.15 : 0,
    passengerCount: Math.floor(Math.random() * 200) + 100,
    priority: Math.floor(Math.random() * 10) + 1,
    isLive: true
  };
}

async function seedSimulation() {
  if (!isConfigured()) {
    return { success: false, error: 'No API key configured', count: 0 };
  }

  const store = require('./dataStore');

  const depResult = await fetchFlights({ limit: 30, flight_status: 'scheduled' });
  const liveResult = await fetchFlights({ limit: 20, flight_status: 'active' });

  const allFlights = [];
  if (depResult.success) allFlights.push(...depResult.data);
  if (liveResult.success) allFlights.push(...liveResult.data);

  let addedCount = 0;
  for (const flight of allFlights) {
    const existing = store.getFlight(flight.flightId);
    if (!existing) {
      store.addFlight(flight);
      addedCount++;
    }
  }

  return {
    success: true,
    count: addedCount,
    total: allFlights.length,
    note: 'Live flights seeded into simulation'
  };
}

module.exports = {
  fetchFlights,
  fetchFlightsByAirport,
  fetchArrivalsByAirport,
  seedSimulation,
  isConfigured
};
