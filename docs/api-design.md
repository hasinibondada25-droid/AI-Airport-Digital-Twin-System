# API Design - AI Airport Digital Twin System

## Base URL
- Node.js Backend: `http://localhost:5000/api`
- Flask AI Service: `http://localhost:5001`

---

## Node.js Backend Endpoints

### Flights

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/flights` | List all flights (query: status, gate) |
| GET | `/flights/:id` | Get flight by ID |
| POST | `/flights` | Create new flight |
| PUT | `/flights/:id` | Update flight |
| DELETE | `/flights/:id` | Delete flight |
| POST | `/flights/assign-gate` | Assign gate to flight |

### Gates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/gates` | List all gates (query: status, terminal) |
| GET | `/gates/:id` | Get gate by ID |
| PUT | `/gates/:id` | Update gate |
| POST | `/gates/assign` | Assign flight to gate |
| POST | `/gates/release` | Release gate |

### AI

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ai/predict-delay` | Predict flight delay |
| POST | `/ai/predict-crowd` | Predict crowd congestion |
| POST | `/ai/optimize-gates` | Get gate optimization suggestions |
| POST | `/ai/scenario` | Run what-if scenario |

### Simulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/simulation/status` | Get simulation status |
| POST | `/simulation/start` | Start simulation |
| POST | `/simulation/stop` | Stop simulation |
| GET | `/simulation/metrics` | Get simulation metrics |
| POST | `/simulation/trigger-event` | Trigger custom event |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | List events (query: status, type, severity) |
| POST | `/events` | Create event |
| PUT | `/events/:id/resolve` | Resolve event |

---

## Flask AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health check |
| POST | `/predict-delay` | Flight delay prediction |
| POST | `/predict-crowd` | Crowd congestion prediction |
| POST | `/optimize-gates` | Gate optimization |
| POST | `/scenario` | What-if scenario simulation |

---

## WebSocket Events (Socket.io)

### Client → Server

| Event | Description |
|-------|-------------|
| `subscribe-simulation` | Join simulation room |
| `unsubscribe-simulation` | Leave simulation room |

### Server → Client

| Event | Description |
|-------|-------------|
| `state-update` | Full system state (flights, gates, events, metrics) |
| `flight-update` | Individual flight update |
| `gate-update` | Individual gate update |
| `new-event` | New event triggered |
| `passenger-update` | Passenger flow data |
| `metrics-update` | System metrics update |
| `alert` | System alert |

---

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": "error message"
}
```
