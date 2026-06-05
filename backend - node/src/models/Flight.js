const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
  flightId: { type: String, required: true, unique: true },
  airline: { type: String, required: true },
  flightNumber: { type: String, required: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  scheduledDeparture: { type: Date, required: true },
  scheduledArrival: { type: Date, required: true },
  estimatedDeparture: { type: Date },
  estimatedArrival: { type: Date },
  actualDeparture: { type: Date },
  actualArrival: { type: Date },
  status: {
    type: String,
    enum: ['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled', 'diverted'],
    default: 'scheduled'
  },
  gate: { type: String, default: null },
  terminal: { type: String, default: 'T1' },
  delayMinutes: { type: Number, default: 0 },
  delayRisk: { type: Number, default: 0 },
  passengerCount: { type: Number, default: 150 },
  baggageClaim: { type: String, default: null },
  weatherImpact: { type: String, enum: ['none', 'low', 'medium', 'high'], default: 'none' },
  priority: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

flightSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Flight', flightSchema);
