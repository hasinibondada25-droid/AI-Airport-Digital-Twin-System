from flask import Blueprint, request, jsonify
import random

alert_bp = Blueprint('alert', __name__)

@alert_bp.route('/generate-alerts', methods=['POST'])
def generate_alerts():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    flights = data.get('flights', [])
    gates = data.get('gates', [])
    events = data.get('events', [])
    metrics = data.get('metrics', {})

    alerts = []

    if metrics:
        congestion = metrics.get('congestionIndex', 0)
        efficiency = metrics.get('efficiencyScore', 100)
        delay_index = metrics.get('delayIndex', 0)
        delayed = metrics.get('delayedFlights', 0)
        total = metrics.get('totalFlights', 0)
        available = metrics.get('availableGates', 0)
        total_gates = metrics.get('totalGates', 1)

        if congestion > 75:
            alerts.append(generate_alert('congestion', 'high',
                'Critical Congestion Detected',
                f'Terminal congestion at {congestion:.0f}% - passenger flow severely impacted',
                'Open additional security lanes and increase staffing at choke points'))
        elif congestion > 50:
            alerts.append(generate_alert('congestion', 'medium',
                'High Passenger Volume',
                f'Congestion index at {congestion:.0f}% - monitor bottleneck areas',
                'Consider proactive gate reassignment and staff deployment'))

        if efficiency < 40:
            alerts.append(generate_alert('operational', 'high',
                'Low Operational Efficiency',
                f'Efficiency score at {efficiency:.0f}% - below target threshold',
                'Review gate assignments and optimize turnaround times'))
        elif efficiency < 65:
            alerts.append(generate_alert('operational', 'medium',
                'Efficiency Below Optimal',
                f'Current efficiency {efficiency:.0f}% - room for improvement',
                'Analyze delay patterns and adjust scheduling'))

        rate = (delayed / max(1, total)) * 100
        if rate > 40:
            alerts.append(generate_alert('delay', 'high',
                'Massive Flight Delays',
                f'{delayed} of {total} flights delayed ({rate:.0f}%)',
                'Implement delay recovery plan and prioritize long-haul departures'))
        elif rate > 20:
            alerts.append(generate_alert('delay', 'medium',
                'Elevated Delay Rate',
                f'{rate:.0f}% of flights currently delayed',
                'Review weather impact and adjust departure sequencing'))

        gate_util = ((total_gates - available) / max(1, total_gates)) * 100
        if gate_util > 85:
            alerts.append(generate_alert('gate', 'high',
                'Gate Saturation',
                f'{gate_util:.0f}% gates occupied - minimal buffer capacity',
                'Expedite departures and prepare remote parking stands'))
        elif available == 0:
            alerts.append(generate_alert('gate', 'critical',
                'No Available Gates',
                'All gates are occupied - incoming flights at risk',
                'Immediately release non-essential gates and divert incoming flights'))

    for event in (events or []):
        if event.get('severity') in ('critical', 'high') and event.get('status') == 'active':
            alerts.append(generate_alert(
                event.get('type', 'operational'),
                event.get('severity', 'high'),
                f"Active: {event.get('title', 'Event')}",
                event.get('description', ''),
                'Coordinate response teams and update flight schedules accordingly'
            ))

    delayed_flights = [f for f in (flights or []) if f.get('status') == 'delayed']
    if len(delayed_flights) > 5:
        avg_delay = sum(f.get('delayMinutes', 0) for f in delayed_flights) / len(delayed_flights)
        alerts.append(generate_alert('delay', 'medium',
            f'{len(delayed_flights)} Flights Delayed',
            f'Average delay {avg_delay:.0f} minutes across {len(delayed_flights)} flights',
            'Review common routes and weather patterns causing delays'))

    active_events = [e for e in (events or []) if e.get('status') == 'active']
    if len(active_events) >= 3:
        alerts.append(generate_alert('system', 'high',
            'Multiple Active Incidents',
            f'{len(active_events)} active events requiring attention',
            'Activate emergency operations center if threshold exceeded'))

    if len(alerts) < 2:
        alerts.append(generate_alert('system', 'low',
            'System Operating Normally',
            'All key metrics within acceptable thresholds',
            'Continue monitoring for any deviations'))

    alerts.sort(key=lambda a: {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}.get(a['severity'], 99))

    return jsonify({
        'alerts': alerts[:10],
        'total_generated': len(alerts),
        'summary': {
            'critical': sum(1 for a in alerts if a['severity'] == 'critical'),
            'high': sum(1 for a in alerts if a['severity'] == 'high'),
            'medium': sum(1 for a in alerts if a['severity'] == 'medium'),
            'low': sum(1 for a in alerts if a['severity'] == 'low')
        }
    })

def generate_alert(alert_type, severity, title, description, recommendation):
    return {
        'id': f'ALT-{random.randint(10000, 99999)}',
        'type': alert_type,
        'severity': severity,
        'title': title,
        'description': description,
        'recommendation': recommendation,
        'generated_at': __import__('datetime').datetime.now().isoformat(),
        'source': 'ai-engine',
        'status': 'active'
    }
