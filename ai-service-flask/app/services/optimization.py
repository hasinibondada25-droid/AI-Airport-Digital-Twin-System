def optimize_gate_assignment(flights, gates):
    if not gates:
        return {'assignments': [], 'message': 'No gates available'}

    scored_gates = []
    for gate in gates:
        score = 100
        load = gate.get('currentLoad', 0)
        capacity = gate.get('capacity', 200)

        utilization = load / capacity if capacity > 0 else 1
        if utilization > 0.8:
            score -= 30
        elif utilization > 0.6:
            score -= 15
        else:
            score += 10

        if gate.get('status') == 'available':
            score += 20
        elif gate.get('status') == 'maintenance':
            score -= 100

        scored_gates.append({'gate': gate, 'score': score})

    scored_gates.sort(key=lambda x: x['score'], reverse=True)

    assignments = []
    for i, flight in enumerate(flights[:len(scored_gates)]):
        gate_info = scored_gates[i]
        assignments.append({
            'flight_id': flight.get('flightId', flight.get('flight_id', f'FL{i}')),
            'recommended_gate': gate_info['gate'].get('gateId', gate_info['gate'].get('gate_id', f'G{i}')),
            'score': gate_info['score'],
            'reason': 'Optimized gate assignment'
        })

    return {
        'assignments': assignments,
        'overall_efficiency_gain': round(sum(a['score'] for a in assignments) / len(assignments), 1) if assignments else 0,
        'timestamp': __import__('datetime').datetime.now().isoformat()
    }
