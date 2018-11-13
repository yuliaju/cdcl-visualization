import copy
import graph
import clause
import util
import clause_db





#Generate Database
c1 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2, False), clause.Literal(4, False)])
c2 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2), clause.Literal(3, False)])
c3 = clause.Clause().addLiterals([clause.Literal(3), clause.Literal(4, False)])
c4 = clause.Clause().addLiterals([clause.Literal(4), clause.Literal(5), clause.Literal(6)])
c5 = clause.Clause().addLiterals([clause.Literal(5, False), clause.Literal(7)])
c6 = clause.Clause().addLiterals([clause.Literal(6, False), clause.Literal(7), clause.Literal(8, False)])
original_clause_db = clause_db.Clause_db().addClauses([c1, c2, c3, c4, c5, c6])



def solve_conflict(cl):
	print(cl)
	print(clause_db.getClause(cl))
	g.addNode(graph.Graph.Node(None, None, clause_db.getClause(cl), cl, True))
	newnode = g.getConflict()
	g.new_edges(newnode, clause_db.getClause(cl), None)
	print(str(g))
	recentDecision = g.recentDecision(level)
	if recentDecision == False:
		print("Problem! No recent decision")
	else:
		uips = g.uips(recentDecision)
		uip = g.uip(recentDecision)
		cuts = g.cut(uip)
		conflict_clause = clause.Clause().addLiterals(g.conflict_clause(cuts[0]))
		print("UIPs:")
		for uip in uips:
			print(str(uip))	
		print("UIP: " + str(uip))		
		print("Conflict side of cut:")
		for node in cuts[0]:
			print(str(node))
		print("Conflict Clause: " + str(conflict_clause))
		original_clause_db.addClause(conflict_clause)



#TO DO: test copying
print(str(original_clause_db))
finished = False
while not finished:
	conflict = False
	#reset clause_db, g, decided, and level
	g = graph.Graph()
	decided = []
	clause_db = copy.deepcopy(original_clause_db)
	level = 0

	while not conflict and not finished:
		conflict = False
		#Propogate: Decide any singular clauses, then repeat check one last time
		new_decide = True
		while new_decide:
			new_decide = False 
			for i in range(1, clause_db.getLen()+1):
				c = clause_db.getClause(i)
				if not c.satisfied:
					if len(c.nonExcludedLiterals()) == 1:
						# if clause not satisfied and of length one, decide that literal
						l = c.nonExcludedLiterals()[0].literal
						clause_db.decide_clauses(l)
						g.decide_graph(level, l, i, clause_db.getClause(i))
						decided.append(l)
						new_decide = True

		#are all clauses satisfied?
		if clause_db.is_finished():
			finished = True

		#is there a conflict?
		elif clause_db.is_conflict() is not False:
			conflict = True
			print("Graph: \n" + str(g))
			print("Conflict")
			solve_conflict(clause_db.is_conflict())

		#if not finished and not conflict, let user decide the next decision node
		#TO DO: can't accept decided literal!!
		else:
			ok = False
			while not ok:
				ok=True
				num = int(input("Enter the number of a node"))
				#check number:
				for d in decided:
					if d.index == num:
						print("This node has already been decided. Please pick another.")
						ok = False
				if num > clause_db.num_literals or num <= 0:
					print("No literal of this number exists. Please pick another.")
					ok = False
				if ok:
					sign = input("Enter F to negate the literal, T if not")
					#check sign
					if sign == "T":
						sign = True
					elif sign == "F":
						sign = False
					else:
						print("Not a valid sign. Please try again.")
						ok = False

			level += 1
			l = clause.Literal(num, sign)
			decided.append(l)
			clause_db.decide_clauses(l)
			g.decide_graph(level, l)
			print(str(g))

#Solution exists
print("You solved it!")
util.print_decided(decided)
exit()


