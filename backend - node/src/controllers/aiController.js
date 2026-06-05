const aiService = require('../services/aiService');
const Flight = require('../models/Flight');
const Gate = require('../models/Gate');

exports.predictDelay = async (req, res) => {
  try {
    const { flightId } = req.body;
    let flightData;
    if (flightId) {
      flightData = await Flight.findOne({ flightId });
      if (!flightData) return res.status(404).json({ success: false, error: 'Flight not found' });
    }
    const prediction = await aiService.predictDelay(flightData || req.body);
    res.json({ success: true, data: prediction });
  } catch (error) {
    const fallback = aiService.getFallbackDelayPrediction(req.body);
    res.json({ success: true, data: fallback, source: 'fallback' });
  }
};

exports.predictCrowd = async (req, res) => {
  try {
    const { gateId, terminal } = req.body;
    const prediction = await aiService.predictCrowd(req.body);
    res.json({ success: true, data: prediction });
  } catch (error) {
    const fallback = aiService.getFallbackCrowdPrediction(req.body);
    res.json({ success: true, data: fallback, source: 'fallback' });
  }
};

exports.optimizeGates = async (req, res) => {
  try {
    const { flights, gates } = req.body;
    const flightsData = flights || await Flight.find({ status: { $in: ['scheduled', 'delayed'] } });
    const gatesData = gates || await Gate.find({ status: 'available' });
    const result = await aiService.optimizeGates({
      flights: flightsData.map(f => f.toObject ? f.toObject() : f),
      gates: gatesData.map(g => g.toObject ? g.toObject() : g)
    });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.runScenario = async (req, res) => {
  try {
    const result = await aiService.runScenario(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    const fallback = aiService.getFallbackScenarioResult(req.body);
    res.json({ success: true, data: fallback, source: 'fallback' });
  }
};
