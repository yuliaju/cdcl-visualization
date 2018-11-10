import copy

class Literal:
	def __init__(self, index, sign=False):
		self.index = index
		self.sign = sign

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

	def __init__(self):
		self.literals = []
		self.size = 0
		self.satisfied = False

	#number of literals in clause
	def c_size(self):
		return self.size

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

	def is_satisfied(self):
		return self.satisfied

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
					return self
				else:
					l.excluded = True
					return self

# TESTING
# c1 = Clause()
# c1.addLiterals([Literal(0, False), Literal(1, True)])
# print(c1.c_size())
# print(c1.is_satisfied())
# c1.satisfy(Literal(0, False))
# print(c1.is_satisfied())
# print(Literal(0, False) == Literal(0, True))


class Graph:
	class Node:
		def __init__(self, literal=None, level=None, clause=None, conflict=False):
			self.level = level
			self.literal = literal
			self.clause = clause
			self.conflict = True

	#initialize graph
	def __init__(self):
		self.size = 0
		self.edges = {}

	def allNodes(self):
		nodes = []
		for i in self.edges:
			nodes.append(i)
		return nodes

	#add node to graph
	def addNode(self, node):
		self.edges[node] = []
		self.size += 1
		return self

	#return node corresponding to literal, if it exists. False if not.
	def getNode(self, literal):
		for i in self.allNodes():
			if i.literal == literal:
				return i
		return False

	#add edge from node1 to node2
	def addEdge(self, node1, node2):
		self.edges[node1].append(node2)
		return self

	#Does node 1 point to node 2?
	def is_connected(self, node1, node2):
		return node2 in self.edges[node1]

	def points_to_conflict():
		nodes = []
		for i in edges:
			for j in edges[i]:
				if j.conflict:
					nodes.append(i)

#TESTING
g = Graph()
print(g.allNodes())
node1 = Graph.Node(Literal(1,True), 2)
g.addNode(node1)
print(g.allNodes())
test = g.getNode(Literal(1,True))
node2 = Graph.Node(Literal(2), 2)
g.addNode(node2)
g.addEdge(node1, node2)
print(g.is_connected(node1, node2))
print(g.is_connected(node2, node1))


original_clause_database = []
clause_database = []
unsatisfied_clauses = []

#Generate Database
num_literals = 8
c1 = Clause().addLiterals([Literal(1), Literal(2)])
c2 = Clause().addLiteral(Literal(1, False))
original_clause_database.extend((c1, c2))
clause_database = copy.deepcopy(original_clause_database)
# c1 = Clause().addLiterals([Literal(1, False), Literal(2), Literal(4, False)])
# c2 = Clause().addLiterals([Literal(1, False), Literal(2), Literal(3, False)])
# c3 = Clause().addLiterals([Literal(3, False), Literal(4, False)])


def conflict_check():
	for i in clause_database:
		if conflict(i):
			#TO DO: create conflict!
			return False

def conflict(clause):
	if not clause.satisfied and clause.nonExcludedLiterals() == 0:
		return False
	else:
		return True

def finished():
	finished = True
	for i in clause_database:
		if i.satisfied = False:
			finished = False
	return finished



#decide literal l
def decide(l, level, clause=None):
	g.addNode(Graph.Node(l, level, clause))
	for c in clause_database:
		c.satisfy(l)


#Propogate: Check for singular clauses
for c in clause_database:
	if len(c.nonExcludedLiterals()) == 1:
		l = c.nonExcludedLiterals()
		decide(l)



