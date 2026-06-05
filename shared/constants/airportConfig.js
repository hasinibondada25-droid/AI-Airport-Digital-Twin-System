export const AIRPORT_CONFIG = {
  name: 'AI Airport Digital Twin',
  code: 'AIDT',
  location: 'Smart City, India',
  terminals: [
    {
      id: 'T1',
      name: 'Terminal 1',
      gates: Array.from({ length: 12 }, (_, i) => `G${i + 1}`),
      capacity: 5000
    },
    {
      id: 'T2',
      name: 'Terminal 2',
      gates: Array.from({ length: 8 }, (_, i) => `G${i + 13}`),
      capacity: 3000
    }
  ],
  simulation: {
    defaultInterval: 5000,
    timeScale: 60,
    autoGenerateFlights: true,
    flightGenerationRate: 0.2
  },
  ai: {
    flaskUrl: 'http://localhost:5001',
    timeout: 10000,
    fallbackEnabled: true
  },
  thresholds: {
    highCongestion: 80,
    mediumCongestion: 50,
    highDelayRisk: 0.6,
    mediumDelayRisk: 0.3,
    criticalEventSeverity: 'high'
  }
};

export const AIRLINES = [
  { code: 'AI', name: 'Air India', country: 'India' },
  { code: '6E', name: 'IndiGo', country: 'India' },
  { code: 'SG', name: 'SpiceJet', country: 'India' },
  { code: 'UK', name: 'Vistara', country: 'India' },
  { code: 'EK', name: 'Emirates', country: 'UAE' },
  { code: 'QR', name: 'Qatar Airways', country: 'Qatar' },
  { code: 'EY', name: 'Etihad', country: 'UAE' },
  { code: 'BA', name: 'British Airways', country: 'UK' },
  { code: 'LH', name: 'Lufthansa', country: 'Germany' },
  { code: 'SQ', name: 'Singapore Airlines', country: 'Singapore' }
];

export const CITIES = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Goa',
  'Dubai', 'London', 'New York', 'Singapore', 'Bangkok',
  'Paris', 'Frankfurt', 'Tokyo', 'Sydney', 'Toronto',
  'Istanbul', 'Doha', 'Abu Dhabi', 'Kuala Lumpur', 'Colombo'
];

export const AIRCRAFT_TYPES = [
  'Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380',
  'Boeing 787', 'Airbus A350', 'Boeing 747', 'Airbus A330'
];
