import copy
from .models.graph import *
from .clause import *
from .util import *
from .clause_db import *

class Solution:
	def __init__(self, original_clause_db):
		self.graph = graph.Graph()
		self.finished = False
		self.conflict = False
		self.level = 0
		self.original_clause_db = original_clause_db
		self.clause_db = []
	def __str__(self):
		return ""

	def solve_conflict(cl):
		print(cl)
		print(self.clause_db.getClause(cl))
		self.g.addNode(graph.Graph.Node(None, None, self.clause_db.getClause(cl), cl, True))
		newnode = self.g.getConflict()
		self.g.new_edges(newnode, self.clause_db.getClause(cl), None)
		print(str(g))
		recentDecision = self.g.recentDecision(level)
		if recentDecision == False:
			print("Problem! No recent decision")
		else:
			uips = self.g.uips(recentDecision)
			uip = self.g.uip(recentDecision)
			# cuts[0] is conflict side, cuts[1] is other side
			cuts = self.g.cut(uip)
			conflict_clause = clause.Clause().addLiterals(g.conflict_clause(cuts[0]))
			# print(str(conflict_clause))
			# print(type(conflict_clause))
			backtrack_level = self.g.backtrack_level(conflict_clause)
			print("UIPs:")
			for uip in uips:
				print(str(uip))
			print("UIP: " + str(uip))
			print("Conflict side of cut:")
			for node in cuts[0]:
				print(str(node))
			print("Conflict Clause: " + str(conflict_clause))
			print("Backtrack Level: " + str(backtrack_level))
			self.original_clause_db.addClause(conflict_clause)
			self.g.removeNodes(backtrack_level)
			# return g


	def run_alg():
		# only first time

		data = {}
		while not self.finished:

			#reset clause_db, g, decided, and level
			self.conflict = False
			self.clause_db = copy.deepcopy(self.original_clause_db)
			self.level = 0

			print(str(original_clause_db))
			print(str(g))
			while not self.conflict and not self.finished:
				conflict = False
				#Propogate: Decide any singular clauses, then repeat check one last time
				new_decide = True
				new_nodes = {}
				while new_decide:
					new_decide = False
					for i in range(1, self.clause_db.getLen()+1):
						c = self.clause_db.getClause(i)
						if not c.satisfied:
							if len(c.nonExcludedLiterals()) == 1:
								# if clause not satisfied and of length one, decide that literal
								l = c.nonExcludedLiterals()[0].literal
								self.clause_db.decide_clauses(l)
								self.g.decide_graph(self.level, l, i, self.clause_db.getClause(i))
								label = self.g.decided.append(l)
								new_nodes[l.index] = label
								new_decide = True


				#are all clauses satisfied?
				if self.clause_db.is_finished():
					self.finished = True


				#is there a conflict?
				elif self.clause_db.is_conflict() is not False:
					self.conflict = True
					print("Graph: \n" + str(self.g))
					print("Conflict")
					self.solve_conflict(self.clause_db.is_conflict())

				data["new_nodes"] = new_nodes
				data["finished"] = self.finished
				data["graph"] = self.g
				data["conflict"] = self.conflict
				data["edges"] = self.g.edges_front()
				data["decided"] = self.g.decided_front()
				return data


	def new_input(data):
		num = data["num"]
		sign = data["sign"]
		self.level += 1
		l = clause.Literal(num, sign)
		self.g.decided.append(l)
		self.clause_db.decide_clauses(l)
		self.g.decide_graph(self.level, l)
		print(str(g))
		return self.run_alg()


				#if not finished and not conflict, let user decide the next decision node
				# else:
				# 	ok = False
				# 	while not ok:
				# 		ok=True
				# 		num = input("Enter the number of a node")
				# 		#check number:
				# 		try:
				# 			num = int(num)
				# 			if num > clause_db.num_literals or num <= 0:
				# 				print("No literal of this number exists. Please pick another.")
				# 				ok = False
				# 			for d in g.decided:
				# 				if d.index == num:
				# 					print("This node has already been decided. Please pick another.")
				# 					ok = False
				# 		except ValueError:
				# 			print("Please enter a number")
				# 			ok = False
				# 		if ok:
				# 			sign = input("Enter F to negate the literal, T if not")
				# 			#check sign
				# 			if sign == "T":
				# 				sign = True
				# 			elif sign == "F":
				# 				sign = False
				# 			else:
				# 				print("Not a valid sign. Please try again.")
				# 				ok = False
