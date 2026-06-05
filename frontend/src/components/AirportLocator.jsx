import React, { useState, useEffect } from 'react';

const AIRPORTS = [
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', lat: 28.5562, lng: 77.1000, terminals: 3 },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', lat: 19.0896, lng: 72.8656, terminals: 2 },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bangalore', lat: 13.1986, lng: 77.7066, terminals: 2 },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', lat: 12.9815, lng: 80.1640, terminals: 3 },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose International Airport', city: 'Kolkata', lat: 22.6547, lng: 88.4467, terminals: 2 },
  { code: 'HYD', name: 'Rajiv Gandhi International Airport', city: 'Hyderabad', lat: 17.2313, lng: 78.4299, terminals: 1 },
  { code: 'AMD', name: 'Sardar Vallabhbhai Patel International Airport', city: 'Ahmedabad', lat: 23.0742, lng: 72.6344, terminals: 2 },
  { code: 'PNQ', name: 'Pune International Airport', city: 'Pune', lat: 18.5852, lng: 73.9193, terminals: 1 },
  { code: 'JAI', name: 'Jaipur International Airport', city: 'Jaipur', lat: 26.8244, lng: 75.8089, terminals: 1 },
  { code: 'GOI', name: 'Dabolim Airport', city: 'Goa', lat: 15.3808, lng: 73.8314, terminals: 1 },
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', lat: 51.4700, lng: -0.4543, terminals: 4 },
  { code: 'JFK', name: 'John F Kennedy International Airport', city: 'New York', lat: 40.6413, lng: -73.7781, terminals: 6 },
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', lat: 25.2532, lng: 55.3657, terminals: 3 },
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', lat: 1.3644, lng: 103.9915, terminals: 4 },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', lat: 49.0097, lng: 2.5479, terminals: 3 },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', lat: 50.0333, lng: 8.5706, terminals: 2 },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', lat: 35.5494, lng: 139.7798, terminals: 3 },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', lat: -33.9361, lng: 151.1753, terminals: 3 },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', lat: 43.6777, lng: -79.6248, terminals: 2 },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', lat: 41.2608, lng: 28.7424, terminals: 2 }
];

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function AirportLocator() {
  const [location, setLocation] = useState(null);
  const [nearbyAirports, setNearbyAirports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLoc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(userLoc);

        const sorted = AIRPORTS.map(airport => ({
          ...airport,
          distance: Math.round(haversineDistance(userLoc.lat, userLoc.lng, airport.lat, airport.lng))
        })).sort((a, b) => a.distance - b.distance);

        setNearbyAirports(sorted.slice(0, 5));
        setLoading(false);
      },
      (err) => {
        setError('Location access denied. Using default airport.');
        setNearbyAirports(AIRPORTS.slice(0, 5).map(a => ({ ...a, distance: 0 })));
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📍 Detecting Your Location...</h3>
        </div>
        <div className="loading-spinner">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">📍 Nearby Airports</h3>
        {location && (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
          </span>
        )}
      </div>
      {error && (
        <div style={{ padding: '8px 12px', marginBottom: 8, background: 'rgba(234,179,8,0.1)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--accent-yellow)' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {nearbyAirports.map((airport, i) => (
          <div key={airport.code} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: i === 0 ? 'rgba(59,130,246,0.1)' : 'var(--bg-input)',
            borderRadius: 'var(--radius)',
            border: i === 0 ? '1px solid var(--accent-blue)' : '1px solid transparent'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: i === 0 ? 'var(--accent-blue)' : 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 12, color: i === 0 ? 'white' : 'var(--text-secondary)'
              }}>
                {airport.code}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{airport.city}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{airport.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {airport.terminals} terminal{airport.terminals > 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {airport.distance > 0 && (
                <div style={{ fontSize: 18, fontWeight: 700, color: i === 0 ? 'var(--accent-blue)' : 'var(--text-primary)' }}>
                  {airport.distance < 1000 ? `${airport.distance} km` : `${(airport.distance / 1000).toFixed(1)}k km`}
                </div>
              )}
              {airport.distance > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{airport.distance === 0 ? 'Current' : 'away'}</div>
              )}
              {i === 0 && <span className="badge badge-blue" style={{ marginTop: 4 }}>Nearest</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
