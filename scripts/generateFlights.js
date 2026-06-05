const fs = require('fs');
const path = require('path');

const airlines = [
  { code: 'AI', name: 'Air India' }, { code: '6E', name: 'IndiGo' },
  { code: 'SG', name: 'SpiceJet' }, { code: 'UK', name: 'Vistara' },
  { code: 'EK', name: 'Emirates' }, { code: 'QR', name: 'Qatar Airways' },
  { code: 'BA', name: 'British Airways' }, { code: 'LH', name: 'Lufthansa' }
];

const cities = [
  'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata',
  'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Goa',
  'Dubai', 'London', 'New York', 'Singapore', 'Bangkok',
  'Paris', 'Frankfurt', 'Tokyo', 'Sydney', 'Toronto'
];

function random(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateFlight(index) {
  const airline = random(airlines);
  let origin = random(cities);
  let dest = random(cities);
  while (dest === origin) dest = random(cities);

  const now = new Date();
  const depHour = 5 + Math.floor(Math.random() * 18);
  const depDate = new Date(now);
  depDate.setHours(depHour, Math.floor(Math.random() * 60), 0, 0);

  const flightHours = 1 + Math.floor(Math.random() * 7);
  const arrDate = new Date(depDate.getTime() + flightHours * 3600000);

  const risk = Math.random();
  const delayMins = risk > 0.6 ? Math.floor(Math.random() * 120) + 5 : 0;

  const statuses = ['scheduled', 'scheduled', 'boarding', 'delayed', 'scheduled'];
  const status = delayMins > 15 ? 'delayed' : random(statuses);

  return {
    flightId: `${airline.code}${100 + index}`,
    airline: airline.name,
    flightNumber: `${airline.code}${100 + index}`,
    origin,
    destination: dest,
    scheduledDeparture: depDate.toISOString(),
    scheduledArrival: arrDate.toISOString(),
    estimatedDeparture: new Date(depDate.getTime() + delayMins * 60000).toISOString(),
    estimatedArrival: new Date(arrDate.getTime() + delayMins * 60000).toISOString(),
    status,
    gate: null,
    terminal: index <= 12 ? 'T1' : 'T2',
    delayMinutes: delayMins,
    delayRisk: Math.round(risk * 100) / 100,
    passengerCount: Math.floor(Math.random() * 200) + 100,
    priority: Math.floor(Math.random() * 10)
  };
}

function generateFlights(count = 20) {
  const flights = [];
  for (let i = 0; i < count; i++) {
    flights.push(generateFlight(i));
  }
  return flights;
}

const count = parseInt(process.argv[2], 10) || 20;
const flights = generateFlights(count);

const outputPath = path.join(__dirname, '..', 'shared', 'mock-data', 'flights.json');
fs.writeFileSync(outputPath, JSON.stringify(flights, null, 2));
console.log(`Generated ${count} flights → ${outputPath}`);
