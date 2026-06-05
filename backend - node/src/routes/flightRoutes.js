const express = require('express');
const router = express.Router();
const {
  getFlights,
  getFlight,
  createFlight,
  updateFlight,
  deleteFlight,
  assignGate
} = require('../controllers/flightController');

router.get('/', getFlights);
router.get('/:id', getFlight);
router.post('/', createFlight);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);
router.post('/assign-gate', assignGate);

module.exports = router;
