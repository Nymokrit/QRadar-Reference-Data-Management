import re
import json
from flask import request, render_template, Response
from app import app
from qpylib import qpylib
import os

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

@app.route('/getToken')
def getToken():
    return json.dumps({'SEC': request.cookies.get('SEC', ''), 'QRadarCSRF': request.cookies.get('QRadarCSRF', '')})

# otherwise svgs will get sent with the wrong mimetype and not understood by chrome
@app.route('/static/media/<svgFile>.svg')
def serve_content(svgFile):
    return Response(file('/app/static/media/' + svgFile + '.svg').read(), mimetype='image/svg+xml')


@app.route('/api/<path:path>', methods=['GET', 'POST', 'DELETE', 'PUT'])
def api(path):
    # replace single encoded strings with double encoded data as QRadar needs double encoding to handle it correctly
    path = re.sub('%2(F|f)', '%252f', request.path)

    # Add the additional 'hidden-api' header and keep the Range header if it exists
    headers = dict((k, v) for k, v in request.headers.items())
    newHeaders = {}
    newHeaders['Allow-hidden'] = 'true'
    if headers.get('Range'):
        newHeaders['Range'] = headers['Range']
    response = qpylib.REST(request.method, path, params=request.args,
                           data=request.data, headers=newHeaders)
    return response.text
