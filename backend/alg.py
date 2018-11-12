import copy
import graph
import clause
import util


original_clause_database = []
clause_database = []
unsatisfied_clauses = []
g = graph.Graph()

#Generate Database
num_literals = 8
c1 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2, False), clause.Literal(4, False)])
c2 = clause.Clause().addLiterals([clause.Literal(1, False), clause.Literal(2), clause.Literal(3, False)])
c3 = clause.Clause().addLiterals([clause.Literal(3), clause.Literal(4, False)])
c4 = clause.Clause().addLiterals([clause.Literal(4), clause.Literal(5), clause.Literal(6)])
c5 = clause.Clause().addLiterals([clause.Literal(5, False), clause.Literal(7)])
c6 = clause.Clause().addLiterals([clause.Literal(6, False), clause.Literal(7), clause.Literal(8, False)])
original_clause_database.extend((c1, c2, c3, c4, c5, c6))
clause_database = copy.deepcopy(original_clause_database)
level = 0

# Update edges based on new decision
def edges(newnode, clause, l):
	lits = clause_database[clause-1].literals
	#for all other literals in the clause
	for m in lits:
		#no self edges
		if m.literal is not l:
			n = g.getNode(m.literal)
			if n:
				g.addEdge(n, newnode)
			else:
				print("problem")

#decide literal l
def decide(level, l, clause=None):
	g.addNode(graph.Graph.Node(l, level, clause))
	newnode = g.getNode(l)
	#add edges
	if clause is not None:
		edges(newnode, clause, l)	
	#find literal in all clauses and satisfy or excluded each instance
	for c in clause_database:
		c.satisfy(l)

#if conflict, return clause number. Else return False
def conflict():
	for i in range(len(clause_database)):
		c = clause_database[i]
		if (not c.satisfied) and (len(c.nonExcludedLiterals()) == 0):
			return i + 1
	return False

def solve_conflict(clause):
	util.print_database(clause_database)
	g.addNode(graph.Graph.Node(None, None, clause, True))
	newnode = g.getConflict()
	edges(newnode, clause, None)
	recentDecision = g.recentDecision(level)
	print(level)
	print(g.recentDecision(level))
	if recentDecision == False:
		print("Problem! No recent decision")
	else:
		uips = g.uips(recentDecision)
		print("UIPs:")
		for uip in uips:
			print(str(uip))
		uip = g.uip(recentDecision)
		print("UIP: " + str(uip))

#return true if all clauses in database are satisfied, false if not
def finished():
	finished = True
	for i in clause_database:
		if not i.satisfied:
			finished = False
	return finished


util.print_database(clause_database)
while not finished():
	#TO DO: add conflict, restart graph and clauses
	decided = []
	while not conflict():
		#Propogate: Decide any singular clauses, then repeat check one last time
		new_decide = True
		while new_decide:
			new_decide = False 
			for i in range(len(clause_database)):
				c = clause_database[i]
				if not c.satisfied:
					if len(c.nonExcludedLiterals()) == 1:
						l = c.nonExcludedLiterals()
						decide(level, l[0].literal, i+1)
						decided.append(l[0].literal)
						new_decide = True

		#is there a conflict?
		a = conflict()
		if a is not False:
			print("Conflict")
			solve_conflict(a);
			print(str(g))
			exit(0);

		#are all clauses satisfied?
		if finished():
			break;

		util.print_database(clause_database)
		#if nothing left to do, let user decide the next node
		num = int(input("Enter the number of a node"))
		sign = input("Enter F to negate the literal, T if not")
		if sign == "T":
			sign = True
		else:
			sign = False
		level += 1
		l = clause.Literal(num, sign)
		decided.append(l)
		decide(level, l)

#Solution exists
print("You solved it!")
util.print_decided(decided)
exit()


