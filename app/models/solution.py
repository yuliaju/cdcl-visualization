import copy
from .graph import *
from .clause import *
from .util import *
from .clause_db import *

class Solution:
	def __init__(self, original_clause_db):
		self.graph = Graph()
		self.finished = False
		self.conflict = False
		self.level = 0
		self.original_clause_db = original_clause_db
		self.clause_db = []
	def __str__(self):
		return ""

	


	def run_alg(self):
		data = {}
		self.conflict = False
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
			options = []
			for i in range(self.clause_db.num_literals):
				decided_indices = (l.index for l in self.g.decided)
				if i not in decided_indices:
					options.append(i)
			data["options"] = options


		#is there a conflict?
		elif self.clause_db.is_conflict() is not False:
			self.conflict = True

			cl = self.clause_db.is_conflict()

			self.g.addNode(graph.Graph.Node(None, None, self.clause_db.getClause(cl), cl, True))
			newnode = self.g.getConflict()
			self.g.new_edges(newnode, self.clause_db.getClause(cl), None)
			recentDecision = self.g.recentDecision(level)
			if recentDecision == False:
				raise Exception("Problem! No recent decision")
			uips = self.g.uips(recentDecision)
			uip = self.g.uip(recentDecision)
			cuts = self.g.cut(uip)
			conflict_clause = clause.Clause().addLiterals(g.conflict_clause(cuts[0]))
			data["conflict_info"] = {"all_uips": (str(u) for u in uips), "right_uip": uip, "conflict_clause": str(conflict_clause), "cut_conflict": (c.literal.index for c in cuts[0]), 
				"cut_other": (c.literal.index for c in cuts[1])}
			self.original_clause_db.addClause(conflict_clause)

			
		#else just need user input
		else:
			self.level += 1

		# Create data array for frontend
		data["new_nodes"] = new_nodes
		data["finished"] = self.finished
		data["level"] = copy.copy(self.level)
		data["conflict"] = copy.copy(self.conflict)
		data["edges"] = copy.copy(self.graph.edges_front(new_nodes))
		data["decided"] = copy.copy(self.graph.decided_front())

		if self.conflict:
			#TO DO: reset database and decided!!!
			# TO DO: send reset data
			# data["reset"] = {"level": , "decided": , "edges": , "nodes": }
			self.level = self.g.backtrack_level(conflict_clause)
			self.g.removeNodes(backtrack_level)

		return data
	



	def new_input(num, sign):
		l = clause.Literal(num, sign)
		self.g.decided.append(l)
		self.clause_db.decide_clauses(l)
		self.g.decide_graph(self.level, l)
		return self.run_alg()