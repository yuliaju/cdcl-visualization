import copy
from .clause import *
from .clause import *

class Graph:
	class Node:
		def __init__(self, literal=None, level=None, clause=None, clausenum=None, conflict=False):
			self.level = level
			self.literal = literal
			self.clause = clause
			self.clausenum = clausenum
			self.conflict = conflict
		def __str__(self):
			if self.conflict:
				s = "K: C" + str(self.clausenum)
			else:
				s = str(self.literal) + "@" + str(self.level)
				if self.clause is not None:
					s += ": C" + str(self.clausenum)
			return s

	#initialize graph
	def __init__(self):
		self.size = 0
		self.edges = {}
		self.decided = []

	def __str__(self):
		s = "Graph: "
		if self.size == 0:
			return "empty"
		for i in self.edges:
			s += str(i) + " : "
			for j in self.edges[i]:
				s += str(j)
				s += "; "
			s += "\n"
		s += "Decided: "
		for d in self.decided:
			s += str(d) + ", "
		s += "\n"
		return s

	#add node to graph
	def addNode(self, node):
		self.edges[node] = []
		self.size += 1
		return node

	#return node corresponding to literal, if it exists. False if not.
	def getNode(self, literal):
		for i in self.edges:
			if i.literal.index == literal.index:
				return i
		return False

	#add edge from node1 to node2
	def addEdge(self, node1, node2):
		return self.edges[node1].append(node2)

	# Update edges based on new decision
	def new_edges(self, newnode, clause, l):
		lits = clause.literals
		#for all other literals in the clause
		for m in lits:
			#no self edges
			if m.literal is not l:
				n = self.getNode(m.literal)
				if n:
					self.addEdge(n, newnode)
				else:
					raise Exception("null node")
		return self

	#update graph given literal l
	def decide_graph(self, level, l, clause_num=None, clause=None):
		newnode = self.addNode(self.Node(l, level, clause, clause_num))
		#add edges
		if clause is not None:
			self.new_edges(newnode, clause, l)
		return newnode

	# return a dictionary of edges for frontend. key: node indices, value: list of indices of connected nodes
	def new_edges_front(self, new_nodes):
		l = {}
		for v in self.edges:
			if not (v.conflict) and len(self.edges[v]) != 0:
				new = False
				if v.literal.index in new_nodes.keys():
					new = True
				temp = []
				for e in self.edges[v]:
					if new and e.conflict:
						temp.append("K")
					elif new or e.literal.index in new_nodes.keys():
						temp.append(e.literal.index)
				l[v.literal.index] = temp
		return l

	# return a list of literals with assigned values to frontend
	def decided_front(self):
		l = []
		for d in self.decided:
			l.append(str(d))
		return l

	# return a list of indices of literals without an assigned value for frontend
	def available_front(self, lits):
		l = []
		ds = [d.index for d in self.decided]
		for i in range(1, lits+1):
			if i not in ds:
				l.append(i)
		return l


	#remove all nodes above level
	def reset(self, level):
		dels = []
		#find nodes above level
		for i in self.edges:
			if i.level > level:
				dels.append(i)		
		for d in dels:
			#delete nodes from graph
			del self.edges[d]
			#remove edges pointing towards all dels
			for i in self.edges:
				if d in self.edges[i]:
					self.edges[i].remove(d)
		#update decided to include all nodes left
		self.decided = []
		for i in self.edges:
			self.decided.append(i.literal)
		return self

	# helper function computing dist_to_conflict
	def dist(self, nodes, level):
		new_nodes = []
		for node in nodes:
			if node.conflict == True:
				return level
			for adj in self.edges[node]:
				new_nodes.append(adj)
		return self.dist(new_nodes, level+1)

	#Distance from node to concflit
	def dist_to_conflict(self, node):
		return self.dist([node], 0)

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
					new_path = path[:]
					new_path.append(adjacent)
					new_paths.append(new_path)
		if finished:
			return new_paths
		else:
			return self.rec_path(new_paths)

	def path_to_set(self, paths):
		f = []
		for p in paths:
			for n in p:
				if n not in f:
					f.append(n)
		return f

	# Find closest node closest to the conflict
	def closest(self, nodes):
		closest = nodes[0]
		closest_dist = self.dist_to_conflict(nodes[0])
		for i in range(1, len(nodes)):
			if self.dist_to_conflict(nodes[i]) < closest_dist:
				closest_dist = self.dist_to_conflict(nodes[i])
				closest = nodes[i]
		return closest

	#Finds all nodes appearing in all paths to conflict from node, excluding the conflict node. Return (all_uips, closest_uip)
	def uips(self, recentDecision):
		node = recentDecision
		paths = self.rec_path([[node]])
		nodes = self.edges.keys()
		for path in paths:
			nodes = [x for x in nodes if x in path and x in nodes and x.conflict == False]
		uip = self.closest(nodes)
		return (nodes, uip)

	#given the uip, return (conflict_side, other_side, conflict_clause)
	def cut(self, uip):
		conflict_side = []
		other_side = []
		other_side_nodes = []
		all_nodes = self.edges.keys()
		con = self.rec_path([[uip]])
		con_set = self.path_to_set(con)
		for r in all_nodes:
			if r not in con_set or r is uip:
				other_side.append(r.literal.index)
				other_side_nodes.append(r)
			else:
				conflict_side.append(r.literal.index)
				
		clause = []
		for n in other_side_nodes:
			for adj in self.edges[n]:
				if adj.literal.index in conflict_side:
					l = copy.deepcopy(n.literal)
					l.sign = not l.sign
					clause.append(l)
					break

		return (conflict_side, other_side, clause)


	# Compute backtrack level after conflict
	def backtrack_level(self, conflict_clause):
		nodes = []
		# Find all nodes associated with conflict clause
		for lit in conflict_clause.literals:
			nodes.append(self.getNode(lit.literal))
		# If only one node exists, implemenet convention
		if len(nodes) == 1:
			if nodes[0].level == 0:
				return -1
			else:
				return 0

		# Find second highest level in list of nodes
		highest = max(nodes[0].level, nodes[1].level)
		highest2 = min(nodes[0].level, nodes[1].level)		
		for i in range(2,len(nodes)):
			node = nodes[i]
			if node.level >= highest:
				highest = node.level
				highest2 = highest 
			elif node.level > highest2:
				highest2 = node.level

		return highest2