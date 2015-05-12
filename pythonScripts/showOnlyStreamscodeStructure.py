"""
	Reads the input streamscode file and outputs only the ID information to a new 
	file. This is vastly useful for combing through the original data with command-f,
	as it prevents false matches in other data fields. 
"""

#streamsInput = open("smalleroutput/streamscode.txt") 
#streamsInput = open("testingInput/streamscode.txt")  

streamsInput = open("optNetwork/streamscodeTiesBroken.txt", "r") 
streamsOutput = open("optNetwork/streamscodeTiesBrokenNodeRelationshipsOnly.txt", "w") 

 
numberLines = -1
for line in streamsInput:
	info = line.split()
	if len(info) < 8:
		continue
	newLine = info[0] + " \t " + info[1] + " \t " + info[2] + "\n"
	streamsOutput.write(newLine)   
		 
streamsOutput.close()
streamsInput.close()







