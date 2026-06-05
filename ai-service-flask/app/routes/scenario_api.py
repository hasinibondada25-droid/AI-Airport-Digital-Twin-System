from flask import Blueprint, request, jsonify
import random

scenario_bp = Blueprint('scenario', __name__)

@scenario_bp.route('/scenario', methods=['POST'])
def run_scenario():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    scenario_type = data.get('type', 'what-if')
    extra_flights = data.get('extra_flights', 0)
    weather_condition = data.get('weather_condition', 'normal')
    security_level = data.get('security_level', 'normal')

    delay_factor = 1.0
    if weather_condition == 'storm':
        delay_factor = 2.5
    elif weather_condition == 'rain':
        delay_factor = 1.5

    if security_level == 'high':
        delay_factor *= 1.3

    base_delays = extra_flights * 0.3 * delay_factor
    base_congestion = 20 + extra_flights * 2 * delay_factor
    base_gate_util = min(95, 60 + extra_flights * 1.5)
    base_wait_time = 10 + extra_flights * 0.5 * delay_factor

    return jsonify({
        'scenario': scenario_type,
        'parameters': {
            'extra_flights': extra_flights,
            'weather': weather_condition,
            'security': security_level
        },
        'predicted_outcomes': {
            'flight_delays': int(base_delays) + random.randint(0, 5),
            'passenger_congestion': min(100, int(base_congestion)),
            'gate_utilization': int(base_gate_util),
            'average_wait_time': int(base_wait_time)
        },
        'recommendations': [
            'Open additional security lanes',
            'Prepone gate assignments for high-priority flights',
            'Increase staff at bottleneck areas'
        ],
        'confidence': round(0.82 - 0.02 * extra_flights, 2)
    })
