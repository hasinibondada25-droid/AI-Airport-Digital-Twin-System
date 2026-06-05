const mongoose = require('mongoose');

const passengerSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  stage: {
    type: String,
    enum: ['entry', 'check-in', 'security', 'retail', 'gate', 'boarding', 'departed'],
    default: 'entry'
  },
  count: { type: Number, required: true },
  flightId: { type: String, default: null },
  gateId: { type: String, default: null },
  queueTime: { type: Number, default: 0 },
  bottleneck: { type: Boolean, default: false },
  dwellTime: { type: Number, default: 0 },
  terminal: { type: String, default: 'T1' }
});

module.exports = mongoose.model('Passenger', passengerSchema);
