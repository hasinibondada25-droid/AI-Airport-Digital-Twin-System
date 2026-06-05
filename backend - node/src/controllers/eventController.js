const Event = require('../models/Event');
const store = require('../services/dataStore');

exports.getEvents = async (req, res) => {
  try {
    const { status, type, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    const events = await Event.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: events });
  } catch (error) {
    const { status, type, severity } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    const events = store.getEvents(filter);
    res.json({ success: true, data: events, source: 'memory' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    const event = store.addEvent(req.body);
    res.status(201).json({ success: true, data: event, source: 'memory' });
  }
};

exports.resolveEvent = async (req, res) => {
  try {
    const event = await Event.findOneAndUpdate(
      { eventId: req.params.id },
      { status: 'resolved', resolvedAt: new Date(), updatedAt: new Date() },
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
    res.json({ success: true, data: event });
  } catch (error) {
    return res.status(404).json({ success: false, error: 'Event not found (memory mode)' });
  }
};
