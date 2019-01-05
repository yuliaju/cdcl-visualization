import copy
from .graph import *
from .clause import *
from .clause_db import *



# TO DO: WHAT ABOUT UNSAT???
class Solution:
	def __init__(self, original_clause_db):
		self.graph = Graph()
		self.finished = False
		self.conflict = False
		self.level = 0
		self.original_clause_db = original_clause_db
		self.clause_db = copy.deepcopy(original_clause_db) 


	#Propogate: Decide any singular clauses, then repeat check one last time
	def propogate(self, new_nodes):
		new_decide = True
		while new_decide:
			new_decide = False
			for i in range(1, self.clause_db.getLen()+1):
				c = self.clause_db.getClause(i)
				if not c.satisfied:
					if len(c.nonExcludedLiterals()) == 1:
						# if clause not satisfied and of length one, decide that literal
						l = c.nonExcludedLiterals()[0].literal
						self.clause_db.decide_clauses(l)
						self.graph.decide_graph(self.level, l, i, self.clause_db.getClause(i))
						self.graph.decided.append(l)
						new_nodes[l.index] = str(self.graph.getNode(l))
						new_decide = True
		return new_nodes



	def run_alg(self, new_nodes):
		data = {}
		self.conflict = False
		
		new_nodes = self.propogate(new_nodes)

		#are all clauses satisfied?
		if self.clause_db.is_finished():
			self.finished = True
			options = []
			for i in range(1, self.clause_db.num_literals):
				decided_indices = [l.index for l in self.graph.decided]
				if i not in decided_indices:
					options.append(i)
			data["options"] = options
			data["satisfied"] = False


		#is there a conflict?
		elif self.clause_db.is_conflict() is not False:
			self.conflict = True

			cl = self.clause_db.is_conflict()

			self.graph.addNode(Graph.Node(Literal("K", True), None, self.clause_db.getClause(cl), cl, True))
			newnode = self.graph.getConflict()
			self.graph.new_edges(newnode, self.clause_db.getClause(cl), None)
			recentDecision = self.graph.recentDecision(self.level)
			if recentDecision == False:
				raise Exception("Problem! No recent decision")
			uips = self.graph.uips(recentDecision)
			uip = self.graph.uip(recentDecision)
			cuts = self.graph.cut(uip)
			conflict_clause = Clause().addLiterals(self.graph.conflict_clause(cuts[0]))
			data["conflict_info"] = {"all_uips": [str(u) for u in uips], "right_uip": str(uip), "conflict_clause": 
				str(conflict_clause), "cut_conflict": [c.literal.index for c in cuts[0]], 
				"cut_other": [c.literal.index for c in cuts[1]], "conflict_label": str(self.graph.getConflict())}
			self.original_clause_db.addClause(conflict_clause)

			
		#else just need user input
		else:
			self.level += 1

		# Create data array for frontend
		data["new_nodes"] = new_nodes
		data["finished"] = self.finished
		data["level"] = copy.copy(self.level)
		data["conflict"] = copy.copy(self.conflict)
		data["edges"] = copy.copy(self.graph.new_edges_front(new_nodes))
		data["decided"] = copy.copy(self.graph.decided_front())
		data["available"] = copy.copy(self.graph.available_front(self.original_clause_db.num_literals))

		if self.conflict:
			new_nodes = {}
			#reset level, graph, and clause_db
			self.level = self.graph.backtrack_level(conflict_clause)
			if self.level == -1:
				data["finished"] = True
				data["satisfied"] = False
			self.graph.reset(self.level)
			self.clause_db = copy.deepcopy(self.original_clause_db)	
			for l in self.graph.decided:
				self.clause_db.decide_clauses(l)
				new_nodes[l.index] = str(self.graph.getNode(l))

			#load reset data
			data["reset"] = {"level": self.level, "decided": self.graph.decided_front(), "edges": 
				self.graph.all_edges_front(), "nodes": self.graph.allNodes_front(), "available": 
				self.graph.available_front(self.original_clause_db.num_literals)}

			#PROPOGATE
			# self.propogate(new_nodes)
			self.level = self.level + 1

			# data["propogate"] = {"level": self.level, "decided": self.graph.decided_front(), "edges": 
			# 	self.graph.all_edges_front(), "nodes": self.graph.allNodes_front(), "available": 
			# 	self.graph.available_front(self.original_clause_db.num_literals)}


		return data
	



	def new_input(self, num, sign):
		l = Literal(num, sign)
		self.graph.decided.append(l)
		self.clause_db.decide_clauses(l)
		self.graph.decide_graph(self.level, l)
		return self.run_alg({num:str(self.graph.getNode(l))})


