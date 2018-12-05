#!/usr/bin/python3

import json
import sys
from flask import Flask, render_template, jsonify
import requests
from .models.solution import *
from .models.parse import *
from .models.clause import *

app = Flask(__name__)
solution = ""

@app.route("/")
def index():
	print("here2")
	return render_template("index.html")

# get initial clause database
@app.route('/clause_db', methods=['POST'])
def clause_db():
	global solution
	print("here3")
	data = request.form['clauseLibrary']
	clause_db = parse_clauses(data)
	solution = Solution(clause_db)
	return_data = solution.run_alg()
	return jsonify(return_data)

# get num and sign of new decision literal
@app.route('/decision', methods=['POST'])
def user_decision():
	global solution
	num = request.form["num"]
	sign = request.form["sign"]
	return_data = solution.new_input(num, sign)
	return jsonify(return_data)

if __name__ == "__main__":
	app.run(debug=True)
