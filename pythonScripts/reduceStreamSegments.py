"""
Reduces the complexity of stream segments by reducing the number of points
used to specify the path of each stream segment. 

Uses rdp algorithm for the actual reduction. 

Running this code will not overwrite any of the input files: the original
complex stream segments will remain. Output is written to "streamSegmentsReduced.txt"
in the same folder that the input ("streamSegments.txt") came from.

The user has a chance to change the settings for the folder while running, and 
may also stop the program before it writes out to any files. 

"""



testing = False
opt = False
optReduced = True 
doubleReduced = False
  
print("in ReduceStreamSegments! yay!")

inputFileEnding = "streamSegments.txt"
outputFileEnding = "streamSegmentsReduced.txt"
folder = ""
 
if doubleReduced: 
	folder = "streamSegmentsExtraReduced/"
elif opt is True: 
	folder = "optNetwork/"
elif optReduced is True: 
	folder = "optNetworkReduced/" 
elif testing is True:  
	folder = "testingInput/"  
else:   
	folder = "originalInput/"


changeFolder = raw_input("using {0} as the input folder. would you like to change it? ".format(folder))
if changeFolder is "y" or changeFolder is "yes":
	folder = raw_input("new name: ")


streamSegmentsInput = open(folder + inputFileEnding) 
streamSegmentsOutput = open(folder + outputFileEnding, "w")
 
epsilon = 0.1
from rdp import rdp
lineNumber = 0
# *******************************************************************************************
# ***************                  Stream Coordinate Analysis                 ***************
for line in streamSegmentsInput: 
	#print("\nworking on a new line now! (%d)" %lineNumber)
	info = line.split(); 
	length = len(info)
	# has at least id, start, end, x1, y1, x2, y2, and does not have half a coordinate
	if(length >= 7):  
		index = 3  
		coordinates = []
		while index + 1 < length: 
			x = float(info[index])
			y = float(info[index+1])
			coordinates.append([x,y])
			#print("getting coordinates at " + str(index))
			index += 2
		#print ("   gathered initial coordinates")  
		reducedCoordinates = rdp(coordinates, epsilon=epsilon) #additional optional parameter: epsilon=epsilon  
		output = "%s %s %s " %(info[0], info[1], info[2])  
		for item in reducedCoordinates:
			output += str(item[0]) + " " + str(item[1]) + " "  
		output += "\n"	 
		streamSegmentsOutput.write(output)
		#print("reduced line: " + output + "\n")
		#print("   wrote the reduced line") 
		if lineNumber%50 == 0:
			print("just wrote the reduced form of line %d" %lineNumber)
	lineNumber += 1

print("finished: last written line: %d" %lineNumber)

streamSegmentsInput.close()
streamSegmentsOutput.close()

print("all set! :)")







