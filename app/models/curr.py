data["conflict_info"] = []
		data["reset"] = []
		curr_reset = {}
		#while propogating creates a conflict, handle the conflict
		while not self.propogate():
			#if more than one conflict, save current state before solving conflict
			if self.conflict > 1:
				data["reset"].append(self.state_data(curr_reset))
				curr_reset = {}
				self.new_nodes = {}
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
				curr_reset = self.pre_prop()
				self.new_nodes = {}
				
		
		if self.conflict > 0:
			data["reset"].append(self.state_data(curr_reset))

		return self.run_alg(data)