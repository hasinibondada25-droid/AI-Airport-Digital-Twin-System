import pandas as pd
import numpy as np


def create_flight_features(data):
    features = {}

    if isinstance(data, dict):
        hour = data.get('hour', 12)
        features['hour_sin'] = np.sin(2 * np.pi * hour / 24)
        features['hour_cos'] = np.cos(2 * np.pi * hour / 24)
        features['is_peak_hour'] = 1 if 17 <= hour <= 20 or 7 <= hour <= 10 else 0
        features['is_off_hour'] = 1 if 0 <= hour <= 5 else 0

        weather_map = {'none': 0, 'low': 1, 'medium': 2, 'high': 3}
        weather_val = weather_map.get(data.get('weather_impact', 'none'), 0)
        features['weather_severity'] = weather_val
        features['has_weather_impact'] = 1 if weather_val > 0 else 0

        traffic_map = {'low': 0, 'medium': 1, 'high': 2}
        features['traffic_density'] = traffic_map.get(data.get('traffic_level', 'medium'), 1)

        features['delay_history'] = data.get('delay_history', 0)
        features['num_connecting'] = data.get('num_connecting_flights', 0)

    return features


def create_crowd_features(data):
    features = {}

    if isinstance(data, dict):
        hour = data.get('hour', 12)
        features['hour_sin'] = np.sin(2 * np.pi * hour / 24)
        features['hour_cos'] = np.cos(2 * np.pi * hour / 24)

        day = data.get('day_of_week', 1)
        features['is_weekend'] = 1 if day >= 6 else 0
        features['day_sin'] = np.sin(2 * np.pi * day / 7)
        features['day_cos'] = np.cos(2 * np.pi * day / 7)

        features['flight_density'] = data.get('flights_count', 10) / 50
        features['terminal_utilization'] = data.get('terminal_capacity', 1000) / 2000

    return features


def combine_features(flight_features, gate_features):
    combined = {}
    combined.update(flight_features)
    combined.update(gate_features)
    return combined
