export const FLIGHT_STATUS = {
  SCHEDULED: 'scheduled',
  BOARDING: 'boarding',
  DEPARTED: 'departed',
  ARRIVED: 'arrived',
  DELAYED: 'delayed',
  CANCELLED: 'cancelled',
  DIVERTED: 'diverted'
};

export const GATE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  CLOSED: 'closed'
};

export const PASSENGER_STAGE = {
  ENTRY: 'entry',
  CHECK_IN: 'check-in',
  SECURITY: 'security',
  RETAIL: 'retail',
  GATE: 'gate',
  BOARDING: 'boarding',
  DEPARTED: 'departed'
};

export const EVENT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const EVENT_TYPE = {
  WEATHER: 'weather',
  SECURITY: 'security',
  TECHNICAL: 'technical',
  OPERATIONAL: 'operational',
  EMERGENCY: 'emergency',
  SYSTEM: 'system'
};

export const EVENT_STATUS = {
  ACTIVE: 'active',
  RESOLVED: 'resolved',
  PENDING: 'pending'
};

export const WEATHER_IMPACT = {
  NONE: 'none',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const API_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error'
};
