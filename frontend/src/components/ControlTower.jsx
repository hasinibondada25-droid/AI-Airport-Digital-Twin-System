import React, { useState } from 'react';
import api from '../services/api';

export default function ControlTower({ onAction }) {
  const [loading, setLoading] = useState('');
  const [eventForm, setEventForm] = useState({
    type: 'operational',
    severity: 'medium',
    title: '',
    description: ''
  });

  const handleAction = async (action, data) => {
    setLoading(action);
    try {
      if (action === 'start') {
        await api.startSimulation(data?.speed || 5000);
      } else if (action === 'stop') {
        await api.stopSimulation();
      } else if (action === 'trigger-event') {
        await api.triggerEvent(eventForm);
        setEventForm({ type: 'operational', severity: 'medium', title: '', description: '' });
      }
      if (onAction) onAction(action);
    } catch (err) {
      console.error('Control action failed:', err);
    }
    setLoading('');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">🎮 Control Tower</h3>
      </div>
      <div className="control-panel">
        <div className="control-row">
          <button
            className="btn btn-success"
            onClick={() => handleAction('start')}
            disabled={loading === 'start'}
          >
            {loading === 'start' ? 'Starting...' : '▶ Start Simulation'}
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleAction('stop')}
            disabled={loading === 'stop'}
          >
            {loading === 'stop' ? 'Stopping...' : '⏹ Stop Simulation'}
          </button>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 8 }}>
          <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🚨 Trigger Event</h4>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select
              className="form-select"
              value={eventForm.type}
              onChange={e => setEventForm({ ...eventForm, type: e.target.value })}
            >
              <option value="weather">Weather</option>
              <option value="security">Security</option>
              <option value="technical">Technical</option>
              <option value="operational">Operational</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Severity</label>
            <select
              className="form-select"
              value={eventForm.severity}
              onChange={e => setEventForm({ ...eventForm, severity: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              value={eventForm.title}
              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
              placeholder="Event title..."
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              className="form-input"
              value={eventForm.description}
              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
              placeholder="Event description..."
            />
          </div>
          <button
            className="btn btn-warning"
            onClick={() => handleAction('trigger-event')}
            disabled={loading === 'trigger-event' || !eventForm.title}
          >
            {loading === 'trigger-event' ? 'Sending...' : '🔔 Trigger Event'}
          </button>
        </div>
      </div>
    </div>
  );
}
