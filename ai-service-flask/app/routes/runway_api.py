from flask import Blueprint, request, jsonify
import math

runway_bp = Blueprint('runway', __name__)

@runway_bp.route('/predict-runway', methods=['POST'])
def predict_runway():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    hour = data.get('hour', 12)
    scheduled_takeoffs = data.get('scheduled_takeoffs', 15)
    scheduled_landings = data.get('scheduled_landings', 15)
    weather_condition = data.get('weather_condition', 'clear')
    runway_count = data.get('runway_count', 2)
    time_of_day = data.get('time_of_day', 'afternoon')

    weather_factors = {'clear': 1.0, 'rain': 1.3, 'fog': 1.8, 'storm': 2.5, 'snow': 2.0}
    time_factors = {'morning': 1.2, 'afternoon': 1.0, 'evening': 1.4, 'night': 0.8}

    wf = weather_factors.get(weather_condition, 1.0)
    tf = time_factors.get(time_of_day, 1.0)
    peak_multiplier = 1.3 if hour in [7, 8, 9, 17, 18, 19] else 1.0

    total_operations = scheduled_takeoffs + scheduled_landings
    effective_capacity = int(60 * runway_count / (wf * tf * peak_multiplier))
    occupancy_pct = min(100, int((total_operations / max(1, effective_capacity)) * 100))
    queue_length = max(0, int((total_operations - effective_capacity * 0.8) * (wf * tf)))
    avg_wait = int(queue_length * 2.5 * wf)
    spacing = int(3 * wf * peak_multiplier)

    if occupancy_pct > 85:
        congestion = 'critical'
    elif occupancy_pct > 65:
        congestion = 'high'
    elif occupancy_pct > 40:
        congestion = 'moderate'
    else:
        congestion = 'low'

    return jsonify({
        'runway_occupancy_percentage': occupancy_pct,
        'queue_length': max(0, queue_length),
        'average_wait_minutes': avg_wait,
        'congestion_level': congestion,
        'recommended_spacing_seconds': spacing,
        'total_operations': total_operations,
        'effective_hourly_capacity': effective_capacity,
        'factors': {
            'weather': weather_condition,
            'time_of_day': time_of_day,
            'peak_hour': hour in [7, 8, 9, 17, 18, 19]
        },
        'recommendations': get_runway_recommendations(occupancy_pct, congestion, weather_condition)
    })

def get_runway_recommendations(occupancy, congestion, weather):
    recs = []
    if occupancy > 80:
        recs.append('Increase aircraft separation to reduce congestion')
    if weather in ['fog', 'storm', 'snow']:
        recs.append(f'Activate low-visibility procedures for {weather} conditions')
    if congestion in ['high', 'critical']:
        recs.append('Consider diverting incoming flights to alternate airports')
    if occupancy > 60:
        recs.append('Use rapid-exit taxiways to reduce runway occupancy time')
    recs.append('Maintain current sequencing and spacing')
    return recs
