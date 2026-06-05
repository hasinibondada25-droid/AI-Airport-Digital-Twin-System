const mongoose = require('mongoose');

const gateSchema = new mongoose.Schema({
  gateId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  terminal: { type: String, default: 'T1' },
  capacity: { type: Number, default: 200 },
  currentLoad: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance', 'closed'],
    default: 'available'
  },
  currentFlightId: { type: String, default: null },
  aircraftType: { type: String, default: 'Boeing 737' },
  isEmergencyExit: { type: Boolean, default: false },
  services: [{
    type: String,
    enum: ['boarding', 'baggage', 'fuel', 'catering', 'maintenance']
  }],
  lastUsed: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

gateSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Gate', gateSchema);
