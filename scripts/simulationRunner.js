const SimulationEngine = require('../backend - node/src/services/simulationEngine');
const { connectDB } = require('../backend - node/src/config/db');

async function runSimulationHeadless() {
  console.log('Starting headless simulation...');

  try {
    await connectDB();
    console.log('Database connected');
  } catch (err) {
    console.warn('Database not available, running in memory-only mode:', err.message);
  }

  const engine = SimulationEngine.getInstance();
  const speed = parseInt(process.argv[2], 10) || 5000;

  engine.start(speed);

  console.log(`Simulation running at ${speed}ms interval`);
  console.log('Press Ctrl+C to stop');

  process.on('SIGINT', () => {
    console.log('\nStopping simulation...');
    engine.stop();
    console.log(`Total ticks: ${engine.getTick()}`);
    process.exit(0);
  });
}

runSimulationHeadless();
