import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import SimulationView from './pages/SimulationView';
import AdminPanel from './pages/AdminPanel';

const PAGES = {
  dashboard: { component: Dashboard, label: 'Dashboard', icon: '📊' },
  analytics: { component: Analytics, label: 'Analytics', icon: '📈' },
  simulation: { component: SimulationView, label: 'Simulation', icon: '🎮' },
  admin: { component: AdminPanel, label: 'Admin', icon: '⚙️' }
};

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const PageComponent = PAGES[currentPage]?.component || Dashboard;

  return (
    <div className="app-container">
      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{sidebarOpen ? '✈️ Airport Twin' : '✈️'}</h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="sidebar-nav">
          {Object.entries(PAGES).map(([key, { label, icon }]) => (
            <button
              key={key}
              className={`nav-item ${currentPage === key ? 'active' : ''}`}
              onClick={() => setCurrentPage(key)}
            >
              <span className="nav-icon">{icon}</span>
              {sidebarOpen && <span className="nav-label">{label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          {sidebarOpen && <span className="version">v1.0.0</span>}
        </div>
      </aside>
      <main className="main-content">
        <PageComponent />
      </main>
    </div>
  );
}
