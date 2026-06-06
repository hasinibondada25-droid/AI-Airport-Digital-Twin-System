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
  if (isConfigured()) {
    return fetchFromApi(params);
  }
  return generateDemoFlights(params);
}

async function fetchFromApi(params) {
  const defaults = { limit: 100, offset: 0 };

  try {
    const response = await client.get('/flights', { params: { ...defaults, ...params } });
    const data = response.data;

    if (data.error) {
      return { success: false, error: data.error.message || 'AviationStack API error' };
    }

    const flights = (data.data || []).map(mapApiFlight);
    return { success: true, data: flights, pagination: data.pagination || {}, source: 'aviationstack' };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message || 'Failed to fetch live flights'
    };
  }
}

function generateDemoFlights(params = {}) {
  const airlines = [
    { code: '6E', name: 'IndiGo' },
    { code: 'AI', name: 'Air India' },
    { code: 'SG', name: 'SpiceJet' },
    { code: 'UK', name: 'Vistara' },
    { code: '9W', name: 'Jet Airways' },
    { code: 'I5', name: 'Air India Express' },
    { code: 'IX', name: 'Air India Express' }
  ];

  const airports = [
    { city: 'Vijayawada', code: 'VGA' },
    { city: 'Rajahmundry', code: 'RJA' },
    { city: 'Delhi', code: 'DEL' },
    { city: 'Mumbai', code: 'BOM' },
    { city: 'Bangalore', code: 'BLR' },
    { city: 'Hyderabad', code: 'HYD' },
    { city: 'Chennai', code: 'MAA' },
    { city: 'Kolkata', code: 'CCU' },
    { city: 'Visakhapatnam', code: 'VTZ' },
    { city: 'Tirupati', code: 'TIR' }
  ];

  const statuses = ['scheduled', 'scheduled', 'scheduled', 'boarding', 'active', 'active', 'delayed'];
  const limit = params.limit || 15;
  const flights = [];

  const now = new Date();

  const localRoutes = [
    { from: 'Vijayawada', to: 'Hyderabad' },
    { from: 'Vijayawada', to: 'Bangalore' },
    { from: 'Vijayawada', to: 'Chennai' },
    { from: 'Vijayawada', to: 'Delhi' },
    { from: 'Vijayawada', to: 'Mumbai' },
    { from: 'Rajahmundry', to: 'Hyderabad' },
    { from: 'Rajahmundry', to: 'Bangalore' },
    { from: 'Rajahmundry', to: 'Chennai' },
    { from: 'Rajahmundry', to: 'Delhi' },
    { from: 'Hyderabad', to: 'Vijayawada' },
    { from: 'Hyderabad', to: 'Rajahmundry' },
    { from: 'Bangalore', to: 'Vijayawada' },
    { from: 'Bangalore', to: 'Rajahmundry' },
    { from: 'Chennai', to: 'Vijayawada' },
    { from: 'Delhi', to: 'Vijayawada' },
    { from: 'Mumbai', to: 'Rajahmundry' },
    { from: 'Visakhapatnam', to: 'Vijayawada' },
    { from: 'Vijayawada', to: 'Visakhapatnam' }
  ];

  for (let i = 0; i < limit; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const route = localRoutes[Math.floor(Math.random() * localRoutes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const depHour = 5 + Math.floor(Math.random() * 17);
    const depMin = Math.floor(Math.random() * 4) * 15;
    const depDate = new Date(now);
    depDate.setHours(depHour, depMin, 0, 0);

    if (depDate < now) {
      depDate.setDate(depDate.getDate() + 1);
    }

    const flightTime = 45 + Math.floor(Math.random() * 120);
    const arrDate = new Date(depDate.getTime() + flightTime * 60000);

    const delayMins = status === 'delayed' ? Math.floor(Math.random() * 60) + 15 : 0;

    flights.push({
      flightId: `${airline.code}${1000 + i}`,
      airline: airline.name,
      flightNumber: `${airline.code}${1000 + i}`,
      origin: route.from,
      destination: route.to,
      originCity: route.from,
      destinationCity: route.to,
      scheduledDeparture: depDate.toISOString(),
      scheduledArrival: arrDate.toISOString(),
      estimatedDeparture: delayMins > 0 ? new Date(depDate.getTime() + delayMins * 60000).toISOString() : null,
      estimatedArrival: delayMins > 0 ? new Date(arrDate.getTime() + delayMins * 60000).toISOString() : null,
      status,
      gate: null,
      terminal: 'T1',
      delayMinutes: delayMins,
      delayRisk: status === 'delayed' ? 0.7 : status === 'scheduled' ? 0.15 : 0,
      passengerCount: Math.floor(Math.random() * 180) + 60,
      priority: Math.floor(Math.random() * 10) + 1,
      isLive: true
    });
  }

  return { success: true, data: flights, source: 'demo' };
}

function mapApiFlight(apiFlight) {
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
  const depTime = dep.estimated || dep.scheduled || new Date().toISOString();
  const arrTime = arr.estimated || arr.scheduled || new Date().toISOString();

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

async function fetchFlightsByAirport(airportIata) {
  return fetchFlights({ dep_iata: airportIata, limit: 20 });
}

async function fetchArrivalsByAirport(airportIata) {
  return fetchFlights({ arr_iata: airportIata, limit: 20 });
}

async function seedSimulation() {
  const store = require('./dataStore');
  const result = await fetchFlights({ limit: 30 });
  let addedCount = 0;

  if (result.success) {
    for (const flight of result.data) {
      const existing = store.getFlight(flight.flightId);
      if (!existing) {
        flight.isLive = true;
        store.addFlight(flight);
        addedCount++;
      }
    }
  }

  return {
    success: true,
    count: addedCount,
    total: result.data.length,
    note: isConfigured() ? 'Live flights seeded from AviationStack' : 'Demo flights seeded (add LIVE_AVIATION_API_KEY for real data)'
  };
}

module.exports = {
  fetchFlights,
  fetchFlightsByAirport,
  fetchArrivalsByAirport,
  seedSimulation,
  isConfigured
};
