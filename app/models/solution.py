import copy
from .graph import *
from .clause import *
from .clause_db import *



class Solution:
	def __init__(self, original_clause_db):
		self.graph = Graph()
		self.new_nodes = {}
		self.finished = False
		self.satisfied = False
		self.conflict = 0
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
							self.conflict += 1
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
		state_data = self.state_data()
		c_data = { "all_uips": [str(u) for u in uips], "right_uip": str(uip), "conflict_clause": 
			str(conflict_clause), "cut_conflict": [c.literal.index for c in cuts[0]], 
			"cut_other": [c.literal.index for c in cuts[1]], "conflict_label": str(self.graph.getConflict())}
		#add conflict clause to database
		self.original_clause_db.addClause(conflict_clause)
		reset_level = self.graph.backtrack_level(conflict_clause)
		c_data.update(state_data)
		return (c_data, reset_level, conflict_clause)


	#main data for frontend
	def main_data(self, data={}):
		data["finished"] = self.finished
		data["satisfied"] = self.satisfied
		data["conflict"] = self.conflict
		data["available"] = copy.copy(self.graph.available_front(self.original_clause_db.num_literals))		
		return data

	#state data for frontend: info about clause db, graph, and level
	def state_data(self, s_data={}):
		# s_data = {}
		s_data["new_nodes"] = copy.copy(self.new_nodes)
		s_data["level"] = copy.copy(self.level)
		s_data["edges"] = copy.copy(self.graph.new_edges_front(self.new_nodes))
		s_data["decided"] = copy.copy(self.graph.decided_front())
		s_data["all_clauses"] = copy.copy(self.clause_db.array_of())
		s_data["clause_sat"] = copy.copy(self.clause_db.array_sat())
		# data["state"] = s_data
		return s_data

	def pre_prop(self):
		data = {}
		p_data = {}
		p_data["pre_prop_nodes"] = copy.copy(self.new_nodes)
		p_data["pre_prop_edges"] = copy.copy(self.graph.new_edges_front(self.new_nodes))
		p_data["pre_prop_clause_sat"] = copy.copy(self.clause_db.array_sat())
		p_data["pre_prop_all_clauses"] = copy.copy(self.clause_db.array_of())
		data["pre_prop_state"] = p_data
		return data


	#First run only: Propogate. If conflict reached, db is unsat. Else continue algorithm
	def start_alg(self):
		if not self.propogate:
			self.finished = True
			self.satisfied = False
			return self.state_data(self.main_data())
		else:
			return self.run_alg()


	def run_alg(self, data={}):
		#while all clauses are not satisfied, send frontend current state and ask for user decision
		while not self.clause_db.is_satisfied():
			# If conflict is false, send state data
			if self.conflict < 1:
				data = self.state_data(data)
			data = self.main_data(data)
			self.level += 1
			return data
		#Satisfiable solution is found. Send frontend solution
		self.finished = True
		self.satisfied = True
		return self.main_data(data)



	#Upon receivung user input, continue algorithm
	def new_input(self, num, sign):
		data = {}
		l = Literal(num, sign)
		self.graph.decided.append(l)
		self.clause_db.decide_clauses(l)
		self.graph.decide_graph(self.level, l)
		self.new_nodes = {}
		self.new_nodes[num] = str(self.graph.getNode(l))
		
		data["conflict_info"] = []
		data["reset"] = []
		#while propogating creates a conflict, handle the conflict
		while not self.propogate():
			#compute conflict data and save for frontend
			(c_data, reset_level, conflict_clause) = self.analyze_conflict()
			data["conflict_info"].append(c_data)
			#clause db is unsat
			if reset_level < 0:
				self.finished = True
				self.satisfied = False
				return self.state_data(self.main_data(data))
			#reset graph and db
			else:
				self.level = reset_level
				self.graph.reset(self.level)
				self.clause_db = copy.deepcopy(self.original_clause_db)
				self.new_nodes = {}
				for l in self.graph.decided:
					self.clause_db.decide_clauses(l)
					self.new_nodes[l.index] = str(self.graph.getNode(l))
				#save the state of graph pre propogation
				data["reset"].append(self.pre_prop())
				self.new_nodes = {}
				
		#if there was a conflict, save final state of graph in reset
		if self.conflict > 0:
			data["reset"][len(data["reset"])-1].update(self.state_data())

		return self.run_alg(data)


