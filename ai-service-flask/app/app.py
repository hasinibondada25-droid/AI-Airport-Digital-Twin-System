import os
import sys
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
from routes.runway_api import runway_bp
from routes.alert_api import alert_bp

app.register_blueprint(delay_bp)
app.register_blueprint(crowd_bp)
app.register_blueprint(optimize_bp)
app.register_blueprint(scenario_bp)
app.register_blueprint(runway_bp)
app.register_blueprint(alert_bp)

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
