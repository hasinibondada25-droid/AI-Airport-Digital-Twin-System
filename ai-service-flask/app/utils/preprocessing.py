import pandas as pd
import numpy as np


def preprocess_flight_data(data):
    features = {}

    if isinstance(data, dict):
        hour = data.get('hour')
        if hour is None:
            dep = data.get('scheduled_departure')
            if dep:
                try:
                    hour = pd.to_datetime(dep).hour
                except Exception:
                    hour = 12
            else:
                hour = 12

        weather_map = {'none': 0, 'low': 0.3, 'medium': 0.6, 'high': 1.0}
        traffic_map = {'low': 0, 'medium': 1, 'high': 2}

        features['hour'] = hour
        features['weather'] = weather_map.get(data.get('weather_impact', 'none'), 0)
        features['traffic'] = traffic_map.get(data.get('traffic_level', 'medium'), 1)
        features['num_flights'] = data.get('num_flights', 10)

    return features


def preprocess_crowd_data(data):
    features = {}

    if isinstance(data, dict):
        features['hour'] = data.get('hour', 12)
        features['flights_count'] = data.get('flights_count', 10)
        features['day_of_week'] = data.get('day_of_week', 1)
        features['terminal_capacity'] = data.get('terminal_capacity', 1000)

    return features


def normalize_features(features, means=None, stds=None):
    default_means = {'hour': 12, 'weather': 0.3, 'traffic': 1, 'flights_count': 15, 'day_of_week': 3}
    default_stds = {'hour': 6, 'weather': 0.4, 'traffic': 0.8, 'flights_count': 10, 'day_of_week': 2}

    normalized = {}
    for key, value in features.items():
        m = means.get(key, default_means.get(key, 0)) if means else default_means.get(key, 0)
        s = stds.get(key, default_stds.get(key, 1)) if stds else default_stds.get(key, 1)
        normalized[key] = (value - m) / s if s != 0 else 0

    return normalized
