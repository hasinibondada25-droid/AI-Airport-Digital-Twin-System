import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'ok', 'service': 'ai-service-flask'}

from routes.delay_api import delay_bp
from routes.crowd_api import crowd_bp
from routes.optimize_api import optimize_bp
from routes.scenario_api import scenario_bp

app.register_blueprint(delay_bp)
app.register_blueprint(crowd_bp)
app.register_blueprint(optimize_bp)
app.register_blueprint(scenario_bp)
