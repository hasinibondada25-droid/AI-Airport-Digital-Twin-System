const SimulationEngine = require('../services/simulationEngine');

exports.getStatus = async (req, res) => {
  const engine = SimulationEngine.getInstance();
  res.json({
    success: true,
    data: {
      running: engine.isRunning(),
      tick: engine.getTick(),
      speed: engine.getSpeed()
    }
  });
};

exports.startSimulation = async (req, res) => {
  try {
    const { speed } = req.body;
    const engine = SimulationEngine.getInstance();
    engine.start(speed || 5000);
    res.json({ success: true, message: 'Simulation started' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.stopSimulation = async (req, res) => {
  try {
    const engine = SimulationEngine.getInstance();
    engine.stop();
    res.json({ success: true, message: 'Simulation stopped' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getMetrics = async (req, res) => {
  try {
    const engine = SimulationEngine.getInstance();
    const metrics = engine.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.triggerEvent = async (req, res) => {
  try {
    const { type, severity, title, description } = req.body;
    const engine = SimulationEngine.getInstance();
    const event = engine.triggerEvent({ type, severity, title, description });
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
