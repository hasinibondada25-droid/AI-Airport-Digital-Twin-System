const API_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed: ${response.status}`);
  }

  return data;
}

export const api = {
  // Flights
  getFlights: (params = '') => request(`/api/flights${params}`),
  getFlight: (id) => request(`/api/flights/${id}`),
  createFlight: (data) => request('/api/flights', { method: 'POST', body: data }),
  updateFlight: (id, data) => request(`/api/flights/${id}`, { method: 'PUT', body: data }),
  deleteFlight: (id) => request(`/api/flights/${id}`, { method: 'DELETE' }),
  assignGate: (flightId, gateId) => request('/api/flights/assign-gate', {
    method: 'POST',
    body: { flightId, gateId }
  }),

  // Gates
  getGates: (params = '') => request(`/api/gates${params}`),
  getGate: (id) => request(`/api/gates/${id}`),
  assignFlightToGate: (gateId, flightId) => request('/api/gates/assign', {
    method: 'POST',
    body: { gateId, flightId }
  }),
  releaseGate: (gateId) => request('/api/gates/release', {
    method: 'POST',
    body: { gateId }
  }),

  // AI
  predictDelay: (data) => request('/api/ai/predict-delay', { method: 'POST', body: data }),
  predictCrowd: (data) => request('/api/ai/predict-crowd', { method: 'POST', body: data }),
  optimizeGates: (data) => request('/api/ai/optimize-gates', { method: 'POST', body: data }),
  runScenario: (data) => request('/api/ai/scenario', { method: 'POST', body: data }),

  // Simulation
  getStatus: () => request('/api/simulation/status'),
  startSimulation: (speed) => request('/api/simulation/start', { method: 'POST', body: { speed } }),
  stopSimulation: () => request('/api/simulation/stop', { method: 'POST' }),
  getMetrics: () => request('/api/simulation/metrics'),
  triggerEvent: (data) => request('/api/simulation/trigger-event', { method: 'POST', body: data }),

  // Health
  health: () => request('/api/health'),

  // Live Aviation Data
  getLiveStatus: () => request('/api/live/status'),
  getLiveFlights: (params = '') => request(`/api/live/flights${params}`),
  getLiveDepartures: (code) => request(`/api/live/flights/departures/${code}`),
  getLiveArrivals: (code) => request(`/api/live/flights/arrivals/${code}`),
  seedLiveFlights: () => request('/api/live/seed', { method: 'POST' })
};

export default api;
