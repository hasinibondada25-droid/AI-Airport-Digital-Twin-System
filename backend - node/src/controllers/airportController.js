const Flight = require('../models/Flight');
const Gate = require('../models/Gate');
const Event = require('../models/Event');
const store = require('../services/dataStore');

exports.getAirportStatus = async (req, res) => {
  try {
    const totalFlights = await Flight.countDocuments();
    const activeFlights = await Flight.countDocuments({ status: { $in: ['scheduled', 'boarding', 'delayed'] } });
    const delayedFlights = await Flight.countDocuments({ status: 'delayed' });
    const totalGates = await Gate.countDocuments();
    const availableGates = await Gate.countDocuments({ status: 'available' });
    const occupiedGates = await Gate.countDocuments({ status: 'occupied' });
    const activeEvents = await Event.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: {
        flights: { total: totalFlights, active: activeFlights, delayed: delayedFlights },
        gates: { total: totalGates, available: availableGates, occupied: occupiedGates },
        events: { active: activeEvents },
        efficiencyScore: calculateEfficiency(delayedFlights, activeFlights),
        congestionIndex: calculateCongestion(occupiedGates, totalGates),
        delayIndex: delayedFlights > 0 ? (delayedFlights / activeFlights) * 100 : 0
      }
    });
  } catch (error) {
    const flights = store.getFlights();
    const gates = store.getGates();
    const events = store.getEvents({ status: 'active' });

    const totalFlights = flights.length;
    const activeFlights = flights.filter(f => ['scheduled', 'boarding', 'delayed'].includes(f.status)).length;
    const delayedFlights = flights.filter(f => f.status === 'delayed').length;
    const totalGates = gates.length;
    const availableGates = gates.filter(g => g.status === 'available').length;
    const occupiedGates = gates.filter(g => g.status === 'occupied').length;
    const activeEvents = events.length;

    res.json({
      success: true,
      data: {
        flights: { total: totalFlights, active: activeFlights, delayed: delayedFlights },
        gates: { total: totalGates, available: availableGates, occupied: occupiedGates },
        events: { active: activeEvents },
        efficiencyScore: calculateEfficiency(delayedFlights, activeFlights),
        congestionIndex: calculateCongestion(occupiedGates, totalGates),
        delayIndex: delayedFlights > 0 ? (delayedFlights / activeFlights) * 100 : 0
      },
      source: 'memory'
    });
  }
};

function calculateEfficiency(delayed, active) {
  if (active === 0) return 100;
  return Math.round(((active - delayed) / active) * 100);
}

function calculateCongestion(occupied, total) {
  if (total === 0) return 0;
  return Math.round((occupied / total) * 100);
}
