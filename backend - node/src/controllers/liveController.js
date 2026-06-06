const aviationApi = require('../services/aviationApiService');

exports.getStatus = async (req, res) => {
  res.json({
    success: true,
    data: {
      configured: aviationApi.isConfigured(),
      provider: 'AviationStack',
      lastSync: null
    }
  });
};

exports.getFlights = async (req, res) => {
  const { dep_iata, arr_iata, flight_status, limit, offset } = req.query;

  if (!aviationApi.isConfigured()) {
    return res.json({
      success: false,
      error: 'Live aviation API not configured. Set LIVE_AVIATION_API_KEY environment variable.',
      data: [],
      source: 'none'
    });
  }

  const params = {};
  if (dep_iata) params.dep_iata = dep_iata;
  if (arr_iata) params.arr_iata = arr_iata;
  if (flight_status) params.flight_status = flight_status;
  if (limit) params.limit = parseInt(limit);
  if (offset) params.offset = parseInt(offset);

  const result = await aviationApi.fetchFlights(params);
  res.json(result);
};

exports.getFlightsByAirport = async (req, res) => {
  const { code } = req.params;

  if (!aviationApi.isConfigured()) {
    return res.json({ success: false, error: 'API not configured', data: [] });
  }

  const result = await aviationApi.fetchFlightsByAirport(code.toUpperCase());
  res.json(result);
};

exports.getArrivalsByAirport = async (req, res) => {
  const { code } = req.params;

  if (!aviationApi.isConfigured()) {
    return res.json({ success: false, error: 'API not configured', data: [] });
  }

  const result = await aviationApi.fetchArrivalsByAirport(code.toUpperCase());
  res.json(result);
};

exports.seedSimulation = async (req, res) => {
  const result = await aviationApi.seedSimulation();
  res.json(result);
};
