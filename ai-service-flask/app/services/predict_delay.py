import numpy as np
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'delay_model.pkl')

class DelayPredictor:
    def __init__(self):
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
            except Exception:
                self.model = None

    def predict(self, features):
        if self.model is not None:
            try:
                return self.model.predict_proba([features])[0][1]
            except Exception:
                pass
        return self._heuristic_prediction(features)

    def _heuristic_prediction(self, features):
        hour = features[0] if len(features) > 0 else 12
        weather = features[1] if len(features) > 1 else 0
        traffic = features[2] if len(features) > 2 else 1

        base_risk = 0.15
        if hour >= 17:
            base_risk += 0.2
        elif hour >= 12:
            base_risk += 0.1

        base_risk += weather * 0.3
        base_risk += (traffic / 2) * 0.15

        return min(0.95, base_risk)


delay_predictor = DelayPredictor()


def predict_delay(flight_data):
    hour = flight_data.get('hour', 12)
    weather_map = {'none': 0, 'low': 0.3, 'medium': 0.6, 'high': 1.0}
    traffic_map = {'low': 0, 'medium': 1, 'high': 2}

    weather = weather_map.get(flight_data.get('weather_impact', 'none'), 0)
    traffic = traffic_map.get(flight_data.get('traffic_level', 'medium'), 1)

    features = [hour, weather, traffic]
    probability = delay_predictor.predict(features)

    return {
        'probability': round(probability, 3),
        'estimated_delay_minutes': int(probability * 120),
        'risk_level': 'high' if probability > 0.6 else ('medium' if probability > 0.3 else 'low')
    }
