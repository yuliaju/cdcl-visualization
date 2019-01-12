import copy
from .graph import *
from .clause import *
from .clause_db import *



class Solution:
	def __init__(self, original_clause_db):
		self.graph = Graph()
		self.new_nodes = {}
		self.recent_decision = None
		self.finished = False
		self.satisfied = False
		self.conflict = 0
		self.level = 0
		self.original_clause_db = original_clause_db
		self.clause_db = copy.deepcopy(original_clause_db)


	#Propagate: Decide any singular clauses. Return false if conflict
	def propagate(self):
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
						new_node = self.graph.decide_graph(self.level, l, i, self.clause_db.getClause(i))
						self.graph.decided.append(l)
						self.new_nodes[l.index] = str(new_node)
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
		conflictnode = self.graph.addNode(Graph.Node(Literal(-1, True), self.level, self.clause_db.getClause(cl), cl, True))
		#update edges
		self.graph.new_edges(conflictnode, self.clause_db.getClause(cl), None)
		
		(recent_decision_node, uips, uip) = self.graph.uips(self.level)
		(cut_con, lits) = self.graph.cut(uip)
		conflict_clause = Clause().addLiterals(lits)
		
		#add conflict clause to database
		self.original_clause_db.addClause(conflict_clause)
		reset_level = self.graph.backtrack_level(conflict_clause)

		# Save data of current state for frontend
		state_data = self.state_data()
		c_data = { "all_uips": [str(u) for u in uips], "right_uip": str(uip), "conflict_clause":
			str(conflict_clause), "cut_conflict": cut_con, "conflict_label": str(conflictnode),
			"recent_decision": recent_decision_node}		
		c_data.update(state_data)
		return (c_data, reset_level)


	#main data for frontend
	def main_data(self, data={}):
		data["finished"] = self.finished
		data["satisfied"] = self.satisfied
		data["conflict"] = self.conflict
		data["available"] = copy.copy(self.graph.available_front(self.original_clause_db.num_literals))
		return self.state_data(data)

	#state data for frontend: info about clause db, graph, and level
	def state_data(self, data={}):
		s_data = {}
		s_data["new_nodes"] = copy.copy(self.new_nodes)
		s_data["level"] = copy.copy(self.level)
		s_data["edges"] = copy.copy(self.graph.new_edges_front(self.new_nodes))
		s_data["decided"] = copy.copy(self.graph.decided_front())
		s_data["all_clauses"] = copy.copy(self.clause_db.array_of())
		s_data["clause_sat"] = copy.copy(self.clause_db.array_sat())
		self.new_nodes = {}
		data["state"] = s_data
		return data

	#Data for frontend: the state once the algorithm has rewinded after a conflict but before it has propagated
	def pre_prop(self, data = {}):
		p_data = {}
		p_data["pre_prop_nodes"] = copy.copy(self.new_nodes)
		self.new_nodes = {}
		p_data["pre_prop_edges"] = copy.copy(self.graph.new_edges_front(self.new_nodes))
		p_data["pre_prop_clause_sat"] = copy.copy(self.clause_db.array_sat())
		p_data["pre_prop_all_clauses"] = copy.copy(self.clause_db.array_of())
		data["pre_prop_state"] = p_data
		return data


	#First run only: Propagate. If conflict reached, db is unsat. Else continue algorithm
	def start_alg(self):
		data = {}
		if not self.propagate():
			self.finished = True
			self.satisfied = False
			(c_data, reset_level) = self.analyze_conflict()		
			data["conflict_info"] = []
			data["conflict_info"].append(c_data)
			return self.main_data(data)
		else:
			if self.graph.size > 0:
				data["explanation"] = "propagation"
			else:
				data["explanation"] = "pre_user_decision"
			return self.run_alg(data, True)

	# Body of algorithm. While propagated and not satisfied, ask for user decision
	def run_alg(self, data={}, exp=False):
		#while all clauses are not satisfied, send frontend current state and ask for user decision
		while not self.clause_db.is_satisfied():
			if not exp:
				if self.conflict == 0 and self.finished == 0:
					exp = "btwn_user_decisions"
				elif self.conflict > 0:
					exp = "conflict"
				data["explanation"] = exp
			return self.main_data(data)
		#Satisfiable solution is found. Send frontend solution
		self.finished = True
		self.satisfied = True
		return self.main_data(data)



	#Upon receiving user input, continue algorithm
	def new_input(self, num, sign):
		data = {}
		self.level += 1
		l = Literal(num, sign)
		self.graph.decided.append(l)
		self.clause_db.decide_clauses(l)
		node = self.graph.decide_graph(self.level, l)
		self.recent_decision = node
		self.new_nodes[num] = str(node)
		self.conflict = 0

		data["conflict_info"] = []
		#while propagating creates a conflict, handle the conflict
		while not self.propagate():
			#compute conflict data and save for frontend
			(c_data, reset_level) = self.analyze_conflict()
			#clause db is unsat
			if reset_level < 0:
				self.finished = True
				self.satisfied = False
				data["conflict_info"].append(self.pre_prop(c_data))
				return self.main_data(data)
			#reset graph and db
			else:
				self.level = reset_level
				self.recent_decision = None
				self.graph.reset(self.level)
				self.clause_db = copy.deepcopy(self.original_clause_db)
				for l in self.graph.decided:
					self.clause_db.decide_clauses(l)
					self.new_nodes[l.index] = str(self.graph.getNode(l))
				#save the state of graph pre propagation
				data["conflict_info"].append(self.pre_prop(c_data))

		return self.run_alg(data)
