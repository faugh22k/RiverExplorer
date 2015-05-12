"""
Uses the opt information given by the algorithm to find the root ID 
of the network used for opt. 
"""

# *******************************************************************************************
# ***************                      Opt Data Structure                     ***************
whichOptTable = 3


if whichOptTable == 1:
	optInput = open("originalInput/optTableK=400.txt")
elif whichOptTable == 2:
	optInput = open("originalInput/optTableK=2000.txt")
elif whichOptTable == 3:
	optInput = open("originalInput/optTableK=8000.txt")

if optInput is not None:
	allNodes = {}

	for line in optInput:
		info = line.split()
		if(len(info) < 9):
			#optEntry = {"nodeID" : info[0],"firstChildId": info[4], "siblingID": info[6]} 
			if info[0] not in allNodes:
				allNodes[info[0]] = True
			allNodes[info[4]] = False
			allNodes[info[6]] = False	

	possibleNodes = {}		
	for key in allNodes:		
		if allNodes[key] is True:
			possibleNodes[key] = True

	for key in possibleNodes:
		print("possible root: " + key) 

	if len(possibleNodes.keys()) is 1:
		print("found the root! " + possibleNodes.keys()[0]) 

optInput.close()	
























