const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['weather', 'security', 'technical', 'operational', 'emergency', 'system'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  },
  title: { type: String, required: true },
  description: { type: String },
  affectedFlights: [{ type: String }],
  affectedGates: [{ type: String }],
  status: {
    type: String,
    enum: ['active', 'resolved', 'pending'],
    default: 'active'
  },
  impact: {
    type: String,
    enum: ['none', 'low', 'medium', 'high'],
    default: 'none'
  },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

eventSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
