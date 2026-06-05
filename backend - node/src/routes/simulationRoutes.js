const express = require('express');
const router = express.Router();
const {
  getStatus,
  startSimulation,
  stopSimulation,
  getMetrics,
  triggerEvent
} = require('../controllers/simulationController');

router.get('/status', getStatus);
router.post('/start', startSimulation);
router.post('/stop', stopSimulation);
router.get('/metrics', getMetrics);
router.post('/trigger-event', triggerEvent);

module.exports = router;
