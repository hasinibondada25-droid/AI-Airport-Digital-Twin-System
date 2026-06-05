const express = require('express');
const router = express.Router();
const {
  predictDelay,
  predictCrowd,
  optimizeGates,
  runScenario
} = require('../controllers/aiController');

router.post('/predict-delay', predictDelay);
router.post('/predict-crowd', predictCrowd);
router.post('/optimize-gates', optimizeGates);
router.post('/scenario', runScenario);

module.exports = router;
