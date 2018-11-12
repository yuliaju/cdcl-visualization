def paths_to_conflict():
	return rec_path([[0]])

def rec_path(paths):
	#for all (possibly incomplete) paths in the array
	new_paths = []
	finished = True
	for path in paths:
		last = path[len(path)-1]
		#if path is already finished, ignore it
		if last == 7:
			new_paths.append(path)
		else:
			finished = False
			for adjacent in edges[last]:
				new_path = path.copy()
				new_path.append(adjacent)
				new_paths.append(new_path)
	if finished:
		return new_paths
	else:
		return rec_path(new_paths)