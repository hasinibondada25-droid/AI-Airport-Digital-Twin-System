export const AIRPORT_NAME = 'AI Airport Digital Twin';

export const TERMINALS = ['T1', 'T2'];

export const FLIGHT_STATUSES = [
  'scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled', 'diverted'
];

export const GATE_STATUSES = ['available', 'occupied', 'maintenance', 'closed'];

export const PASSENGER_STAGES = [
  { id: 'entry', label: 'Entry', icon: '🚪' },
  { id: 'check-in', label: 'Check-in', icon: '💼' },
  { id: 'security', label: 'Security', icon: '🛂' },
  { id: 'retail', label: 'Retail', icon: '🛍️' },
  { id: 'gate', label: 'Gate', icon: '🚏' },
  { id: 'boarding', label: 'Boarding', icon: '✈️' }
];

export const EVENT_TYPES = [
  { id: 'weather', label: 'Weather', icon: '🌤️', severity: ['low', 'medium', 'high'] },
  { id: 'security', label: 'Security', icon: '🔒', severity: ['low', 'medium', 'high', 'critical'] },
  { id: 'technical', label: 'Technical', icon: '🔧', severity: ['low', 'medium', 'high'] },
  { id: 'operational', label: 'Operational', icon: '⚙️', severity: ['low', 'medium', 'high'] },
  { id: 'emergency', label: 'Emergency', icon: '🚨', severity: ['high', 'critical'] }
];

export const SIMULATION_SPEEDS = [
  { value: 1000, label: '1x' },
  { value: 500, label: '2x' },
  { value: 200, label: '5x' },
  { value: 100, label: '10x' }
];

export const CHART_COLORS = {
  blue: 'rgba(59, 130, 246, 0.8)',
  green: 'rgba(34, 197, 94, 0.8)',
  yellow: 'rgba(234, 179, 8, 0.8)',
  red: 'rgba(239, 68, 68, 0.8)',
  purple: 'rgba(168, 85, 247, 0.8)',
  cyan: 'rgba(6, 182, 212, 0.8)',
  blueBg: 'rgba(59, 130, 246, 0.1)',
  greenBg: 'rgba(34, 197, 94, 0.1)',
  yellowBg: 'rgba(234, 179, 8, 0.1)',
  redBg: 'rgba(239, 68, 68, 0.1)',
};

export const AIRPORT_LAYOUT = {
  terminals: [
    { id: 'T1', label: 'Terminal 1', gates: ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12'] },
    { id: 'T2', label: 'Terminal 2', gates: ['G13','G14','G15','G16','G17','G18','G19','G20'] }
  ]
};
