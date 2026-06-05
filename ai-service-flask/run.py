import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from main import app

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5001))
    debug = os.getenv('DEBUG', 'true').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
