#!/usr/bin/python3


from solution import *
from parse import *
from clause import *




def main():
	# First iteration
	clause_db = parse_clauses("")
	solution = Solution(clause_db)
	return_data = solution.run_alg()
	print(return_data)
	while return_data["finished"] == False:
		data = user_decision()
		print(data)



# get num and sign of new deicision literal
def user_decision():
	num = input("Enter the number of a node")
	sign = input("Enter F to negate the literal, T if not")
	return_data = solution.new_input(num, sign)
	return return_data

if __name__ == "__main__":
	main()
