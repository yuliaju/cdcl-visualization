from .clause import *
from .clause_db import *

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




def parse_clauses(data):
	clauses = data.split("\n")
	to_db = []
	for c in clauses:
		curr = dfa(c)
		if not curr:
			return False
		to_db.append(Clause().addLiterals(curr))
	for p in props:
		if p > len(props) or p < 1:
			print("loop false")
			print(p)
			return False
	return Clause_db(len(props)).addClauses(to_db)


# def parse_clauses(c):
# 	c1 = Clause().addLiterals([Literal(1, False), Literal(2, False), Literal(4, False)])
# 	c2 = Clause().addLiterals([Literal(1, False), Literal(2, True), Literal(3, False)])
# 	c3 = Clause().addLiterals([Literal(3, True), Literal(4, False)])
# 	c4 = Clause().addLiterals([Literal(4, True), Literal(5, True), Literal(6, True)])
# 	c5 = Clause().addLiterals([Literal(5, False), Literal(7, True)])
# 	c6 = Clause().addLiterals([Literal(6, False), Literal(7, True), Literal(8, False)])
# 	return Clause_db(8).addClauses([c1,c2,c3,c4,c5,c6])