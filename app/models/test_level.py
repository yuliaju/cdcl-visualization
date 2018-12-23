l = [1,6,2,3]
highest = l[0]
if highest < l[1]:
	highest2 = highest
	highest = l[1]
else:
	highest2 = l[1]
for i in range(2,len(l)):
	node = l[i]
	if node >= highest:
		highest = node
		highest2 = highest 
	elif node >= highest2:
		highest2 = node

print(highest2)