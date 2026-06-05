require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const { connectDB } = require('./config/db');
const SimulationEngine = require('./services/simulationEngine');
const store = require('./services/dataStore');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

const engine = SimulationEngine.getInstance();

connectDB().then(() => {
  store.setMongoAvailable(true);
  console.log('MongoDB connected');
  server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    engine.start(5000);
  });
}).catch((err) => {
  console.error('MongoDB unavailable, using in-memory store:', err.message);
  store.setMongoAvailable(false);
  server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT} (in-memory mode)`);
    engine.start(5000);
  });
});
