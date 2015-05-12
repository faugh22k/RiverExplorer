"""
Finds all the nodes and edges from input data, and uses the edges 
to form a semi-tree structure (the input data does not always give 
a perfect tree). 

Then, it searches for the subnetwork rooted at the given node ID.
Once found, it writes out all of the data for that subnetwork. 
This includes a file that simply holds the ID of the root. 
	This simplifies matters when the JSON conversion code requires
	the root ID. This way, the user does not need to remember which ID 
	was used.

Running this script does not change the input data at all. 
The user has the opportunity to change settings while it is running.
	the root ID
	the folder used (indirectly by changing whether or
		not the opt network is the one we're extracting)
	the level to which the script prints information about what 
		it is doing. 
"""


import json 


class Node():

	parent = None
	children = None
	edges = None
	ID = None
	depth = None
	line = None
	addedToList = False

	def __init__(self, ID, parent, line):
		self.parent = parent
		self.ID = ID
		self.line = line

	def addChild(self, node, edgeString):
		# adds the node as a child and stores the string for the stream data
		if (self.children is None):
			self.children = []
			self.edges = []
		self.children.append(node)
		self.edges.append(edgeString)

	def setParent(self, parent):
		self.parent = parent 

	def findDepth(self): 
		print ("  finding depth. id: " + str(self.ID))
		if (self.depth is not None):
			print("   already found depth! (" + str(self.depth) + ")")
			return self.depth

		if (self.children is None): 
			print("   depth is 0")
			self.depth = 0
			return self.depth 
 

		depth = 0
		for child in self.children:
			print("    going through children")
			depth = max(child.findDepth(), depth)
		print("   finished going through all the children!")
		self.depth = depth + 1 
		print("   depth is " + str(self.depth))
		return self.depth

	def getDepth(self, depth):
		difference = depth - self.depth
		if (difference > 0):
			return (self, difference)
		if (difference == 0):
			return (self, difference)
		if (difference < 0):
			best = None
			current = None
			for child in self.children:
				current = child.getDepth(depth)
				
				if (best is None):
					best = current

				bestNeeded = abs(best[1])
				currentNeeded = abs(current[1])
				if (currentNeeded < bestNeeded):
					best = current
			return current 

	def formatStrings(self, listNodes, listEdges):  
		# unused: recursion level became too deep 
		nodes = ""
		edges = ""
		if(self.children is not None):
			for child in self.children:
				strings = child.formatStrings(listNodes, listEdges)
				nodes += strings[0] #+ "\n"
				edges += strings[1] #+ "\n"

			for edge in self.edges: 
				edges += edge #+ "\n"
				listEdges[self.getEdgeID(edge)] = True  

		nodes += self.line
		listNodes[self.ID] = True

		return (nodes, edges)


	def formatSelfString(self, listNodes, listEdges): 
		# format two strings: nodes and edges
		#    nodes: the information for the node, the line of text from barrier information
		#    edges: the information for the stream connecting this to its children
		# adds the node and edge ids as keys to listNodes and listEdges with value true
		# returns (nodes, edges) 
		
		nodes = ""
		edges = ""

		if(self.children is not None): 
			for edge in self.edges: 
				edges += edge #+ "\n" new line character included already
				listEdges[self.getEdgeID(edge)] = True  

		nodes += self.line
		listNodes[self.ID] = True 
		return(nodes, edges)



	def getEdgeID(self, edge):
		tokens = edge.split() 
		return tokens[0]

	def toString(self, levels):
		output = " "
		output += str(self.ID) + "\n  "

		for child in self.children:
			output += str(child.ID) + " [" + child.childrenString(levels-1) + "] \n  "
		return output

	def childrenString(self, addLevel):
		if(self.children is None):
			return ""
		output = ""
		for child in self.children:
			output += str(child.ID)
			if (addLevel != 0):
				output += " {" + child.childrenString(addLevel - 1) + "} "
			output += ","
		return output 

	def isDescendantOf(self, searchedFor):
		if (self.ID == searchedFor):
			return True
		
		checked = {}
		current = self.parent
		while current is not None: 
			if (current.ID == searchedFor):
				return True
			
			if current in checked:
				print("seem to be caught in a circle somewhere.")
				break

			checked[current] = True	
			current = current.parent

			
		return False


