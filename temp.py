#edges = {0:[1,2,3,4], 1:[2,3],2:[6,7], 3:[1], 4:[7], 6:[], 7:[]}
edges = {0:[1,2], 1:[2], 2:[7], 3:[0]}
def uips(paths):
	nodes = [0,1,2,3,7]
	for path in paths:
		nodes = [x for x in nodes if x in path and x in nodes and x != 7]

	return nodes

print(uips([[0, 1, 2, 7], [0, 2, 7]]))
