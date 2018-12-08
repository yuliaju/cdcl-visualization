from .clause import *
from .clause_db import *

# dfa_trans = {
# 	0: {'~': 0, 'p': 1, 'num': 3},
# 	1: {'~': 3, 'p': 3, 'num': 2},
# 	2: {'~': 0, 'p': 1, 'num': 3}
# }
# initial = 0
# accepting = [2]
# failing = [3]

# def dfa(c):
# 	state = initial
# 	lits = []
# 	sign = True
# 	num = None
# 	for i in c:	
# 		if i.isdigit():
# 			curr = 'num'
# 			num = i
# 		elif i == '~':
# 			sign = False
# 			curr = i
# 		else:
# 			curr = i
# 		# check if char is valid
# 		if curr in dfa_trans[state]:
# 			state = dfa_trans[state][curr]
# 		else:
# 			return False
# 		#check for rejecting state
# 		if state in failing:
# 			return False
# 		elif state in accepting:
# 			lits.append((num, sign))
# 			sign = True
# 			num = None
# 	if state in accepting:
# 		return lits


# def new_parse(data):
# 	clauses = data.split()
# 	for c in clauses:
# 		lits = []
# 		sign = True
# 		for i in c:
# 			if i = '~':
# 				sign = False
# 			elif


# 	original_clause_db = Clause_db(8).addClauses([c1, c2, c3, c4, c5, c6])
# 	return original_clause_db


def parse_clauses():
	c1 = Clause().addLiterals([Literal(1, False), Literal(2, False), Literal(4, False)])
	c2 = Clause().addLiterals([Literal(1, False), Literal(2), Literal(3, False)])
	c3 = Clause().addLiterals([Literal(3), Literal(4, False)])
	c4 = Clause().addLiterals([Literal(4), Literal(5), Literal(6)])
	c5 = Clause().addLiterals([Literal(5, False), Literal(7)])
	c6 = Clause().addLiterals([Literal(6, False), Literal(7), Literal(8, False)])
	return Clause_db(8).addClauses([c1,c2,c3,c4,c5,c6])