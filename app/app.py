#!/usr/bin/python3

import json
from flask import Flask, render_template, jsonify
import requests
# from app.solution import *
from solution import *
from parse import *
from clause import *

app = Flask(__name__)
solution = ""

@app.route("/")
def index():
	data = {}
	return render_template("index.html")

@app.route("/data")
def send_data():
	data = {}
	return jsonify(get_data())

# get initial clause database
def get_clauses():
	# r = requests.get(URL)
	# data = r.text
	# clause_db = parse_clauses(data)
	#Generate Database
	global solution
	c1 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2, False), clause.Literal(4, False)])
	c2 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2), clause.Literal(3, False)])
	c3 = clause.Clause().addLiterals([clause.Literal(3), clause.Literal(4, False)])
	c4 = clause.Clause().addLiterals([clause.Literal(4), clause.Literal(5), clause.Literal(6)])
	c5 = clause.Clause().addLiterals([clause.Literal(5, False), clause.Literal(7)])
	c6 = clause.Clause().addLiterals([clause.Literal(6, False), clause.Literal(7), clause.Literal(8, False)])
	original_clause_db = clause_db.Clause_db().addClauses([c1, c2, c3, c4, c5, c6])
	solution = Solution(original_clause_db)
	data = solution.run_alg()

# get num and sign of new deicision literal
def user_decision():
	r = requests.get(URL)
	data = r.text
	new_input(data)

if __name__ == "__main__":
	app.run(debug=True)
