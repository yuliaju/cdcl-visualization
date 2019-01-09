from .clause import *
from .clause_db import *

# A dfa to process parsing of propositional logic given by user
dfa_trans = {
	0: {'~': 0, 'p': 1, 'num': 3, " ": 0},
	1: {'~': 3, 'p': 3, 'num': 2},
	2: {'~': 3, 'p': 3, 'num': 3, " ": 2, "o":4},
	4: {'r':0}
}
initial = 0
accepting = [2]
failing = [3]

props = []

# Process a single clause using the dfa
def dfa(c):
	state = initial
	lits = []
	sign = True
	num = None
	for i in c:	
		if i.isdigit():
			if int(i) not in props:
				props.append(int(i))
			curr = 'num'
			num = i
		elif i == '~':
			sign = False
			curr = i
		else:
			curr = i
		# check if char is valid
		if curr in dfa_trans[state]:
			state = dfa_trans[state][curr]
		else:
			return False
		#check for rejecting state
		if state in failing:
			return False
		elif state in accepting and num != None:
			lits.append(Literal(int(num), sign))
			sign = True
			num = None
	if state in accepting:
		return lits


# Parse clause database given by user, return database. Return False if error in parsing 
def parse_clauses(data):
	global props
	props = []
	clauses = data.split("\n")
	to_db = []
	for c in clauses:
		curr = dfa(c)
		if not curr:
			return False
		to_db.append(Clause().addLiterals(curr))
	for p in props:
		if p > len(props) or p < 1:
			return False
	return Clause_db(len(props)).addClauses(to_db)
