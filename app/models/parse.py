from .clause import *
from .clause_db import *
def parse_clauses(data):
	c1 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2, False), clause.Literal(4, False)])
	c2 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2), clause.Literal(3, False)])
	c3 = clause.Clause().addLiterals([clause.Literal(3), clause.Literal(4, False)])
	c4 = clause.Clause().addLiterals([clause.Literal(4), clause.Literal(5), clause.Literal(6)])
	c5 = clause.Clause().addLiterals([clause.Literal(5, False), clause.Literal(7)])
	c6 = clause.Clause().addLiterals([clause.Literal(6, False), clause.Literal(7), clause.Literal(8, False)])
	original_clause_db = clause_db.Clause_db(6, 8).addClauses([c1, c2, c3, c4, c5, c6])
	return original_clause_db
