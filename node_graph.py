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

	# Return list of lists of paths from node to conflict
	def rec_path(self, paths):
		#for all (possibly incomplete) paths in the array
		new_paths = []
		finished = True
		for path in paths:
			last = path[len(path)-1]
			#if path is already finished, ignore it
			if last.conflict == True:
				new_paths.append(path)
			else:
				finished = False
				for adjacent in self.edges[last]:
					new_path = path.copy()
					new_path.append(adjacent)
					new_paths.append(new_path)
		if finished:
			return new_paths
		else:
			return self.rec_path(new_paths)

	#Finds all nodes appearing in all paths to conflict from node, excluding the conflict node
	def uips(self, node):
		paths = self.rec_path([[node]])
		nodes = self.allNodes()
		for path in paths:
			nodes = [x for x in nodes if x in path and x in nodes and x.conflict == False]
		return nodes



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