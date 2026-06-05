const Flight = require('../models/Flight');
const store = require('../services/dataStore');

exports.getFlights = async (req, res) => {
  try {
    const { status, gate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (gate) filter.gate = gate;
    const flights = await Flight.find(filter).sort({ scheduledDeparture: 1 });
    res.json({ success: true, data: flights });
  } catch (error) {
    const { status, gate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (gate) filter.gate = gate;
    const flights = store.getFlights(filter);
    res.json({ success: true, data: flights, source: 'memory' });
  }
};

exports.getFlight = async (req, res) => {
  try {
    const flight = await Flight.findOne({ flightId: req.params.id });
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, data: flight });
  } catch (error) {
    const flight = store.getFlight(req.params.id);
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, data: flight, source: 'memory' });
  }
};

exports.createFlight = async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    res.status(201).json({ success: true, data: flight });
  } catch (error) {
    const flight = store.addFlight(req.body);
    res.status(201).json({ success: true, data: flight, source: 'memory' });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const flight = await Flight.findOneAndUpdate(
      { flightId: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, data: flight });
  } catch (error) {
    const flight = store.updateFlight(req.params.id, req.body);
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, data: flight, source: 'memory' });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    const flight = await Flight.findOneAndDelete({ flightId: req.params.id });
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, message: 'Flight deleted' });
  } catch (error) {
    const removed = store.removeFlight(req.params.id);
    if (!removed) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, message: 'Flight deleted', source: 'memory' });
  }
};

exports.assignGate = async (req, res) => {
  try {
    const { flightId, gateId } = req.body;
    const flight = await Flight.findOneAndUpdate(
      { flightId },
      { gate: gateId, updatedAt: new Date() },
      { new: true }
    );
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, data: flight });
  } catch (error) {
    const flight = store.updateFlight(req.body.flightId, { gate: req.body.gateId });
    if (!flight) return res.status(404).json({ success: false, error: 'Flight not found' });
    res.json({ success: true, data: flight, source: 'memory' });
  }
};
