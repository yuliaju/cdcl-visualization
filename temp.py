#edges = {0:[1,2,3,4], 1:[2,3],2:[6,7], 3:[1], 4:[7], 6:[], 7:[]}
edges = {0:[1,2], 1:[2,7], 2:[7]}
def paths_to_conflict(node):
	paths = []
	for i in edges[node]:
		print(i)
		rec_path([i])
		for value in rec_path([i]):
			paths.append(value)
	return paths

def rec_path(path):
	print("aqui")
	print(path)
	curr = path[len(path)-1]
	print(curr)
	print(edges[curr])
	for i in edges[curr]:
		print("in for")
		print(i)
		# if i.conflict == True:
		if i == 7:
			print("returning")
			print(path)
			#return path
			yield path
		# path2 = path.copy()
		# print("copying")
		# path2.append(i)
		else:
			print("else")
			path.append(i)
			rec_path(path)


print(paths_to_conflict(0))
