const { getIO } = require('../config/socket');

function broadcastFlightUpdate(flight) {
  try {
    const io = getIO();
    io.to('simulation').emit('flight-update', flight);
  } catch (err) {
    console.error('Broadcast flight update error:', err.message);
  }
}

function broadcastGateUpdate(gate) {
  try {
    const io = getIO();
    io.to('simulation').emit('gate-update', gate);
  } catch (err) {
    console.error('Broadcast gate update error:', err.message);
  }
}

function broadcastEvent(event) {
  try {
    const io = getIO();
    io.to('simulation').emit('new-event', event);
  } catch (err) {
    console.error('Broadcast event error:', err.message);
  }
}

function broadcastMetrics(metrics) {
  try {
    const io = getIO();
    io.to('simulation').emit('metrics-update', metrics);
  } catch (err) {
    console.error('Broadcast metrics error:', err.message);
  }
}

function broadcastAlert(alert) {
  try {
    const io = getIO();
    io.to('simulation').emit('alert', alert);
  } catch (err) {
    console.error('Broadcast alert error:', err.message);
  }
}

module.exports = {
  broadcastFlightUpdate,
  broadcastGateUpdate,
  broadcastEvent,
  broadcastMetrics,
  broadcastAlert
};
