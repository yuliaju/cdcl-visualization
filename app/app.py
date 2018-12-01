#!/usr/bin/python3

import json
from flask import Flask, render_template, jsonify
import requests
from .models.solution import *
from .models.parse import *
from .models.clause import *

app = Flask(__name__)
solution = ""

@app.route("/")
def index():
	data = {}
	return render_template("index.html")

# @app.route("/data")
# def send_data():
# 	data = {}
# 	return jsonify(get_data())

# get initial clause database
@app.route('/clause_db', methods=['POST'])
def clause_db():
	data = request.form['clauseLibrary']
	clause_db = parse_clauses(data)
	solution = Solution(clause_db)
	return_data = solution.run_alg()

# get num and sign of new deicision literal
def user_decision():
	r = requests.get(URL)
	data = r.text
	new_input(data)

if __name__ == "__main__":
	app.run(debug=True)
