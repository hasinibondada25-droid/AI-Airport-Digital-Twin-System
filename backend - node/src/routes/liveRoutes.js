const express = require('express');
const router = express.Router();
const {
  getStatus,
  getFlights,
  getFlightsByAirport,
  getArrivalsByAirport,
  seedSimulation
} = require('../controllers/liveController');

router.get('/status', getStatus);
router.get('/flights', getFlights);
router.get('/flights/departures/:code', getFlightsByAirport);
router.get('/flights/arrivals/:code', getArrivalsByAirport);
router.post('/seed', seedSimulation);

module.exports = router;
