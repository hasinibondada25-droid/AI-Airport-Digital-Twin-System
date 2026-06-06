const axios = require('axios');

const FLASK_AI_URL = process.env.FLASK_AI_URL || 'http://localhost:5001';

const aiClient = axios.create({
  baseURL: FLASK_AI_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

async function predictDelay(flightData) {
  try {
    const response = await aiClient.post('/predict-delay', {
      flight_id: flightData.flightId || flightData.flight_id,
      airline: flightData.airline,
      origin: flightData.origin,
      destination: flightData.destination,
      scheduled_departure: flightData.scheduledDeparture || flightData.scheduled_departure,
      weather_impact: flightData.weatherImpact || flightData.weather_impact || 'none',
      traffic_level: flightData.trafficLevel || flightData.traffic_level || 'medium',
      hour: flightData.hour || new Date().getHours()
    });
    return response.data;
  } catch (error) {
    return getFallbackDelayPrediction(flightData);
  }
}

async function predictCrowd(data) {
  try {
    const response = await aiClient.post('/predict-crowd', {
      gate_id: data.gateId || data.gate_id,
      terminal: data.terminal || 'T1',
      hour: data.hour || new Date().getHours(),
      day_of_week: data.dayOfWeek || data.day_of_week || new Date().getDay(),
      flights_count: data.flightsCount || data.flights_count || 10
    });
    return response.data;
  } catch (error) {
    return getFallbackCrowdPrediction(data);
  }
}

async function optimizeGates(data) {
  try {
    const response = await aiClient.post('/optimize-gates', data);
    return response.data;
  } catch (error) {
    return getFallbackGateOptimization(data);
  }
}

async function runScenario(scenarioData) {
  try {
    const response = await aiClient.post('/scenario', scenarioData);
    return response.data;
  } catch (error) {
    return getFallbackScenarioResult(scenarioData);
  }
}

async function predictRunway(data) {
  try {
    const response = await aiClient.post('/predict-runway', {
      hour: data.hour || new Date().getHours(),
      scheduled_takeoffs: data.scheduledTakeoffs || data.scheduled_takeoffs || 15,
      scheduled_landings: data.scheduledLandings || data.scheduled_landings || 15,
      weather_condition: data.weatherCondition || data.weather_condition || 'clear',
      runway_count: data.runwayCount || data.runway_count || 2,
      time_of_day: data.timeOfDay || data.time_of_day || getTimeOfDay()
    });
    return response.data;
  } catch (error) {
    return getFallbackRunwayPrediction(data);
  }
}

async function generateAlerts(data) {
  try {
    const response = await aiClient.post('/generate-alerts', data);
    return response.data;
  } catch (error) {
    return getFallbackAlerts(data);
  }
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

function getFallbackDelayPrediction(data) {
  const hour = data.hour || new Date().getHours();
  const baseRisk = hour >= 17 ? 0.4 : hour >= 12 ? 0.3 : 0.15;
  const weatherFactor = data.weather_impact === 'high' ? 0.3 : data.weather_impact === 'medium' ? 0.15 : 0;
  const delayProbability = Math.min(0.95, baseRisk + weatherFactor + Math.random() * 0.1);
  const estimatedDelay = Math.floor(delayProbability * 120);

  return {
    delay_probability: delayProbability,
    estimated_delay_minutes: estimatedDelay,
    risk_level: delayProbability > 0.6 ? 'high' : delayProbability > 0.3 ? 'medium' : 'low',
    confidence: 0.75 + Math.random() * 0.2,
    factors: {
      weather: data.weather_impact || 'none',
      time_of_day: hour,
      traffic: data.traffic_level || 'medium'
    }
  };
}

function getFallbackCrowdPrediction(data) {
  const baseCrowd = Math.floor(Math.random() * 300) + 100;
  const hourFactor = data.hour >= 17 ? 1.5 : data.hour >= 12 ? 1.3 : 1;
  const crowdLevel = Math.floor(baseCrowd * hourFactor);

  return {
    crowd_level: crowdLevel,
    congestion_percentage: Math.min(100, Math.floor((crowdLevel / 500) * 100)),
    wait_time_minutes: Math.floor(crowdLevel / 20) + 5,
    recommended_gates: ['G5', 'G8', 'G12'],
    bottleneck_probability: crowdLevel > 350 ? 0.8 : crowdLevel > 200 ? 0.4 : 0.1,
    stage_breakdown: {
      security: Math.floor(crowdLevel * 0.3),
      check_in: Math.floor(crowdLevel * 0.25),
      gate_area: Math.floor(crowdLevel * 0.35),
      retail: Math.floor(crowdLevel * 0.1)
    }
  };
}

function getFallbackGateOptimization(data) {
  const flights = data.flights || [];
  const gates = data.gates || [];

  if (gates.length === 0) {
    return { assignments: [], message: 'No available gates' };
  }

  const assignments = flights.slice(0, gates.length).map((flight, i) => ({
    flightId: flight.flightId || flight.flight_id || `UNKNOWN`,
    recommendedGate: gates[i].gateId || gates[i].gate_id || `G${i + 1}`,
    reason: i === 0 ? 'Optimized for minimum walking distance' : 'Balanced load distribution',
    efficiencyGain: Math.floor(Math.random() * 20) + 5
  }));

  return {
    assignments,
    overall_efficiency_gain: 12.5,
    congestion_reduction: 'medium',
    timestamp: new Date().toISOString()
  };
}

function getFallbackScenarioResult(data) {
  return {
    scenario: data.type || 'what-if',
    parameters: data,
    predicted_outcomes: {
      flight_delays: Math.floor(Math.random() * 15) + 5,
      passenger_congestion: Math.floor(Math.random() * 40) + 20,
      gate_utilization: Math.floor(Math.random() * 30) + 60,
      average_wait_time: Math.floor(Math.random() * 25) + 10
    },
    recommendations: [
      'Open additional security lanes',
      'Prepone gate assignments for high-priority flights',
      'Increase staff at bottleneck areas'
    ],
    confidence: 0.82
  };
}

function getFallbackRunwayPrediction(data) {
  const hour = data.hour || new Date().getHours();
  const weather = data.weather_condition || 'clear';
  const takeoffs = data.scheduled_takeoffs || 15;
  const landings = data.scheduled_landings || 15;
  const total = takeoffs + landings;
  const weatherFactor = { clear: 1, rain: 1.3, fog: 1.8, storm: 2.5 }[weather] || 1;
  const peak = [7, 8, 9, 17, 18, 19].includes(hour) ? 1.3 : 1;
  const capacity = Math.floor(120 / (weatherFactor * peak));
  const occupancy = Math.min(100, Math.floor((total / capacity) * 100));
  const queue = Math.max(0, Math.floor((total - capacity * 0.8) * weatherFactor));

  return {
    runway_occupancy_percentage: occupancy,
    queue_length: queue,
    average_wait_minutes: Math.floor(queue * 2),
    congestion_level: occupancy > 80 ? 'high' : occupancy > 50 ? 'moderate' : 'low',
    recommended_spacing_seconds: Math.floor(3 * weatherFactor * peak),
    total_operations: total,
    effective_hourly_capacity: capacity,
    recommendations: [
      occupancy > 70 ? 'Increase aircraft separation' : 'Normal operations',
      weather !== 'clear' ? `Apply ${weather} procedures` : 'Standard taxi procedures'
    ]
  };
}

function getFallbackAlerts(data) {
  const flights = data.flights || [];
  const metrics = data.metrics || {};
  const alerts = [];
  const congestion = metrics.congestionIndex || 0;
  const delayed = metrics.delayedFlights || 0;
  const total = metrics.totalFlights || 0;
  const available = metrics.availableGates || 0;
  const totalGates = metrics.totalGates || 1;

  if (congestion > 70) {
    alerts.push({ id: `ALT-${Date.now()}-1`, type: 'congestion', severity: 'high', title: 'High Congestion Warning', description: `Congestion at ${Math.round(congestion)}%`, recommendation: 'Open additional lanes', source: 'ai-engine', status: 'active', generated_at: new Date().toISOString() });
  }
  if (delayed > 0 && (delayed / Math.max(1, total)) > 0.3) {
    alerts.push({ id: `ALT-${Date.now()}-2`, type: 'delay', severity: 'medium', title: `${delayed} Flights Delayed`, description: `${Math.round((delayed / Math.max(1, total)) * 100)}% delay rate`, recommendation: 'Review scheduling', source: 'ai-engine', status: 'active', generated_at: new Date().toISOString() });
  }
  if (available === 0) {
    alerts.push({ id: `ALT-${Date.now()}-3`, type: 'gate', severity: 'critical', title: 'No Available Gates', description: 'All gates occupied', recommendation: 'Release gates or divert', source: 'ai-engine', status: 'active', generated_at: new Date().toISOString() });
  }
  if (alerts.length === 0) {
    alerts.push({ id: `ALT-${Date.now()}`, type: 'system', severity: 'low', title: 'Normal Operations', description: 'All metrics within threshold', recommendation: 'Continue monitoring', source: 'ai-engine', status: 'active', generated_at: new Date().toISOString() });
  }

  return { alerts, total_generated: alerts.length };
}

module.exports = {
  predictDelay,
  predictCrowd,
  optimizeGates,
  runScenario,
  predictRunway,
  generateAlerts,
  getFallbackDelayPrediction,
  getFallbackCrowdPrediction,
  getFallbackGateOptimization,
  getFallbackScenarioResult,
  getFallbackRunwayPrediction,
  getFallbackAlerts
};
