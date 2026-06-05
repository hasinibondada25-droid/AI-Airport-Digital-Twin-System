const Gate = require('../models/Gate');
const store = require('../services/dataStore');

exports.getGates = async (req, res) => {
  try {
    const { status, terminal } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (terminal) filter.terminal = terminal;
    const gates = await Gate.find(filter).sort({ name: 1 });
    res.json({ success: true, data: gates });
  } catch (error) {
    const { status, terminal } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (terminal) filter.terminal = terminal;
    const gates = store.getGates(filter);
    res.json({ success: true, data: gates, source: 'memory' });
  }
};

exports.getGate = async (req, res) => {
  try {
    const gate = await Gate.findOne({ gateId: req.params.id });
    if (!gate) return res.status(404).json({ success: false, error: 'Gate not found' });
    res.json({ success: true, data: gate });
  } catch (error) {
    const gate = store.getGate(req.params.id);
    if (!gate) return res.status(404).json({ success: false, error: 'Gate not found' });
    res.json({ success: true, data: gate, source: 'memory' });
  }
};

exports.updateGate = async (req, res) => {
  try {
    const gate = await Gate.findOneAndUpdate(
      { gateId: req.params.id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!gate) return res.status(404).json({ success: false, error: 'Gate not found' });
    res.json({ success: true, data: gate });
  } catch (error) {
    const gate = store.updateGate(req.params.id, req.body);
    if (!gate) return res.status(404).json({ success: false, error: 'Gate not found' });
    res.json({ success: true, data: gate, source: 'memory' });
  }
};

exports.assignFlightToGate = async (req, res) => {
  try {
    const { gateId, flightId } = req.body;
    const gate = await Gate.findOneAndUpdate(
      { gateId, status: 'available' },
      { status: 'occupied', currentFlightId: flightId, currentLoad: 50, lastUsed: new Date(), updatedAt: new Date() },
      { new: true }
    );
    if (!gate) return res.status(400).json({ success: false, error: 'Gate not available' });
    res.json({ success: true, data: gate });
  } catch (error) {
    const gate = store.getGate(req.body.gateId);
    if (!gate || gate.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Gate not available' });
    }
    gate.status = 'occupied';
    gate.currentFlightId = req.body.flightId;
    gate.currentLoad = 50;
    store.updateGate(gate.gateId, gate);
    res.json({ success: true, data: gate, source: 'memory' });
  }
};

exports.releaseGate = async (req, res) => {
  try {
    const { gateId } = req.body;
    const gate = await Gate.findOneAndUpdate(
      { gateId, status: 'occupied' },
      { status: 'available', currentFlightId: null, currentLoad: 0, updatedAt: new Date() },
      { new: true }
    );
    if (!gate) return res.status(400).json({ success: false, error: 'Gate not occupied' });
    res.json({ success: true, data: gate });
  } catch (error) {
    const gate = store.getGate(req.body.gateId);
    if (!gate || gate.status !== 'occupied') {
      return res.status(400).json({ success: false, error: 'Gate not occupied' });
    }
    gate.status = 'available';
    gate.currentFlightId = null;
    gate.currentLoad = 0;
    store.updateGate(gate.gateId, gate);
    res.json({ success: true, data: gate, source: 'memory' });
  }
};
