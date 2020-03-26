from flask import Flask, send_from_directory

app = Flask(__name__)


@app.route('/debug')
def debug(): return 'alive'


@app.route('/')
@app.route('/index')
def index(): return send_from_directory('static', 'index.html')