class Barrier():
	barrierID = None 
	line = None

	def __init__(self, id, line):
		self.barrierID = id
		self.line = line



# ******************************************************************************************* 
# *******************************************************************************************      
# ***************                   Read in Data, Find Root                   ***************       
  

searchingFor = None #"10302"#"10769" #"10987"
searchedForRoot = None
findingOpt = False
sourceFolder = ""
destinationFolder = ""
printExtraInformation = False

# Sets initial value of the searched for root ID.
# This is so that the user can see the expected future ID and
# have the option of changing it, below. 
#
# If changing the values here, be sure to change them after
# the user input section as well. 
# The value set here will be overwritten below.  
if findingOpt: 
	searchingFor = "10987" # index of root of opt, found by findRootFromOpt
else: 
	searchingFor = "11717"					# test networks: "10658", "20341"      # "10302" does not have full subnetwork: I think it's the loops problem
											# the root of the network we've been using "10769"   # other tries: "10101" #"4458" #"4374"


updateRootID = True
print("\n\nsearching for root {0} \nfindingOpt: {1} \nprintExtraInformation: {2}".format(searchingFor, findingOpt, printExtraInformation))

answer = raw_input("\nwould you like to change any settings? ")
while answer == "y" or answer =="yes":
	answer = raw_input("which variable would you like to change? (root, opt, extra, or print) ")

	if answer == "root":
		searchingFor = raw_input("new root ID: ")
		updateRootID = False
	if answer == "opt":
		findingOpt = not findingOpt 
	if answer == "extra":
		printExtraInformation = not printExtraInformation
	if answer == "print":
		print("\nsearching for root {0} \nfindingOpt: {1} \nprintExtraInformation: {2}".format(searchingFor, findingOpt, printExtraInformation))

	answer = raw_input("\nwould you like to change anything else? ")



if findingOpt:
	sourceFolder = "indicesOutput/"
	destinationFolder = "optNetwork/"
	if updateRootID:  
		searchingFor = "10987" # index of root of opt, found by findRootFromOpt
else:
	sourceFolder = "optNetwork/"
	destinationFolder = "optNetworkReduced/"
	if updateRootID: 
		searchingFor = "11717"		 			# test networks: "10658", "20341"      
												# "10302" does not have full subnetwork: I think it's the loops problem
												# the root of the network we've been using "10769"   # other tries: "10101" #"4458" #"4374"

print("\nsource folder: {0} \ndestination folder: {1}\nrootID: {2}".format(sourceFolder, destinationFolder, searchingFor))

  
# ******************************************************************************************* 
# ***************                       Barriers  Data                        *************** 
 
barriersInput = open(sourceFolder+"barriersinfocode.txt", "r")   

allBarriers = {}     # stores all the barriers, indexed by id
numberBarriers = 0   # counts total number of barriers

for line in barriersInput:
	# Read in all barriers and create Barrier instances for them
	info = line.split();
	if(len(info) == 3):  
		# each line contains: id, parent, info
		# create a new node with id, no parent, and the line of text 
		allBarriers[info[0]] = Barrier(info[0], line) 
		#if searchingFor == info[0]:
		#	# store the node instance for the root we're looking for
		#	searchedForRoot = allBarriers[info[0]]
		#	print("found the root we're looking for! (" + info[0] + ")")
		numberBarriers += 1

barriersInput.close() 
print("read in " + str(numberBarriers) + " barriers")  

 


  

# *******************************************************************************************
# ***************                     Stream Initial Data                     ***************

streamsInput = open(sourceFolder+"streamscode.txt") 

allNodes = {}      # stores all the nodes, indexed by their id
allParents = []    # stores any node that is a parent
upstream = None
downstream = None
problems = 0
successes = 0
numberStreams = 0
shouldBeBarrierIDs = ""
foundBarrierIDs = "" 

