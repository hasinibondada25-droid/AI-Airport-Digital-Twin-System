const express = require('express');
const router = express.Router();
const {
  getGates,
  getGate,
  updateGate,
  assignFlightToGate,
  releaseGate
} = require('../controllers/gateController');

router.get('/', getGates);
router.get('/:id', getGate);
router.put('/:id', updateGate);
router.post('/assign', assignFlightToGate);
router.post('/release', releaseGate);

module.exports = router;
