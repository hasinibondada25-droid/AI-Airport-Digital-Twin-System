class OptimizationService {
  static suggestGateAssignment(flight, availableGates, currentAssignments) {
    if (!availableGates || availableGates.length === 0) {
      return null;
    }

    const scoredGates = availableGates.map(gate => ({
      gate,
      score: this.calculateGateScore(gate, flight, currentAssignments)
    }));

    scoredGates.sort((a, b) => b.score - a.score);
    return scoredGates[0].gate;
  }

  static calculateGateScore(gate, flight, currentAssignments) {
    let score = 100;

    const gateLoad = gate.currentLoad || 0;
    const capacity = gate.capacity || 200;
    const utilization = gateLoad / capacity;

    if (utilization > 0.8) score -= 30;
    else if (utilization > 0.6) score -= 15;
    else score += 10;

    if (gate.status === 'available') score += 20;
    if (gate.status === 'maintenance') score -= 100;

    if (gate.terminal === flight.terminal) score += 15;

    const nearbyAssignments = currentAssignments.filter(a => a.gateId === gate.gateId);
    if (nearbyAssignments.length > 0) score -= 10;

    if (flight.priority > 5) score += 10;

    score += Math.random() * 5;

    return Math.max(0, score);
  }

  static balanceGateLoad(gates) {
    const totalLoad = gates.reduce((sum, g) => sum + (g.currentLoad || 0), 0);
    const avgLoad = totalLoad / gates.length;

    return gates.map(gate => ({
      ...gate,
      loadDelta: (gate.currentLoad || 0) - avgLoad,
      recommendation: (gate.currentLoad || 0) > avgLoad * 1.2
        ? 'Reduce load - redistribute flights'
        : (gate.currentLoad || 0) < avgLoad * 0.8
          ? 'Available capacity - assign more flights'
          : 'Optimal load'
    }));
  }

  static findOptimalPath(from, to, gateLayout) {
    const distances = gateLayout.distances || {};
    const key = `${from}-${to}`;
    const reverseKey = `${to}-${from}`;

    return distances[key] || distances[reverseKey] || Math.floor(Math.random() * 500) + 100;
  }
}

module.exports = OptimizationService;
