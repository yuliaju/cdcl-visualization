#!/usr/bin/python3

import json
from flask import Flask, render_template, jsonify, request
import requests
from .models.solution import *
from .models.parse import *
from .models.clause import *

app = Flask(__name__)
solution = ""

@app.route("/")
def index():
	return render_template("index.html")

# get initial clause database
@app.route('/clause_db', methods=['GET', 'POST'])
def clause_db():
	global solution
	data = json.loads(request.data)
	clause_db = parse_clauses(data["clauseLibrary"])
	if clause_db == False:
		return jsonify({"parser": False})
	solution = Solution(clause_db)
	return_data = solution.run_alg({})
	return_data["parser"] = True
	print(return_data)
	return jsonify(return_data)

# get num and sign of new decision literal
@app.route('/decision', methods=['POST'])
def user_decision():
	global solution
	data = json.loads(request.data)
	num = data["num"]
	sign = data["sign"]
	return_data = solution.new_input(num, sign)
	print(return_data)
	return jsonify(return_data)

if __name__ == "__main__":
	app.run(debug=True)
