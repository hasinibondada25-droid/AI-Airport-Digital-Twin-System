const airlines = [
  { code: 'AI', name: 'Air India' },
  { code: '6E', name: 'IndiGo' },
  { code: 'SG', name: 'SpiceJet' },
  { code: 'UK', name: 'Vistara' },
  { code: '9W', name: 'Jet Airways' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
  { code: 'EY', name: 'Etihad' },
  { code: 'BA', name: 'British Airways' },
  { code: 'LH', name: 'Lufthansa' }
];

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Goa',
  'Vijayawada', 'Rajahmundry', 'Visakhapatnam', 'Tirupati',
  'Dubai', 'London', 'New York', 'Singapore', 'Bangkok',
  'Paris', 'Frankfurt', 'Tokyo', 'Sydney', 'Toronto'
];

const statuses = ['scheduled', 'scheduled', 'scheduled', 'boarding', 'delayed'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRandomFlight(counter) {
  const airline = randomElement(airlines);
  const origin = randomElement(cities);
  let destination = randomElement(cities);
  while (destination === origin) {
    destination = randomElement(cities);
  }

  const now = new Date();
  const departureHour = Math.floor(Math.random() * 18) + 5;
  const departureDate = new Date(now);
  departureDate.setHours(departureHour, Math.floor(Math.random() * 60), 0, 0);

  const flightTime = Math.floor(Math.random() * 6) + 1;
  const arrivalDate = new Date(departureDate.getTime() + flightTime * 3600000);

  const risk = Math.random();
  const delayRisk = Math.round(risk * 100) / 100;
  const delayMinutes = delayRisk > 0.6 ? Math.floor(Math.random() * 90) + 15 : 0;

  const status = delayMinutes > 15 ? 'delayed' : randomElement(statuses);

  return {
    flightId: `${airline.code}${100 + counter}`,
    airline: airline.name,
    flightNumber: `${airline.code}${100 + counter}`,
    origin,
    destination,
    scheduledDeparture: departureDate,
    scheduledArrival: arrivalDate,
    estimatedDeparture: new Date(departureDate.getTime() + delayMinutes * 60000),
    estimatedArrival: new Date(arrivalDate.getTime() + delayMinutes * 60000),
    status,
    gate: null,
    terminal: 'T1',
    delayMinutes,
    delayRisk,
    passengerCount: Math.floor(Math.random() * 200) + 100,
    priority: Math.floor(Math.random() * 10)
  };
}

function generateRandomGate(index) {
  return {
    gateId: `G${index}`,
    name: `Gate ${index}`,
    terminal: index <= 12 ? 'T1' : 'T2',
    capacity: Math.floor(Math.random() * 150) + 100,
    currentLoad: 0,
    status: 'available',
    currentFlightId: null,
    aircraftType: randomElement(['Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380', 'Boeing 787']),
    services: ['boarding', 'baggage', 'fuel'].slice(0, Math.floor(Math.random() * 3) + 1)
  };
}

function generateRandomEvent(index) {
  const eventTypes = ['weather', 'security', 'technical', 'operational'];
  const severities = ['low', 'medium', 'high'];
  return {
    eventId: `EVT-${index}`,
    type: randomElement(eventTypes),
    severity: randomElement(severities),
    title: `Event ${index}`,
    description: `Generated event ${index} for simulation`,
    status: 'active',
    impact: randomElement(['none', 'low', 'medium', 'high'])
  };
}

module.exports = {
  generateRandomFlight,
  generateRandomGate,
  generateRandomEvent
};
