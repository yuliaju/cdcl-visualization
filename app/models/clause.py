class Literal:
	def __init__(self, index, sign=True):
		self.index = index
		self.sign = sign

	def __str__(self):
		s = ""
		if not self.sign:
			s += "~"
		return s + "p" + str(self.index)

	def __eq__(self, other):
		if self.index == other.index and self.sign==other.sign:
			return True
		else:
			return False
	# def __deepcopy__(self):
	# 	return Literal(copy.deepcopy(self.index, self.sign))

class Clause:
	#literal within a clause
	class ClauseLiteral:
		def __init__(self, literal):
			self.literal = literal
			# literal has been assigned the value in the clause
			self.satisfied = False
			# literal has been assigned the opposite value than exists in the clause
			self.excluded = False

		def __str__(self):
			s = str(self.literal)
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
		return s

	#add literal to clause
	def addLiteral(self, literal):
		l = Clause.ClauseLiteral(literal)
		self.literals.append(l)
		self.size += 1
		return self

	# add multiple literals to clause
	def addLiterals(self, literals):
		for i in literals:
			self.addLiteral(i)
		return self

	#return all literals in the clause that have not been excluded (ie assigned the negation of the value in that clause)
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
