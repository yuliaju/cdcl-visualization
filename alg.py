import copy

class Literal:
	def __init__(self, index, sign=True):
		self.index = index
		self.sign = sign

	def __str__(self):
		s = ""
		if not self.sign:
			s += "neg "
		return s + str(self.index)

	def __eq__(self, other):
		if self.index == other.index and self.sign==other.sign:
			return True
		else:
			return False

class Clause:
	#literal within a clause
	class ClauseLiteral:
		def __init__(self, literal):
			self.literal = literal
			self.satisfied = False
			self.excluded = False

		def __str__(self):
			s = "cl: " + str(self.literal)
			if self.satisfied:
				s += " sat"
			if self.excluded:
				s += " ex"
			return s

	def __init__(self):
		self.literals = []
		self.size = 0
		self.satisfied = False

	#number of literals in clause
	def __iter__(self):
		return self

	def __str__(self):
		s = ""
		for i in self.literals:
			s += str(i)
			s += (" or ")
		s = s[0:len(s)-4]
		if self.satisfied:
			s += " SAT!!"
		return s


	#add literal to clause
	def addLiteral(self, literal):
		l = Clause.ClauseLiteral(literal)
		self.literals.append(l)
		self.size += 1
		return self

	def addLiterals(self, literals):
		for i in literals:
			l = Clause.ClauseLiteral(i)
			self.literals.append(l)
			self.size += 1
		return self

	#return all literals in the clause that have not been excluded
	def nonExcludedLiterals(self):
		ls = []
		for l in self.literals:
			if l.excluded == False:
				ls.append(l)
		return ls

	#satisfy literal in clause if it exists
	def satisfy(self, literal):
		for l in self.nonExcludedLiterals():
			if l.literal.index == literal.index:
				if l.literal.sign == literal.sign:
					l.satisfied = True
					self.satisfied = True
				else:
					l.excluded = True
		return self

# TESTING
# c1 = Clause()
# c1.addLiterals([Literal(0, False), Literal(1, True)])
# print(c1.size)
# print(c1.satisfied)
# c1.satisfy(Literal(0, False))
# print(c1.satisfied)
# print(Literal(0, False) == Literal(0, True))


class Graph:
	class Node:
		def __init__(self, literal=None, level=None, clause=None, conflict=False):
			self.level = level
			self.literal = literal
			self.clause = clause
			self.conflict = conflict
		def __str__(self):
			if self.conflict:
				s = "K: C" + str(self.clause)
			else:
				s = str(self.literal) + "@" + str(self.level)
				if self.clause is not None:
					s += ": C" + str(self.clause)
			return s
		# def __eq__(self, other):
		# 	if self.conflict == True:
		# 		return other.conflict
		# 	if other.conflict == True:
		# 		return self.conflict
		# 	return self.literal == other.literal

	#initialize graph
	def __init__(self):
		self.size = 0
		self.edges = {}

	def __str__(self):
		s = ""
		if self.size == 0:
			return "empty"
		for i in self.edges:
			s += str(i) + " : "
			for j in self.edges[i]:
				s += str(j)
				s += "; "
			s += "\n"
		return s

	#add node to graph
	def addNode(self, node):
		self.edges[node] = []
		self.size += 1
		return self

	def allNodes(self):
		nodes = []
		for i in self.edges:
			nodes.append(i)
		return nodes

	#return node corresponding to literal, if it exists. False if not.
	def getNode(self, literal):
		for i in self.allNodes():
			if i.literal.index == literal.index:
				return i
		return False

	def getConflict(self):
		for i in self.allNodes():
			if i.conflict:
				return i
		return False

	def recentDecision(self, level):
		for i in self.allNodes():
			if i.level == level and i.clause is None:
				return i
		return False

	#add edge from node1 to node2
	def addEdge(self, node1, node2):
		return self.edges[node1].append(node2)

	#Does node 1 point to node 2?
	def is_connected(self, node1, node2):
		return node2 in self.edges[node1]

	def paths_to_conflict(self, node):
		paths = []
		for i in edges[node]:
			paths.append(rec_path([i]))

	def rec_path(self, path):
		curr = path[len(path)-1]
		for i in edges[curr]:
			if i.conflict == True:
				return path
			rec_path(path.append(i))

#TESTING
# g = Graph()
# print(g.allNodes())
# node1 = Graph.Node(Literal(1,True), 2)
# g.addNode(node1)
# print(g.allNodes())
# test = g.getNode(Literal(1,True))
# node2 = Graph.Node(Literal(2), 2)
# g.addNode(node2)
# g.addEdge(node1, node2)
# print(g.is_connected(node1, node2))
# print(g.is_connected(node2, node1))


original_clause_database = []
clause_database = []
unsatisfied_clauses = []
g = Graph()

#Generate Database
num_literals = 8
c1 = Clause().addLiterals([Literal(1, False), Literal(2, False), Literal(4, False)])
c2 = Clause().addLiterals([Literal(1, False), Literal(2), Literal(3, False)])
c3 = Clause().addLiterals([Literal(3), Literal(4, False)])
c4 = Clause().addLiterals([Literal(4), Literal(5), Literal(6)])
c5 = Clause().addLiterals([Literal(5, False), Literal(7)])
c6 = Clause().addLiterals([Literal(6, False), Literal(7), Literal(8, False)])
original_clause_database.extend((c1, c2, c3, c4, c5, c6))
clause_database = copy.deepcopy(original_clause_database)
level = 0


def print_database():
	print("Clause Database:")
	for c in clause_database:
		print(str(c))

def print_decided():
	print("Solution:")
	for i in decided:
		print(str(i))

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

#if conflict, return clause number. Else return False
def conflict():
	for i in range(len(clause_database)):
		c = clause_database[i]
		if (not c.satisfied) and (len(c.nonExcludedLiterals()) == 0):
			return i + 1
	return False

def solve_conflict(clause):
	print_database()
	g.addNode(Graph.Node(None, None, clause, True))
	newnode = g.getConflict()
	edges(newnode, clause, None)
	print(level)
	print(g.recentDecision(level))

def finished():
	finished = True
	for i in clause_database:
		if not i.satisfied:
			finished = False
	return finished




#decide literal l
def decide(level, l, clause=None):
	g.addNode(Graph.Node(l, level, clause))
	newnode = g.getNode(l)
	#add edges
	if clause is not None:
		edges(newnode, clause, l)	
	#find literal in all clauses and satisfy or excluded each instance
	for c in clause_database:
		c.satisfy(l)


print_database()
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
		if finished():
			break;

		print_database()
		print(str(g))
		#if nothing left to do, let user decide the next node
		num = int(input("Enter the number of a node"))
		sign = input("Enter F to negate the literal, T if not")
		if sign == "T":
			sign = True
		else:
			sign = False
		level += 1
		l = Literal(num, sign)
		decided.append(l)
		decide(level, l)

#Solution exists
print("You solved it!")
print_decided()
exit()


