from flask import Blueprint, request, jsonify

crowd_bp = Blueprint('crowd', __name__)

@crowd_bp.route('/predict-crowd', methods=['POST'])
def predict_crowd():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    gate_id = data.get('gate_id', 'unknown')
    terminal = data.get('terminal', 'T1')
    hour = data.get('hour', 12)
    day_of_week = data.get('day_of_week', 1)
    flights_count = data.get('flights_count', 10)

    import math
    base_crowd = 100 + (flights_count * 15)
    hour_multiplier = 1.5 if hour >= 17 else (1.3 if hour >= 12 else 1.0)
    weekend_factor = 1.2 if day_of_week >= 6 else 1.0

    crowd_level = int(base_crowd * hour_multiplier * weekend_factor)
    congestion_pct = min(100, int((crowd_level / 500) * 100))
    wait_time = int(crowd_level / 20) + 5
    bottleneck_prob = round(0.8 if crowd_level > 350 else (0.4 if crowd_level > 200 else 0.1), 2)

    return jsonify({
        'gate_id': gate_id,
        'terminal': terminal,
        'crowd_level': crowd_level,
        'congestion_percentage': congestion_pct,
        'wait_time_minutes': wait_time,
        'bottleneck_probability': bottleneck_prob,
        'recommended_gates': ['G5', 'G8', 'G12'] if congestion_pct > 60 else [],
        'stage_breakdown': {
            'security': int(crowd_level * 0.3),
            'check_in': int(crowd_level * 0.25),
            'gate_area': int(crowd_level * 0.35),
            'retail': int(crowd_level * 0.1)
        }
    })
