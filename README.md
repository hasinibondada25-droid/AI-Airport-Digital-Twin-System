# ✈️ AI Airport Digital Twin System

A full-stack real-time airport simulation platform with AI-powered predictions.

## Architecture

```
Frontend (React + Socket.io Client)
       ↓
Backend (Node.js + Express + Socket.io)
       ↓
AI Service (Python Flask)
       ↓
Database (MongoDB)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Chart.js, Socket.io-client |
| Backend | Node.js, Express, Socket.io, Mongoose |
| AI | Python Flask, scikit-learn |
| Database | MongoDB |

## Features

- **Real-time Flight Tracking** — Live updates every 5 seconds
- **Gate Management** — Assign, release, and optimize gate allocation
- **Passenger Flow** — Simulate entry → check-in → security → gate → boarding
- **AI Predictions** — Delay probability, crowd congestion, gate optimization
- **What-If Engine** — Simulate scenarios (extra flights, weather, security)
- **Emergency System** — Trigger weather, security, technical events
- **Live Dashboard** — Interactive charts, status tables, airport map
- **Control Tower** — Start/stop simulation, trigger events manually
- **Admin Panel** — CRUD flights, manage gates, view event logs

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- MongoDB (optional, falls back gracefully)

### Installation

```bash
# Clone the repository
cd "AI Airport Digital Twin System"

# Install backend dependencies
cd "backend - node"
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install Flask dependencies
cd ../ai-service-flask
pip install -r requirements.txt
```

### Running

```bash
# Terminal 1: Start the backend
cd "backend - node"
npm run dev

# Terminal 2: Start the frontend
cd frontend
npm start

# Terminal 3: Start Flask AI service
cd ai-service-flask
python run.py
```

### Seed Database (optional)

```bash
cd "backend - node"
npm run seed
```

## API Endpoints

See [docs/api-design.md](docs/api-design.md) for full API documentation.

## Project Structure

```
├── frontend/               # React UI
│   ├── src/
│   │   ├── components/     # FlightTable, GateStatus, AirportMap, etc.
│   │   ├── pages/          # Dashboard, Analytics, Simulation, Admin
│   │   ├── services/       # API client, Socket.io client
│   │   └── styles/         # CSS
├── backend - node/         # Node.js API + Realtime
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Simulation engine, AI, socket, optimization
│   │   ├── models/         # Mongoose schemas
│   │   └── routes/         # Express routes
├── ai-service-flask/       # Python Flask AI
│   ├── app/
│   │   ├── routes/         # Delay, crowd, optimize, scenario APIs
│   │   ├── services/       # ML prediction services
│   │   └── models/         # Trained model storage
├── shared/                 # Shared configs, mock data
├── scripts/                # Seed, generate, runner scripts
└── docs/                   # Documentation
```
