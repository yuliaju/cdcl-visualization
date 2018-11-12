class Literal:
	def __init__(self, index, sign=True):
		self.index = index
		self.sign = sign

	def __str__(self):
		s = ""
		if not self.sign:
			s += "neg "
		return s + str(self.index)

	def __eq__(self, other):
		if self.index == other.index and self.sign==other.sign:
			return True
		else:
			return False

class Clause:
	#literal within a clause
	class ClauseLiteral:
		def __init__(self, literal):
			self.literal = literal
			self.satisfied = False
			self.excluded = False

		def __str__(self):
			s = "cl: " + str(self.literal)
			if self.satisfied:
				s += " sat"
			if self.excluded:
				s += " ex"
			return s

	def __init__(self):
		self.literals = []
		self.size = 0
		self.satisfied = False

	#number of literals in clause
	def __iter__(self):
		return self

	def __str__(self):
		s = ""
		for i in self.literals:
			s += str(i)
			s += (" or ")
		s = s[0:len(s)-4]
		if self.satisfied:
			s += " SAT!!"
		return s

	#add literal to clause
	def addLiteral(self, literal):
		l = Clause.ClauseLiteral(literal)
		self.literals.append(l)
		self.size += 1
		return self

	def addLiterals(self, literals):
		for i in literals:
			l = Clause.ClauseLiteral(i)
			self.literals.append(l)
			self.size += 1
		return self

	#return all literals in the clause that have not been excluded
	def nonExcludedLiterals(self):
		ls = []
		for l in self.literals:
			if l.excluded == False:
				ls.append(l)
		return ls

	#satisfy literal in clause if it exists
	def satisfy(self, literal):
		for l in self.nonExcludedLiterals():
			if l.literal.index == literal.index:
				if l.literal.sign == literal.sign:
					l.satisfied = True
					self.satisfied = True
				else:
					l.excluded = True
		return self

# TESTING
# c1 = Clause()
# c1.addLiterals([Literal(0, False), Literal(1, True)])
# print(c1.size)
# print(c1.satisfied)
# c1.satisfy(Literal(0, False))
# print(c1.satisfied)
# print(Literal(0, False) == Literal(0, True))
