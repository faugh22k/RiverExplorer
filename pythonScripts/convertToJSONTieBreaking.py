"""
Converts the given input data to JSON data to send to RiverExplorer. 
	The input data is in no way changed by running this script. 

The script prompts user to confirm/change all settings as it is running.
	(If changing values directly by updating code, it is advised that 
	the programmer changes the values of the toggle variables rather than 
	changing the other values directly.)  

Ultimately, the JSON data contains the node information, stream information,
action possibilities for different barrier types, some settings used for initial
display settings, and the opt structure. It performs some alterations to the initial
stream coordinates (subtracts minX and minY from all so that x and y values start at 0,
reduced numbers by some factor) 

	Node information format:
		For a barrier node: 
			nodeID : {
				passability: __ ,
				barrierType: __ ,
				isBarrier: True ,
				barrierID: __    
			}
		For a non-barrier node: 
			nodeID : {
				passability: 1.0 , 
				isBarrier: False   
			} 


	Stream information format: 
		streamID = {
			upstreamNodeID : __ ,  
			downstreamNodeID : __ ,  
			length : __ ,
			segments: [x1,y1, ..., xN,yN]
		}
		(note: in segments, N must be >= 2: all stream segments have a beginning location and an ending location)


	Opt format:
		for a single opt entry: 
			nodeID : {
				value : {
					nodeID  : __ , 
					value : __ , 
					cost : __ , 
					actionID : __ , 
					firstChildID : __ , 
					valueChild : __ , 
					siblingID : __ , 
					valueSibling : __    
				}
				(...)
			} 


	Actions format:
		actions : {
			barrierType : {
				actionID : {
					cost: __ ,
					improvedPassability: __
				}
				(...)
			}
			(...)
		}
		
		The two barrier types are dams and crossings. 


	Display settings format: 
		display : {
			maxX : __ ,  
			maxY : __ 
		}  
		(this is so that the river explorer does not need to figure these numbers 
		out for itself: instead, it already know the maximums so that it knows how
		it will need to set the initial transform and scale (min values are always 0))

As the the write for human vs computer prompt:
	If the JSON is to be used for the website, the data whould be written
	for the computer. (no whitespace; much smaller file)

	If the intention is to look at the data directly, it should be written
	for the human. Text editors have great difficulty in opening such a large 
	file when its entirety is on one line. 



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
		if (self.children is None):
			self.children = []
			self.edges = []
		self.children.append(node)
		self.edges.append(edgeString)

	def setParent(self, parent):
		self.parent = parent

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
		nodes = ""
		edges = ""

		if(self.children is not None): 
			for edge in self.edges: 
				edges += edge #+ "\n"
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
		if (self.ID == searchedFor or searchedFor == -1):
			return True
		
		checked = {}
		current = self.parent
		while current is not None: 
			if (current.ID == searchedFor):
				return True
			checked[current] = True	
			current = current.parent

			if current in checked:
				print("seem to be caught in a circle somewhere.")
				break
		return False






















































testing = False
opt = True
optReduced = False
streamSegmentsReduced = True
streamSegmentsReducedDouble = False
streamTiesBroken = True
whichOptTable = 3
rootID = "10987"#"10769"#"10987"
confirm = True 
askBeforeWrite = True
readRootIDFromFile = True

print ("Switch variables: \n  opt \n  optReduced \n  streamSegmentsReduced \n  whichOptTable \n  rootID")
print ("\nCurrently selected: ")
if opt is True: 
	print ("  opt")
if optReduced is True:  
	print ("  optReduced")
if testing is True: 
	print ("  testing")
if streamTiesBroken is True:  
	print ("  streamTiesBroken") 
print ("  whichOptTable: %i" % whichOptTable)
print ("  rootID: %s" % rootID)
	
if confirm:
	answer = raw_input("\nDo you wish to change any variables? (y or n) ")
else: 
	answer = "n"
while answer != "n" and answer != "no": 
	if answer == "y":  
		answer = raw_input("Which one?  (you may also use 'print' to display all values) ")
	if answer == "opt":
		opt = not opt
		optReduced = not opt
		print ("also switched optReduced")
	if answer == "optReduced":
		optReduced = not optReduced
		opt = not optReduced
		print ("also switched opt")
	if answer == "streamSegmentsReduced":
		streamSegmentsReduced = not streamSegmentsReduced
	if answer == "ties":
		streamTiesBroken = not streamTiesBroken 
		print ("switched streamTiesBroken to {0}".format(streamTiesBroken))
	if answer == "testing":
		testing = not testing
	if answer == "rootID":
		answer = raw_input("What is the new ID? ")
		rootID = answer
	if answer == "readRootIDFromFile" or answer == "read":
		readRootIDFromFile = not readRootIDFromFile
	if answer == "whichOptTable":
		answer = raw_input("1,2, or 3? (1 is the largest table; 3, the smallest) ")
		whichOptTable = int(answer);
	if answer == "print": 
		print ("\n  opt: %r \n  ties: %r \n  optReduced: %r \n  streamSegmentsReduced: %r \n  testing: %r \n  rootID: %s \n  readRootIDFromFile: %s \n  whichOptTable: %i\n"  %(opt, streamTiesBroken, optReduced, streamSegmentsReduced, testing, rootID, readRootIDFromFile, whichOptTable))
	answer = raw_input("Would you like to change anything else? ")


if opt is True: 
	inputFolder = "optNetwork/"
elif optReduced is True:  
	inputFolder = "optNetworkReduced/" 
elif testing is True: 
	inputFolder = "testingInput/"
else:  
	inputFolder = "originalInput/"
print("\nformatting data using files from: " + inputFolder + "\n")


if readRootIDFromFile:
	try:
		rootIDFile = open(inputFolder + "rootID.txt")
		rootID = rootIDFile.next()
		#rootID = rootID.translate(None, whitespace)
	except:
		print("could not read rootID from file")

print("formatting data for network with root {0}".format(rootID))


 


# *******************************************************************************************
# ***************                        Barrier Data                         ***************  
  

 
barriersInput = open(inputFolder + "barriersinfocode.txt")
info = None

barrierInformation = {} 
barrier = {} 
numberBarriers = 0
lastID = 0
missedNumbers = []

for line in barriersInput:
	info = line.split() 
	if(len(info) == 3): 
		barrier = {"barrierID" : info[0], "barrierType" : int(info[1]), "passability" : float(info[2])};  
		barrierInformation[info[0]] = barrier   
		numberBarriers += 1 

barriersInput.close()  
print("formatted data for barriers. (" + str(numberBarriers) + ")")
#print(missedNumbers) 
 

 












# *******************************************************************************************
# ***************                     Stream Initial Data                     *************** 
# ***************                          Find Nodes                         *************** 

if streamTiesBroken:
	streamsInput = open(inputFolder + "streamscodeTiesBroken.txt")
else:
	streamsInput = open(inputFolder + "streamscode.txt")
nodeInformation = {}  
upstream = {} 
downstream = {}
streamInformation = {} 
stream = {} 
numberLines = 0
numberErrors = 0
allNodes = {}

for line in streamsInput:
	info = line.split()
	if(len(info) >= 7):  
		if info[1] not in nodeInformation:
			upstream = {"ID" : info[1]} 
 			
 			# added to test opt presence 
			allNodes[info[1]] = Node(info[1], None, line)
 			
			if info[4]in barrierInformation:  
				barrier = barrierInformation[info[4]] 
				upstream["passability"] = barrier["passability"]
				upstream["barrierType"] = barrier["barrierType"]
				upstream["isBarrier"] = True
				upstream["barrierID"] = info[4]
			else: 
				upstream["isBarrier"] = False 
				upstream["passability"] = 1.0   
			nodeInformation[info[1]] = upstream

		if info[2] not in nodeInformation:
			downstream = {"ID" : info[2]}

			# added to text opt presence 
			allNodes[info[2]] = Node(info[2], None, None) 
			try:
				allNodes[info[1]].addChild(allNodes[info[2]], None)
			except KeyError:
				#print("for some reason, allNodes does not contain %s! Unknown Error." %info[1]) 
 				numberErrors += 1

			if info[6] in barrierInformation: 
				barrier = barrierInformation[info[6]]	
				downstream["passability"] = barrier["passability"]
				downstream["barrierType"] = barrier["barrierType"]
				downstream["isBarrier"] = True
				downstream["barrierID"] = info[6]
			else:  
				downstream["isBarrier"] = False
				downstream["passability"] = 1.0   
			nodeInformation[info[2]] = downstream 
 

		if(len(info) >= 7):  
			stream = {"upstreamNodeID" : info[1], "downstreamNodeID" : info[2], "length" : info[3]}
			#streamInformation.append(stream) 
			streamInformation[info[0]] = stream; 
			numberLines += 1 
 
print("formatted initial data for streams.")
print("read in " + str(numberLines) + " streams with " + str(numberErrors) + " errors")





 



 

if streamSegmentsReduced:
	streamSegmentsInput = open(inputFolder + "streamSegmentsReduced.txt")
else: 
	streamSegmentsInput = open(inputFolder + "streamSegments.txt")

minX = None
minY = None
combined = None
minPoint = None
minCombined = None
secondPoint = None
secondCombined = None
maxX = None
maxY = None
# *******************************************************************************************
# ***************                  Stream Coordinate Analysis                 ***************
for line in streamSegmentsInput:
	info = line.split(); 
	length = len(info)
	# has at least id, start, end, x1, y1, x2, y2, and does not have half a coordinate
	if(length >= 7):  
		index = 3  
		while index < length: 
			if(minX is None or float(info[index]) < minX):
				minX = float(info[index]) 
			if(minY is None or float(info[index+1]) < minY):
				minY = float(info[index+1]) 

			if(maxX is None or float(info[index]) > maxX):
				maxX = float(info[index])  
			if(maxY is None or float(info[index+1]) > maxY):
				maxY = float(info[index+1]) 

			combined = float(info[index]) + float(info[index+1]) 
			if (minCombined is None or combined < minCombined):
				minPoint = (float(info[index]), float(info[index+1])) 
				minCombined = combined
			elif (secondPoint is None or combined < secondCombined):
				secondPoint = (float(info[index]), float(info[index+1]))
				secondCombined = combined
			index += 2 

streamsInput.close()
streamSegmentsInput.close()
    
print("minX: " + str(minX)) 
print("minY: " + str(minY))
print("maxX: " + str(maxX)) 
print("maxY: " + str(maxY))
#print ("\nminPoint, minPoint adjusted")
#print(minPoint)
#adjusted = (minPoint[0] - minX, minPoint[1] - minY)
#print (adjusted)
#print ("\nsecondPoint, msecondPoint adjusted")
#print(secondPoint)
#adjusted = (secondPoint[0] - minX, secondPoint[1] - minY)
#print (adjusted)
print ("\ncontinuing to read in data now!")



 



#newMinX = None
newMinY = None
#newMaxX = None
newMaxY = None
newUnreducedY = None
#newUnreducedX = None
unFlippedMaxY = None
  

if streamSegmentsReduced:
	streamSegmentsInput = open(inputFolder + "streamSegmentsReduced.txt") 
else: 
	streamSegmentsInput = open(inputFolder + "streamSegments.txt")

numberMissed = 0
numberLines = 0
number = 0
checkX = None
checkY = None
totalX = 0
totalY = 0 
totalPoints = 0
divisor = 35#50#100 

# *******************************************************************************************
# ***************                      Stream Final Data                      *************** 
for line2 in streamSegmentsInput: 
	number+=1
	info = line2.split() 
	length = len(info)
	# has at least id, start, end, x1, y1, x2, y2, and does not have half a coordinate
	if(length >= 7):  
		index = 3 
		c = 0; # coordinate index
		segments = [None]*(length - 3) 
		while index + 1 < length: 
			if testing is False:
				segments[c] = str((float(info[index]) - minX)/divisor)     #for normal
				#segments[c+1] = str((float(info[index+1]) - minY)/divisor) #for normal 
 				
 				#print("\noriginalY " + info[index+1])	 
				#flippedY = 0 - float(info[index+1]) # - minY)
				#print("   flippedY: " + str(flippedY))
				#shiftedY = flippedY + maxY  
				#print("   shiftedY: " + str(flippedY))
				#reducedY = shiftedY/divisor
				#print("   reducedY: " + str(flippedY))
				#segments[c+1] = str(reducedY)
				#print("originalY " + info[index+1] + ", finalY: " + str(flippedY))

				#print("\noriginalY " + info[index+1])	 
				flippedY = 0 - (float(info[index+1])/divisor) # - minY)
				#print("   flippedY: " + str(flippedY))
				shiftedY = flippedY + (maxY/divisor)  
				#print("   shiftedY: " + str(flippedY))
				reducedY = shiftedY #shiftedY/divisor
				#print("   reducedY: " + str(flippedY))
				segments[c+1] = str(reducedY)
				#print("originalY " + info[index+1] + ", finalY: " + str(flippedY))

				if(newMinY is None or reducedY < newMinY):
					newMinY = reducedY   
				if(newMaxY is None or reducedY > newMaxY):
					newMaxY = reducedY 
				if(newUnreducedY is None or shiftedY > newUnreducedY):
					newUnreducedY = shiftedY 
				if(unFlippedMaxY is None or float(info[index+1])/divisor > unFlippedMaxY):
					unFlippedMaxY = float(info[index+1])/divisor 



   				# min 100, max 200
				#   100   150   200 
				#  -100  -150  -200 
				#   100    50    0

				# min 100, max 200
				#  100   150   200
				#    0    50   100 
				#  	-0   -50  -100
				#  100    50     0   

			else: 
				segments[c] = str((float(info[index]) - minX))        #for test files
				segments[c+1] = str((float(info[index+1]) - minY))    #for test files
			if (checkX is None or float(segments[c]) > checkX):
				checkX = float(segments[c]) 
			if (checkY is None or float(segments[c+1]) > checkY):
				checkY = float(segments[c+1])
			totalX += float(segments[c])
			totalY += float(segments[c+1])
			totalPoints += 1
			c += 2
			index += 2
			numberLines += 1
		try:
			#print("trying to add segments to %s" %info[0])
			#print "segments: ", segments
			streamInformation[info[0]]["segments"] = segments	
			#print("successful!!!")
		except(KeyError): 
			numberMissed += 1  

print ("max (x,y)  (%d,%d)" %(maxX,maxY))
print ("min (x,y)  (%d,%d)" %(minX,minY))
maxX = (maxX - minX)/divisor 
maxY = (maxY - minY)/divisor
print ("new max (x,y)  (%d,%d)" %(maxX,maxY))

print ("newMinY: " + str(newMinY)) 
print ("newMaxY: " + str(newMaxY)) 
print ("newUnreducedY: " + str(newUnreducedY)) 
print ("unFlippedMaxY: " + str(unFlippedMaxY))  

#avgX = totalX / totalPoints
#avgY = totalY / totalPoints 
#print(number)
#print("checkX, checkY")
#print(checkX)
#print(checkY)
#print("\n averageX, averageY")
#print(avgX)
#print(avgY)
print("\nformatted all data for streams.")
print("number read: "+ str(numberLines) + " number missed: " + str(numberMissed))

streamsInput.close() 
 
 












# *******************************************************************************************
# ***************                      Opt Data Structure                     ***************

noTable = True
if whichOptTable == 1:
	optInput = open("originalInput/optTableK=400.txt")
	noTable = False
elif whichOptTable == 2:
	optInput = open("originalInput/optTableK=2000.txt")
	noTable = False
elif whichOptTable == 3:
	optInput = open("originalInput/optTableK=8000.txt")
	noTable = False

optInformation = {}
if not noTable:
	numberInvalidOPT = 0
	actionValueOne = 0
	actionValueTwo = 0
	actionValueZero = 0
	actionValueNegative = 0
	actionValueOther = 0
	other = None
	temporaryTestChange = False 

	if optInput is not None:
		optInformation = {}
		optEntry = {}

		for line in optInput:
			invalid = False
			info = line.split()
			if(len(info) < 10):

				 

				try:
					valueNumber = float(info[1])
					if valueNumber > 0:
						#print("cost = " + info[2])
						#optEntry = {"nodeID" : info[0], "value": info[1], "cost": info[2], "actionID": info[3], "firstChildId": info[4], "valueChild": info[5], "siblingID": info[6], "valueSibling": info[7]}
						#if info[0] in nodeInformation or (info[0] in allNodes and allNodes[info[0]].isDescendantOf(rootID)):
						optEntry = {"nodeID" : info[0], "value": info[1], "cost": info[2], "actionID": info[3], "firstChildID": info[4], "valueChild": info[5], "siblingID": info[6], "valueSibling": info[7]}
						if info[0] in optInformation:
							# oI[ID][value] = optEntry 
							optInformation[info[0]][info[1]] = optEntry
						else:
							optInformation[info[0]] = {info[1]: optEntry}
					else:
						numberInvalidOPT += 1
				except ValueError:
					numberInvalidOPT += 1


				

	print("read in information for the opt table")
	print("numberInvalidOPT: " + str(numberInvalidOPT));
	optInput.close()






 




# *******************************************************************************************
# ***************                           Actions                           ***************

dams = {"0" : {"cost" : 20, "improvedPassability" : 0.2},
		"1" : {"cost" : 40, "improvedPassability" : 0.5},
		"2" : {"cost" : 100, "improvedPassability" : 1.0}}
crossings = {"0" : {"cost" : 5, "improvedPassability" : 1.0}}
actions = {"dams" : dams, "crossings" : crossings}








# *******************************************************************************************
# ***************                           Viewing                           ***************

#display = {"maxX" : maxX, "maxY" : maxY}  
display = {"maxX" : maxX, "maxY" : reducedY}  



 





 


# *******************************************************************************************
# ***************                         Final Output                        ***************
 
print("adding information together")
allInformation = { "nodeInfo" : nodeInformation, "streamInfo" : streamInformation, "actions" : actions, "displayInfo" : display } 
if whichOptTable is not 0:
	allInformation["optInfo"] = optInformation
print("formatting json")

 
if askBeforeWrite:
	answer = raw_input("Write data for human or computer? ")
else: 
	answer = "computer"

if answer == "human" or answer == "h":
	allJSON = json.dumps(allInformation, indent=4) 
elif answer == "exit":
		print("goodbye! :) ")
		exit() 
else: 
	allJSON = json.dumps(allInformation) 
#print("json data: " + allJSON)

outputFolder = ""
fileName = ""
if opt is True:
	
	outputFolder = "jsonoutput/optNetwork/"
	fileName = "BarrierAndStreamInfoOpt.json"
	print ("opt is true\n  " + outputFolder)
	#allOutput = open("jsonoutput/optNetwork/BarrierAndStreamInfoOpt.json", "w")
elif optReduced is True:
	
	outputFolder = "jsonoutput/optNetworkReduced/"
	fileName = "BarrierAndStreamInfoOptReduced.json"
	print ("optReduced is true \n  " + outputFolder)
	#allOutput = open("jsonoutput/optNetworkReduced/BarrierAndStreamInfoOptReduced.json", "w")
elif testing is True:
	
	outputFolder = "jsonoutput/testing/"
	fileName = "BarrierAndStreamInfoTesting.json"
	print ("testing is true \n  " + outputFolder)
	#allOutput = open("jsonoutput/testing/BarrierAndStreamInfoTesting.json", "w")
else:
	
	outputFolder = "jsonoutput/original/"
	fileName = "BarrierAndStreamInfoOriginal.json" 
	print ("the three switch variables are not true  \n  " + outputFolder)  
	#allOutput = open("jsonoutput/original/BarrierAndStreamInfoOriginal.json", "w")


if askBeforeWrite:
	answer = raw_input("\n\nAbout to write to %s%s. Proceed? " % (outputFolder, fileName))
else:
	answer = "yes"
if answer == "no" or answer == "n":
	answer = raw_input("change location or exit? ")
	if answer == "exit":
		print("goodbye! :) ")
		exit()
	newOutputFolder = raw_input("new folder: ") 
	newFileName = raw_input("new file name: ")

	if newOutputFolder != "n" and newOutputFolder != "":
		outputFolder = "jsonoutput/" + newOutputFolder + "/"
	if newFileName != "n" and newFileName != "":
		fileName = newFileName
	print("Writing to %s%s. " % (outputFolder, fileName)) 

allOutput = open(outputFolder + fileName, "w")

#print("writing to file in folder: " + outputFolder)    
allOutput.write(allJSON);
allOutput.close()

print("all set! :)  ") 







