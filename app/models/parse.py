from .clause import *
from .clause_db import *
def parse_clauses(data):
	c1 = Clause().addLiterals([Literal(1, False), Literal(2, False), Literal(4, False)])
	c2 = Clause().addLiterals([Literal(1, False), Literal(2), Literal(3, False)])
	c3 = Clause().addLiterals([Literal(3), Literal(4, False)])
	c4 = Clause().addLiterals([Literal(4), Literal(5), Literal(6)])
	c5 = Clause().addLiterals([Literal(5, False), Literal(7)])
	c6 = Clause().addLiterals([Literal(6, False), Literal(7), Literal(8, False)])
	original_clause_db = Clause_db(8).addClauses([c1, c2, c3, c4, c5, c6])
	return original_clause_db
