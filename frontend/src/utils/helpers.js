export function formatTime(date) {
  if (!date) return '--:--';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(date) {
  if (!date) return '--';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatDateTime(date) {
  if (!date) return '--';
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function delayMinutes(scheduled, estimated) {
  if (!scheduled || !estimated) return 0;
  const diff = new Date(estimated) - new Date(scheduled);
  return Math.max(0, Math.round(diff / 60000));
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function statusColor(status) {
  const colors = {
    scheduled: 'var(--accent-blue)',
    boarding: 'var(--accent-green)',
    departed: 'var(--accent-purple)',
    arrived: 'var(--accent-cyan)',
    delayed: 'var(--accent-yellow)',
    cancelled: 'var(--accent-red)',
    diverted: 'var(--accent-orange)',
    available: 'var(--accent-green)',
    occupied: 'var(--accent-yellow)',
    maintenance: 'var(--text-muted)',
    closed: 'var(--accent-red)'
  };
  return colors[status] || 'var(--text-muted)';
}

export function riskColor(risk) {
  if (risk > 0.6) return 'var(--accent-red)';
  if (risk > 0.3) return 'var(--accent-yellow)';
  return 'var(--accent-green)';
}

export function truncate(str, len = 20) {
  if (!str || str.length <= len) return str;
  return str.substring(0, len) + '...';
}

export function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
