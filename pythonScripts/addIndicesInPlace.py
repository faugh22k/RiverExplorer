"""
	Add indices to the streams from streamscode input file and output the result to the same place.  
"""

#streamsInput = open("smalleroutput/streamscode.txt") 
#streamsInput = open("testingInput/streamscode.txt")  


#streamsInput = open("originalInput/streamscode.txt", "r") 
#streamsOutput = open("indicesOutput/streamscode.txt", "w") 

folder = "originalInput/" #"optNetwork/"   

fileLocation = folder + "streamscode.txt"

streamsInput = open(fileLocation, "r") 


output = "" 
numberLines = -1
for line in streamsInput:
	output = output + (str(numberLines) + " " + line)  
	numberLines += 1
		 

streamsInput.close()
streamsOutput = open(fileLocation, "w") 
streamsOutput.write(output)
streamsOutput.close()








