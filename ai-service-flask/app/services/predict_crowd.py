import numpy as np
import joblib
import os

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'models', 'crowd_model.pkl')

class CrowdPredictor:
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
                return self.model.predict([features])[0]
            except Exception:
                pass
        return self._heuristic_prediction(features)

    def _heuristic_prediction(self, features):
        hour = features[0] if len(features) > 0 else 12
        flights = features[1] if len(features) > 1 else 10
        day = features[2] if len(features) > 2 else 1

        base = 100 + flights * 15
        hour_mul = 1.5 if hour >= 17 else (1.3 if hour >= 12 else 1.0)
        day_mul = 1.2 if day >= 6 else 1.0

        return int(base * hour_mul * day_mul)


crowd_predictor = CrowdPredictor()


def predict_crowd(data):
    hour = data.get('hour', 12)
    flights = data.get('flights_count', 10)
    day = data.get('day_of_week', 1)

    features = [hour, flights, day]
    crowd_level = crowd_predictor.predict(features)

    return {
        'crowd_level': crowd_level,
        'congestion_percentage': min(100, int((crowd_level / 500) * 100)),
        'wait_time_minutes': int(crowd_level / 20) + 5,
        'bottleneck_probability': round(0.8 if crowd_level > 350 else (0.4 if crowd_level > 200 else 0.1), 2)
    }
