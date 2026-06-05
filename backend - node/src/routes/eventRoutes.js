const express = require('express');
const router = express.Router();
const {
  getEvents,
  createEvent,
  resolveEvent
} = require('../controllers/eventController');

router.get('/', getEvents);
router.post('/', createEvent);
router.put('/:id/resolve', resolveEvent);

module.exports = router;
