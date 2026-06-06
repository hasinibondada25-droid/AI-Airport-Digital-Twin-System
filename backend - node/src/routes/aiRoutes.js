const express = require('express');
const router = express.Router();
const {
  predictDelay,
  predictCrowd,
  optimizeGates,
  runScenario,
  predictRunway,
  generateAlerts
} = require('../controllers/aiController');

router.post('/predict-delay', predictDelay);
router.post('/predict-crowd', predictCrowd);
router.post('/optimize-gates', optimizeGates);
router.post('/scenario', runScenario);
router.post('/predict-runway', predictRunway);
router.post('/generate-alerts', generateAlerts);

module.exports = router;
