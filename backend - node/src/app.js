const express = require('express');
const path = require('path');
const cors = require('cors');
const flightRoutes = require('./routes/flightRoutes');
const gateRoutes = require('./routes/gateRoutes');
const aiRoutes = require('./routes/aiRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const liveRoutes = require('./routes/liveRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/flights', flightRoutes);
app.use('/api/gates', gateRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/live', liveRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  }
});

module.exports = app;
