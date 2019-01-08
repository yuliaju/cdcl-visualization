import copy
from .clause import *

class Clause_db:

	def __init__(self, num_literals):
		self.clauses = []
		self.len = 0
		self.num_literals = num_literals

	def __str__(self):
		s = "Clause Database:\n"
		s += "Length: " + str(self.len)
		s += "\nNum Literals: " + str(self.num_literals) + "\n"
		for c in self.clauses:
			s += str(c) + "\n"
		return s

	def __iter__(self):
		return self

	def array_of(self):
		arr = []
		for c in self.clauses:
			arr.append(str(c))
		return arr

	def array_sat(self):
		arr = []
		for c in self.clauses:
			arr.append(c.satisfied)
		return arr

	def getLen(self):
		return self.len

	def getClauses(self):
		return self.clauses

	def getClause(self, i):
		return self.clauses[i-1]

	# def deepcopy(self):
	# 	return Clause_db(copy.deepcopy(self.clauses))

	def addClause(self, cl):
		self.clauses.append(cl)
		self.len += 1
		return self

	def addClauses(self, cs):
		for c in cs:
			self.clauses.append(c)
			self.len += 1
		return self

	#return true if all clauses in database are satisfied, false if not
	def is_satisfied(self):
		fin = True
		for i in self.clauses:
			if not i.satisfied:
				fin = False
		return fin

	#if conflict, return clause number. Else return False
	def is_conflict(self):
		for i in range(1, len(self.clauses)+1):
			c = self.getClause(i)
			if (not c.satisfied) and (len(c.nonExcludedLiterals()) == 0):
				return i
		return False

	#decide literal l
	def decide_clauses(self, l):
		#find literal in all clauses and satisfy or excluded each instance
		for c in self.clauses:
			c.satisfy(l)
		return self
