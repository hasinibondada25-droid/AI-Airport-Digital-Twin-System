const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const mockFlights = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'shared', 'mock-data', 'flights.json'), 'utf8')
);
const mockGates = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'shared', 'mock-data', 'gates.json'), 'utf8')
);

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/airport-digital-twin';

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const Flight = require('../backend - node/src/models/Flight');
    const Gate = require('../backend - node/src/models/Gate');

    await Flight.deleteMany({});
    await Gate.deleteMany({});

    for (const flightData of mockFlights) {
      flightData.scheduledDeparture = new Date(flightData.scheduledDeparture);
      flightData.scheduledArrival = new Date(flightData.scheduledArrival);
      if (flightData.estimatedDeparture) {
        flightData.estimatedDeparture = new Date(flightData.estimatedDeparture);
      }
      if (flightData.estimatedArrival) {
        flightData.estimatedArrival = new Date(flightData.estimatedArrival);
      }
      await Flight.create(flightData);
    }

    for (const gateData of mockGates) {
      await Gate.create(gateData);
    }

    console.log(`Seeded ${mockFlights.length} flights and ${mockGates.length} gates`);
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
