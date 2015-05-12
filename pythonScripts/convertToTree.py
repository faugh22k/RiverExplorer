"""
The optimization algorithm runs with the river network modeled as 
a tree structure. River networks are not naturally perfect tree structures
but they can be made into them. 

convertToTree's purpose is to ensure that the RiverExplorer
uses the same structure as the algorithm. To do this, it
only writes out edges (streams) that are part of the tree
structure the algorithm used to find opt (specified by treeStructureFile.txt)

Running this script does not overwrite any of the original input data. 
The user has a chance to change the folder used to find and write data. 
"""


inputFolder = "optNetworkReduced/"#"originalInput/"  

answer = raw_input("would you like to change the input folder?  currently: {0}  ".format(inputFolder))
if answer is "y" or answer is "yes": 
	answer = raw_input("input folder: ")
	if answer is not "":
		inputFolder = answer

treeStructureFileName = inputFolder + "treeStructureFile.txt"
originalStreamsFileName = inputFolder + "streamscode.txt"
correctedStreamsFileName = inputFolder + "streamscodeTiesBroken.txt"



print("reading in the tree structure file!")

correctStreamConnections = {}
treeStructureFile = open(treeStructureFileName, "r")
# downstreamID :  upstreamID1   upstreamID2 ... 
#               (one, two, ..., n   or   none)  

# find and store the correct tree structure 
for line in treeStructureFile:
	info = line.split()
	#print("     {0}".format(len(info)))

	if (len(info) >= 1):

		# downstream is the parent
		downstreamID = info[0] 

		# children are upstream
		upstreamIDS = []

		# the first upstream ID will be at index 2 
		index = 2
		
		# store all upstream IDs
		while index < len(info):
			upstreamIDS.append(info[index])
			index += 1

		# store the IDs as the only possible children of downstream ID
		correctStreamConnections[downstreamID] = upstreamIDS



print("\n\n\nreading in the the current streamscode file, and writing the corrected version!")

originalStreamsFile = open(originalStreamsFileName, "r")
correctedStreamsFile = open(correctedStreamsFileName, "w")

# streamID  upstreamID  downstreamID  length  upstreamBarrier upstreamBarrierType  downstreamBarrier  downstreamBarrierType
for line in originalStreamsFile:
	#print("     {0}".format(line))
	info = line.split()

	if len(info) < 8: 
		print("     length is invalid; passing  ({0})".format(len(line)))
		continue

	# if the downstream (parent) node is not in the tree structure map, print an error message
	if info[2] not in correctStreamConnections:
		print("{0} not in correctStreamConnections, but in originalStreamsFile ".format(info[1]))
		continue

	correctUpstreamIDS = correctStreamConnections[info[2]]	# get the listing of correct children for the downstream node
	currentUpstreamID = info[1]   							# get the ID of the child the current stream segment
															#   would connect to the downstream node

	foundMatch = False

	# search for the upstream ID amongst the correct upstreamIDs
	for item in correctUpstreamIDS:
		if (currentUpstreamID == item):
			foundMatch = True 
			break

	# write to the ties broken final if a match is found
	if foundMatch:
		correctedStreamsFile.write(line)



treeStructureFile.close()
originalStreamsFile.close()
correctedStreamsFile.close()

print("all set :)")





