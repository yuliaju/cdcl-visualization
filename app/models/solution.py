import copy
from .graph import *
from .clause import *
from .clause_db import *



class Solution:
	def __init__(self, original_clause_db):
		self.graph = Graph()
		self.new_nodes = {}
		self.finished = False
		self.conflict = False
		self.level = 0
		self.original_clause_db = original_clause_db
		self.clause_db = copy.deepcopy(original_clause_db) 


	#Propogate: Decide any singular clauses. Return false if conflict
	def propogate(self):
		new_decide = True
		#if new_decide, graph might have unit clause
		while new_decide:
			new_decide = False
			#iterate through clauses
			for i in range(1, self.clause_db.getLen()+1):
				c = self.clause_db.getClause(i)
				if not c.satisfied:
					#if unit clause, decide that literal
					if len(c.nonExcludedLiterals()) == 1:
						l = c.nonExcludedLiterals()[0].literal
						self.clause_db.decide_clauses(l)
						self.graph.decide_graph(self.level, l, i, self.clause_db.getClause(i))
						self.graph.decided.append(l)
						self.new_nodes[l.index] = str(self.graph.getNode(l))
						new_decide = True
						#is there a conflict?
						if self.clause_db.is_conflict() is not False:
							self.conflict = True
							return False
		return True

	def analyze_conflict(self):
		c_data = {}
		#get conflict clause number
		cl = self.clause_db.is_conflict()
		#add conflict node to graph
		self.graph.addNode(Graph.Node(Literal("K", True), None, self.clause_db.getClause(cl), cl, True))
		conflictnode = self.graph.getConflict()
		#update edges
		self.graph.new_edges(conflictnode, self.clause_db.getClause(cl), None)
		#get node with most recent decision
		recentDecision = self.graph.recentDecision(self.level)
		#Find uips, cut, and conflict clause
		uips = self.graph.uips(recentDecision)
		uip = self.graph.uip(recentDecision)
		cuts = self.graph.cut(uip)
		conflict_clause = Clause().addLiterals(self.graph.conflict_clause(cuts[0]))
		state_data = self.state_data({})
		c_data = { "all_uips": [str(u) for u in uips], "right_uip": str(uip), "conflict_clause": 
			str(conflict_clause), "cut_conflict": [c.literal.index for c in cuts[0]], 
			"cut_other": [c.literal.index for c in cuts[1]], "conflict_label": str(self.graph.getConflict())}
		#add conflict clause to database
		self.original_clause_db.addClause(conflict_clause)
		reset_level = self.graph.backtrack_level(conflict_clause)
		c_data.update(state_data)
		return (c_data, reset_level, conflict_clause)


	#send front_end new data
	def main_data(self, data, num_conflicts):
		if num_conflicts == 0:
			num_conflicts = False
		data["finished"] = self.finished
		data["conflict"] = num_conflicts
		data["available"] = copy.copy(self.graph.available_front(self.original_clause_db.num_literals))
		return self.state_data(data)

	def state_data(self, data):
		data["new_nodes"] = copy.copy(self.new_nodes)
		data["level"] = copy.copy(self.level)
		data["edges"] = copy.copy(self.graph.new_edges_front(self.new_nodes))
		data["decided"] = copy.copy(self.graph.decided_front())
		data["all_clauses"] = copy.copy(self.clause_db.array_of())
		data["clause_sat"] = copy.copy(self.clause_db.array_sat())
		return data

	#clauses are satisfied, send frontend info
	def satisfied(self, data):
		self.finished = True
		options = []
		decided_indices = [l.index for l in self.graph.decided]
		for i in range(1, self.clause_db.num_literals):	
			if i not in decided_indices:
				options.append(i)
		data["options"] = options
		data["satisfied"] = True
		data["finished"] = True
		data["decided"] = copy.copy(self.graph.decided_front())
		return data

	#propogate. If conflict reached, db is unsat. else continue
	def start_alg(self):
		data = {}
		#propogate
		state = self.propogate()
		#If conflict, db is not satisfiable
		if self.conflict:
			data["finished"] = True
			data["satisfied"] = False
			return data
		else:
			return self.run_alg(data, False)


	def run_alg(self, data, num_conflicts):
		#while all clauses are not satisfied
		while not self.clause_db.is_finished():
			#send frontend data, ask for user decision
			data = self.main_data(data, num_conflicts)
			self.level += 1
			return data	
		return self.satisfied(data)



	#receive user input and continue algorithm
	def new_input(self, num, sign):
		data = {}
		l = Literal(num, sign)
		self.graph.decided.append(l)
		self.clause_db.decide_clauses(l)
		self.graph.decide_graph(self.level, l)
		self.new_nodes = {}
		self.new_nodes[num] = str(self.graph.getNode(l))
		
		num_conflicts = 0
		data["conflict_info"] = []
		data["reset"] = []
		data["propogation"] = []
		#while propogating creates a conflict
		while not self.propogate():
			num_conflicts += 1
			#save current propogated state for frontend before resolving conflict
			if num_conflicts > 1:
				data["propogation"].append(self.state_data({}))
			(c_data, reset_level, conflict_clause) = self.analyze_conflict()
			data["conflict_info"].append(c_data)
			#clause db is unsat
			if reset_level < 0:
				data["finished"] = True
				data["satisfied"] = False
				return data
			#reset graph and db
			else:
				self.level = reset_level
				self.graph.reset(self.level)
				self.clause_db = copy.deepcopy(self.original_clause_db)
				self.new_nodes = {}
				for l in self.graph.decided:
					self.clause_db.decide_clauses(l)
					self.new_nodes[l.index] = str(self.graph.getNode(l))
				#add reset data
				data["reset"].append(self.state_data({}))
				# data["reset"].append({"level": self.level, "decided": self.graph.decided_front(), "edges": 
				# 	self.graph.all_edges_front(), "nodes": self.graph.allNodes_front(), "available": 
				# 	self.graph.available_front(self.original_clause_db.num_literals)})
				self.new_nodes = {}

		return self.run_alg(data, num_conflicts)


