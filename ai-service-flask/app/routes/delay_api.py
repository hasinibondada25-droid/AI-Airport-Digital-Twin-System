from flask import Blueprint, request, jsonify

delay_bp = Blueprint('delay', __name__)

@delay_bp.route('/predict-delay', methods=['POST'])
def predict_delay():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No input data provided'}), 400

    flight_id = data.get('flight_id', 'unknown')
    hour = data.get('hour', 12)
    weather_impact = data.get('weather_impact', 'none')
    traffic_level = data.get('traffic_level', 'medium')
    airline = data.get('airline', 'Unknown')

    weather_factor = {'none': 0, 'low': 0.1, 'medium': 0.25, 'high': 0.4}
    traffic_factor = {'low': 0, 'medium': 0.1, 'high': 0.25}
    hour_factor = 0.3 if hour >= 17 else (0.2 if hour >= 12 else 0.1)

    wf = weather_factor.get(weather_impact, 0)
    tf = traffic_factor.get(traffic_level, 0.1)

    delay_probability = min(0.95, wf + tf + hour_factor + 0.05)
    estimated_delay = int(delay_probability * 120)

    if delay_probability > 0.6:
        risk_level = 'high'
    elif delay_probability > 0.3:
        risk_level = 'medium'
    else:
        risk_level = 'low'

    return jsonify({
        'flight_id': flight_id,
        'airline': airline,
        'delay_probability': round(delay_probability, 3),
        'estimated_delay_minutes': estimated_delay,
        'risk_level': risk_level,
        'confidence': round(0.75 + 0.2 * (1 - delay_probability), 3),
        'factors': {
            'weather': weather_impact,
            'time_of_day': hour,
            'traffic': traffic_level
        }
    })
