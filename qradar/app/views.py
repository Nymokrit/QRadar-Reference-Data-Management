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