for line in streamsInput:  
	info = line.split()
	if(len(info) >= 4): 
		# stream  upstreamID  downstreamID  length  upstreamBID  upstreamBT  downstreamB  downstreamBT 
		numberStreams += 1  

		# info[1] contains the upstream node id
		if info[1] in allNodes:
			upstream = allNodes[info[1]]
			#allParents.remove(upstream)
		else: 
			# create a node instance if it hasn't been created yet
			# check whether the node is the searched for root
			if info[4] != "-1":
				if info[4] in allBarriers:
					upstream = Node(info[1], None, allBarriers[info[4]].line)
					foundBarrierIDs += info[4] + ", "
				else: 
					#print (".%s. should be in allBarriers, but isn't! " % info[4])
					upstream = Node(info[1], None, "")
					shouldBeBarrierIDs += info[4] + ", "
			else:
				upstream = Node(info[1], None, "")
			allNodes[info[1]] = upstream
			if searchingFor == info[1]:
				searchedForRoot = upstream
		
		# info[2] contains the downstream node id
		if info[2] in allNodes:	
			downstream = allNodes[info[2]]    
		else: 
			# create a node instance if it hasn't been created yet
			# check whether the node is the searched for root
			if info[6] != "-1":
				if info[6] in allBarriers:  
					downstream = Node(info[2], None, allBarriers[info[6]].line)
					foundBarrierIDs += info[6] + ", " 
				else: 
					#print (".%s. should be in allBarriers, but isn't! " % info[6])
					downstream = Node(info[2], None, "")
					shouldBeBarrierIDs += info[6] + ", "
			else:
				downstream = Node(info[2], None, "")
			allNodes[info[2]] = downstream
			if searchingFor == info[2]:
				searchedForRoot = downstream
		
		# update parent child relations to connect the nodes
		downstream.addChild(upstream, line)
		upstream.setParent(downstream) 
		successes += 1
		
		# add downstream to list of possible parents if it hasn't been added
		# and doesn't have a parent
		if(downstream.addedToList is False and downstream.parent is None):
			allParents.append(downstream)
			downstream.addedToList = True 

streamsInput.close()
print("read in " + str(numberStreams) + " streams")
print("(encountered " + str(problems) + " problems and " + str(successes) + " successes)")  

if printExtraInformation: 
	print("\n\n\n\n\nshould be barriers but unfound: \n    " + shouldBeBarrierIDs)
	print("\n\n\nshould be barriers and found: \n    " + foundBarrierIDs) 
 
 
#print("number of possible roots " + str(len(allParents)))
#potentialNodes = []
#for index in range(len(allParents)): 
#	parent = allParents[index]
#	if(parent.parent is None):
#		potentialNodes.append(parent)
#	if (index % 5000 == 0):
#		print("went through " + str(index) + " parents")
#
#print("have " + str(len(potentialNodes)) + " possible roots ")  




root = searchedForRoot
if root is None:
	print("didn't find the searched for root!")
	exit() 





# ******************************************************************************************* 
# *******************************************************************************************      
# ***************                     Extract Subnetwork                      ***************        


includedNodes = {}    # stores the ids of the nodes that are part of the subnetwork
includedEdges = {}    # stores the ids of the streams that are part of the subnetwork 
edgeStrings = ""      # the text to write to the barriers file
nodeStrings = ""      # the text to write to the streams file

for key in allNodes:
	# store string to add to file if the node is a descendant of the root
	if(allNodes[key].isDescendantOf(root.ID)):
		# the node is a descendant of the root: store its information to add to the network files
		strings = allNodes[key].formatSelfString(includedNodes, includedEdges) 
		# the barrier information
		nodeStrings += strings[0]
		# the streams information
		edgeStrings += strings[1]


# allow user to cancel file write
print("\nwriting to files now!")
answer = raw_input("Proceed? ") 
if answer == "no" or answer == "n":
	print("goodbye!")
	exit()


# write the barrier information
edgeOutput = open(destinationFolder+"barriersinfocode.txt", "w")
edgeOutput.write(nodeStrings)
edgeOutput.close() 

# write the streams information 
streamOutput = open(destinationFolder+"streamscode.txt", "w")
streamOutput.write(edgeStrings) 
streamOutput.close()

# write the stream's path coordinates
streamSegmentsInput = open(sourceFolder+"streamSegments.txt") 
streamSegmentsOutput = open(destinationFolder+"streamSegments.txt", "w") 

# write each line that is one of the included streams to the file
for line in streamSegmentsInput:
	info = line.split()
	if info[0] in includedEdges:  
		streamSegmentsOutput.write(line)


streamSegmentsInput.close()
streamSegmentsOutput.close()


# write the id of the root to a file
rootIDOutput = open(destinationFolder+"rootID.txt", "w")
rootIDOutput.write(searchingFor)
rootIDOutput.close()


print("all set! :)") 













