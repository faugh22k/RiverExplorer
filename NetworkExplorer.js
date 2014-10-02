
/**********************************************************************************************
 *  Node class. 
 *    Stores a node in the river network, which may be a barrier or a split in the river.
 *    A node can have as many children as necessary. A child connection includes the child
 *    node and the length and accessibility of the river segment connecting the two nodes.
 *    Every node is uniquely identified by an id. 
 **********************************************************************************************/
function Node (id, isBarrier, barrierType, possibleActions, passability, x, y, children, parent){
	this.id = id;
	this.isBarrier = isBarrier; 
	// 1 crossing 2 dam
	this.barrierType = barrierType;
	this.possibleActions = possibleActions;
	this.passability = passability; // switch to see colors 0.93;   
	this.passabilityImprovement = 0.0;
	this.improvedPassability = this.passability;    
	this.x = x;
	this.y = y; 
	this.children = new Array();
	this.children[0] = new Array(); // the child node
	this.children[1] = new Array(); // the length of the stream segment to child
	this.children[2] = new Array(); // the accessibility of the stream segment to the child
	this.children[3] = new Array(); // the streamSegments path object for drawing
	this.parent = parent;
	this.selected = true;
	this.partiallySelected = false;
	this.nodeDrawing = null;
	this.needsNodeDrawing = true;
	this.needsClickListener = true;
	this.currentAction = -1;
	this.previousHabitat = -1;
	this.currentHabitat = -1;  
}
  

	/**
	 * Adds a child connection to the node. 
	 **/
	Node.prototype.addChild = function (node, length, accessibility, streamSegments){
		for (index in this.children){
			if (this.children[0][index] === node){
				// tmp error alert alert("tried to add a child twice!")
				return;
			}
		}

		this.children[0].push(node);
		this.children[1].push(length);
		this.children[2].push(accessibility); 
		this.children[3].push(streamSegments);
		node.parent = this;
	}, 

	/**
	 * Set the raphael node drawing object. 
	 **/
	Node.prototype.setDrawingNode = function (drawing){
		// tmp comment alert("In set drawing node!")
		this.nodeDrawing = drawing;
		pairedNode = this;
		this.needsNodeDrawing = false
		this.nodeDrawing.click(function(){
 			// tmp comment alert("circle clicked!\n" + pairedNode.toString());
 			dataManager.updateSelected(pairedNode);
 		}); 
	},

	/**
	 * Add the node drawing for the node and its descendants. 
	 **/
	Node.prototype.addDrawingNodes = function(count){ 
		if (this.needsNodeDrawing){
			this.needsNodeDrawing = false;
			this.nodeDrawing = paper.circle(this.x,this.y,1);
			this.nodeDrawing.attr({fill: "green"});
			console.log("adding drawing for \n" + this.toString() + "\ncount = " + count);
		} 
		
		if (count >= 2000){
			// tmp comment alert("still drawing nodes!");
			count = 0;
		}
		
		for(index in this.children[0]){
			this.children[0][index].addDrawingNodes(++count);
		}
	},

	/**
	 * Set the x,y coordinate of the node. 
	 **/
	Node.prototype.setXY = function(x,y){ 
		this.x = x; 
		this.y = y;
	},

	/**
	 * Set the action to be taken at the node and update the 
	 * improvedPassability accordingly. 
	 **/
	Node.prototype.setAction = function(action){  
		this.currentAction = action;

		if (action == -1){
			this.improvedPassability = this.passability
			this.currentAction = -1
			return;
		}

		this.improvedPassability = this.possibleActions[action].improvedPassability;
		this.currentAction = action
		this.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".90"});
		// tmp testing thing!!!!!!!!!!!!!!!!!!!!!!!!!! switch back! todo! *****
		/*if (this.improvedPassability < 0.5){
			this.improvedPassability = 0.9
		}*/
		alert("original passability: " + this.passability + "\nnew passability: " + this.improvedPassability)

	},

	/**
	 * Return a string with the node id, the id of its children, and information
	 * about passability, accessibility, and selection status.
	 **/
	Node.prototype.toString = function (){
		output = "Node " + this.id + "\n     ";  
 				       	
 		if(this.children != null && this.children[0] != null && this.children[0].length > 0){ 
			for (index in this.children[0]){
				output += this.children[0][index].id + ","
			}
		} 

		//output += "\n     "

		//for (index in this.children[0]){
		//	output += this.children[2][index].toString() + ", "
		//} 


		output += "\nselected: " + this.selected;
		output += "\npartially selected: " + this.partiallySelected;
		output += "\npassability: " + this.passability.toString();
		output += "\nactions: " + this.possibleActions;
		output += "\nisBarrier: " + this.isBarrier; 
		if (this.children[2] != undefined && this.children[2][0] != undefined){
			output += "\n\naccessibility going out: " + this.children[2][0];
		}
		return output;
	},

		/**
	 * Return a string with the node id, the id of its children, and information
	 * about passability, accessibility, and selection status.
	 **/
	Node.prototype.reportString = function (){
		output = "ID " + this.id + "\n     ";    
		output += "\npassability: " + this.improvedPassability.toString(); 
		output += "\nis a Barrier: " + this.isBarrier; 
		if(this.currentAction != -1){
			output += "\naction taken: " + this.currentAction; 
		}
		if (this.children[2] != undefined && this.children[2][0] != undefined){
			output += "\n\naccessibility going out: " + this.children[2][0];
		}
		return output;
	},

	/**
	 * Set the colors of the node drawing and the colors of stream segments
	 * leading to the child nodes; then call the function for all descendants. 
	 **/
	Node.prototype.setColors = function (){ 
		//66CCFF blue
		if (!this.selected){ 
			if(this.partiallySelected){
				//// tmp comment alert("path to root");
				// color the node
				if(!this.isBarrier){
					this.nodeDrawing.attr({fill: "#003366"/*"#33B533"*/, stroke:"transparent","opacity":".55"});
					//this.nodeDrawing.attr({fill: "green", stroke:"transparent","opacity":".50"});
				} else {
					this.nodeDrawing.attr({fill: "#669900"/*"green"*/, stroke:"transparent","opacity":".50"});
					//this.nodeDrawing.attr({fill: "#33B533", stroke:"transparent","opacity":".50"});
				}
			} else {
				//// tmp comment alert("not selected"); D4D4D4
				//this.nodeDrawing.attr({fill: "#6600FF", stroke:"transparent","opacity":".30"});  
				this.nodeDrawing.attr({fill: "#D4D4D4", stroke:"transparent","opacity":".30"});  
			} 

			for (index in this.children[0]){
				if(this.partiallySelected && (this.children[0][index].partiallySelected || this.children[0][index].selected)){
					this.children[3][index].attr({stroke:"black"}); 
				} else {
					//this.children[3][index].attr({stroke:"#7575A3"}); // grey
					this.children[3][index].attr({stroke:"#A0A0A0"}); // grey
				}  
			} 
		} else { 
			//// tmp comment alert("selected"); 
			// color the node  
			if (!this.isBarrier){
				this.nodeDrawing.attr({fill: "#003366", stroke:"transparent","opacity":".70"});
			} else {
				if (this.currentAction == -1){
					this.nodeDrawing.attr({fill: "#78c44c" /*"#6bba4e"/*"#84cd4a"/*"#60b150"/*"#40AE26"/*"#669900"/*"#33B533"*/, stroke:"transparent","opacity":"0.85"/*"1.0"*/});
				} else {
					this.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".85"});
				}
			}
			// color the paths to the children (river segments)
			for (index in this.children[0]){
				/*colorString = "" 
				accessibility = this.children[2][index]
				accessibilityIndex = accessibility * 10
				accessibilityIndex = Math.floor(accessibilityIndex)
				if (accessibilityIndex > 10){
					accessibilityIndex = 10;
				}
				//alert("index: " + accessibilityIndex + "\naccessibility: " + accessibility + "\npassability: " + this.passability)
				colorString = colors[accessibilityIndex]*/
				//colorString = "#FFFF66" 
				//tmp comment alert("setting color of node with " + this.passability + "\n" + this.toString());
				colorString = this.getColor(this.children[2][index])
				this.children[3][index].attr({stroke:colorString}); 
			}
		}

		for (index in this.children[0]){
			this.children[0][index].setColors();  
		}		 
	},  
 
 	/**
 	 * Get the appropriate color for a stream segment. 
 	 **/
	Node.prototype.getColor = function(accessibility){  
		/*accessibilityIndex = accessibility * 10
		accessibilityIndex = Math.floor(accessibilityIndex)
		if (accessibilityIndex >= colors.length){
			accessibilityIndex = colors.length - 1;
		}
		return colors[accessibilityIndex] */
		return colorScaleFunction(accessibility).hex();
	},

	/**
	 * Calculate the habitat for the node by taking to sum
	 * of each segment's accessibility times the length. 
	 **/ 
	Node.prototype.calculateHabitat = function(){
		this.previousHabitat = this.currentHabitat

		habitat = 0; 

		for (index in this.children[0]){
			if (this.children[0][index] != null){ 
				//alert("calculating habitat for children!\n***********************\n\n" + this.toString() + "\n\n***********************\nchildren[0] = " + this.children[0][index]) 
				// accessibility of stream segment * length
				habitat += this.children[2][index] * this.children[1][index];

				// add the habitat of the child
				habitat += this.children[0][index].calculateHabitat();
			} else {
				alert("for some reason, an entry in children[0]" + index.toString() + " is null in calculateHabitat. \n\n" + this.toString())
			}
		}

		this.currentHabitat = habitat;
		return habitat;
	},

	/**
	 * Calculate the accessibility of the node's child segments 
	 * by multiplying initial accessibility (comingIN) by the 
	 * passability. Then call itself for the node's descendants.  
	 **/ 
	Node.prototype.calculateAccessibility = function(comingIn){
		//alert("calculating accessibility. \ncomingIn = " + comingIn + "\npassability = " + this.passability + "\nimprovedPassability = " + this.improvedPassability + "\n\ngoing out should be: " + (comingIn*this.improvedPassability));
		if(this.isBarrier){

			//accessibility = comingIn * (this.passability + this.passabilityImprovement);
			accessibility = comingIn * this.improvedPassability; 
			colorString = this.getColor(accessibility)
			this.nodeDrawing.attr({fill: "#FF4500"/*"#33B533"*/, stroke:"transparent","opacity":".55"});
			//alert("passability: " + this.improvedPassability + "\ncoming in: " + comingIn +  	"\nheading out:" + accessibility + "\n\n" + this.toString());  
			this.nodeDrawing.attr({fill: "#1e90ff"/*"#33B533"*/, stroke:"transparent","opacity":".55"});
			for (index in this.children[0]){ 
				this.children[3][index].attr({stroke:colorString});  
			} 
		} else {
			//alert("(not a barrier)\npassability: " + this.improvedPassability + "\ncoming in: " + comingIn +  	"\nheading out:" + accessibility); 
			accessibility = comingIn;
		}
		for (index in this.children[0]){
			this.children[2][index] = accessibility;   
			//this.children[0][index].calculateAccessibility(accessibility); 
		}
		for (index in this.children[0]){
			//this.children[2][index] = accessibility;   
			//this.children[0][index].calculateAccessibility(accessibility); 
			this.children[0][index].calculateAccessibility(this.children[2][index]);   
		}
	}
 










/**********************************************************************************************
 *  DataManager class. 
 *    Manages the data of the River Network and the OPT solution data structure. 
 **********************************************************************************************/
function DataManager(networkSource, selectedNode, allNodes, OPT, budget){
	this.networkSource = [];      // in case there are multiple networks, store the roots in array
	this.selectedNode = selectedNode;
	this.OPT = OPT;
	this.budget = budget;  
	this.allNodes = allNodes;    // dictionary of all nodes indexed by node id
}  

	/**
	 * Finds the selected portion of the network, then sets each node in the 
	 * selected portion of the network to selected, partially selects the path 
	 * to the root, and deselects everything else.  
	 *
	 * (once on unselected is found, everything is treated as unselected, 
	 *  so only the first unselected node needs to be changed)
	 **/ 
	DataManager.prototype.updateSelected = function (calledFrom){ 
		alert("in updateSelected. calledFrom \n" + calledFrom.toString());  
		dataManager.markAllSelected(calledFrom); 
		dataManager.partiallyDeselect(calledFrom.parent, calledFrom); 

		dataManager.selectedNode = calledFrom;
		dataManager.updateSolution() 
	},

	/**
	 * Sets current and its descendants to selected. 
	 **/ 
	DataManager.prototype.markAllSelected = function (current){
		if (current == null){
			return null  
		}
		

		current.selected = true     

		if (current.children != null){
			for (index in current.children[0]){
				dataManager.markAllSelected(current.children[0][index])   
			}
		} else {
			// alert("children is undefined for \n" + currentID.toString())
		}

		 
		
	}, 

	/**
	 * Sets the path from current to the root to partially selected.
	 * Any offshoots from that path are set to unselected. 
	 **/
	DataManager.prototype.partiallyDeselect = function  (current, previous){
		if (current == null){
			return null;
		}

		current.selected = false;
		current.partiallySelected = true; 

		 for (index in current.children[0]){  
		 	nextNode = current.children[0][index];
		 	if(nextNode != previous){
		 		this.deselect(nextNode);
		 	}
		 } 

		 this.partiallyDeselect(current.parent, current);
		
	},

	/**
	 * Deselect current and all of its descendants. 
	 **/
	DataManager.prototype.deselect = function (current){
		if (current == null){
			return;
		}
		
		current.selected = false;
		current.partiallySelected = false; 
		
		if (current.children != null){ 
			for (index in current.children[0]){
				this.deselect(current.children[0][index]);
			}
		}
		else {
			// alert("(deselect) children is undefined for \n" + currentID.toString())
		}
	},

	/**
	 * Clear any previous passability improvement for current and its
	 * descendants. 
	 **/
	DataManager.prototype.clearPassabilityImprovement = function(current){
		current.passabilityImprovement = 0.0 
		current.improvedPassability = current.passability 
		current.currentAction = -1   

		if (current.children != null){
			for (index in current.children[0]){
				dataManager.clearPassabilityImprovement(current.children[0][index])   
			}
		}
	},

	/**
	 * Finds the solution for the current budget and selected portion
	 * and traverses the network to update the passability of the barriers
	 * and the accessibility of the river segments. 
	 **/
	DataManager.prototype.updateSolution = function (){  
		/* clear previously calculated improvements 
		 * (otherwise, if there is a node at which no action is taken, 
		 *	its information could be invalid)  */
		dataManager.clearPassabilityImprovement(dataManager.selectedNode)
		
		// access solution for selected node, budget
		start = dataManager.findSolutionStart()
		
		// go through the solution if one is found.  
		if (start != null) {
			alert("beginning to follow the solution!")
			dataManager.followSolution(start, false)
		} else {
			alert("no solution entry point found!")
		}

		// recalculate accessibility
		dataManager.selectedNode.calculateAccessibility(1.0)
		alert("recalculated accessibility")
		// reset colors
		dataManager.updateAllColors(); 
		alert("colors updated")

		// calculate accessible habitat
		dataManager.selectedNode.calculateHabitat()
		alert("current habitat:  " + dataManager.selectedNode.currentHabitat.toString() + "\nprevious habitat: " + dataManager.selectedNode.previousHabitat.toString()) 
	}, 

	/**
	 * Set the x,y coordinate of the node. 
	 **/
	DataManager.prototype.findSolutionStart = function (){ 
		closestEntry = null
		closestCost = null
		desiredID = dataManager.selectedNode.id
		entriesForNode = dataManager.OPT[desiredID]
		alert("starting node: " +  dataManager.selectedNode.toString() + "\n\nentries for node: \n" + entriesForNode)

		if (desiredID.toString() in dataManager.OPT) {
			alert("should have an entry! " + desiredID + " is in OPT!")
		} else {
			alert(desiredID + " doesn't seem to be in OPT.")
		}

		alert("our budget is " + dataManager.budget + " and we're starting from node " + desiredID)
		foundAnEntry = false
		for (key in entriesForNode) {
			entry = entriesForNode[key]
			cost = Number(entry["cost"]) 
			//alert("cost = \'" + cost + "\'\nentry['cost'] = \'" + entry["cost"] + "\'")
			//if (!isNaN(cost) && (closestCost == null || ((dataManager.budget - cost) < (dataManager.budget - closestCost)) && cost <= dataManager.budget)) {  
			if (!isNaN(cost) && ((closestCost == null && cost <= dataManager.budget) || ((dataManager.budget - cost) < (dataManager.budget - closestCost)) && cost <= dataManager.budget)) {  
				closestEntry = entry
				closestCost = cost
				alert(closestCost + " cost is closer to our budget")
				foundAnEntry = true
			}
		}
		if (!foundAnEntry){
			return null;
		} else if (closestCost == 0){
			alert("Our only found entry is for cost 0! The solution will not improve passability!!!")
			return null;
		}

		alert("returning closest entry: " + closestEntry + ", cost of " + closestCost) 
		return closestEntry
	}, 

	/**
	 * Take the action, if any, specified by start. Then follow the solution
	 * for the first child and the first sibling. 
	 * 
	 * Only follow the solution for the sibling if includeSibling is true--at 
	 * the very start of the solution (at the selected node) any action taken 
	 * in the sibling's subnetwork will be outside of the selected subnetwork. 
	 **/
	DataManager.prototype.followSolution = function(start, includeSibling){
		// *important  dataManager.allNodes[start.nodeID].passabilityImprovement = _____
		if (start == undefined || dataManager.allNodes[start.nodeID] == undefined || Number(start["value"]) <= 0){
			alert("in followSolution(). returning because solution start or node is undefined")
			return
		}

		// get the node from the dictionary of all nodes   
		currentNode = dataManager.allNodes[start.nodeID];
		action = start.actionID;
		alert("action: " + action + "    current node: \n" + currentNode.toString())
		currentNode.setAction(action)   

		//alert("taking action " + action + " at \n" + currentNode.toString() + "\nopt entry: \n" + start)

		alert("start: " + start + "\n\ncurrentNode: " + currentNode);

		//alert("the id of the child is: " +  start["firstChildID"] + "\nthe value of the child is: " +  start["valueChild"])
		if (start["firstChildID"] != "-1" && Number(start["valueChild"]) > 0){ 
			alert("following solution to actions spreading out from child!")
			child = dataManager.OPT[start["firstChildID"]][start["valueChild"]]
			dataManager.followSolution(child, true)
		} 

		/*if(includeSibling){
			alert("the id of the sibling is: " +  start["siblingID"] + "\nthe value of the sibling is: " +  start["siblingChild"])
		}*/
		if(includeSibling && [start["siblingID"]] != "-1" && Number(start["valueSibling"]) > 0){ 
			alert("following solution to actions spreading out from sibling!")
			sibling = dataManager.OPT[start["siblingID"]][start["valueSibling"]]
			dataManager.followSolution(sibling, true)
		}


	},

	/**
	 * Testing function--check to see which nodes are included in OPT
	 * and which nodes, if any, are not.  
	 **/
	DataManager.prototype.checkOPT = function(){
		/*includedNodes = ""
		for (item in this.OPT) {
			includedNodes += item + ", "
		}
		alert(includedNodes); */

		includedNodes = ""
		excludedNodes = ""
		someExcluded = false
		for (key in this.allNodes) {
			if (key in this.OPT){
				includedNodes += key + ", "
			} else {
				excludedNodes += key + ", "
				someExcluded = true
			}
		}

		alert("includedNodes: \n\n" + includedNodes)
		alert("excludedNodes: \n\n" + excludedNodes)  
 		if (someExcluded){
 			//alert("some nodes have been excluded from opt!\n\n" + excludedNodes)
 		}
	} 

	/**
	 * Update the colors for the entire network. 
	 **/ 
	DataManager.prototype.updateAllColors = function(){
		for (index in this.networkSource){
			this.networkSource[index].setColors();
		}
	},

	/**
	 * Add events to every node of each network. 
	 **/
	DataManager.prototype.addEventsToAllBranches = function(branches, method){
		for (index in branches){
			// tmp comment alert("adding events to the next branch!")
			this.addEvents(branches[index], method, 0);
		}
	},

	/**
	 * Add events to the node and all its descendants. 
	 **/
	DataManager.prototype.addEvents = function(node, method, count){
		
		if(count >= 5){
			// tmp comment alert("adding events\n" + node.toString() + "\n" + node.nodeDrawing); 
			count = -1;
		}

		if (node.needsClickListener){
			node.nodeDrawing.click(function(){
				alert(node.toString());
				//this.updateSelected();
				//method(node);
				dataManager.updateSelected(node);
			});

			node.nodeDrawing.hover(function(){
				information.innerHTML = node.reportString()   
				//information.text = "testing"
			}, function(){
				information.innerHTML = "\n\n" 
			});

			node.needsClickListener = false;
 	
			for (index in node.children[0]){ 
				this.addEvents(node.children[0][index], count + 1);
			}
		}
	},

	/**
	 * Constructs the river network from json data 
	 **/ 
	DataManager.prototype.init = function  (data){

		// construct network from json

		// use node id to store each node in a dictionary
		// go through the stream segments and add the connections
		// go through the actions and add the actions to the nodes
 
 		// parsed json
		info = data;

		streams = info.streamInfo; 
		nodes = info.nodeInfo;  
		this.OPT = info.optInfo; 
		dams = info.actions.dams
		crossings = info.actions.crossings
		alert("action options for: \ndams = " + dams + "\ncrossings = " + crossings)
 
		viewBox[0] = 5;
		viewBox[1] = 5;
		viewBox[2] = 200;//130;//800; //150;  
		viewBox[3] = 200;//130;//500; //150;   
		refreshViewBox();   
 
		/*console.log(nodes)
		console.log(streams)
		console.log(info)*/

		// read in all the nodes, creat objects for them, and store them into a dictionary. 
 		root = null;
		allNodes = {};
		numberNodes = 0;
		for (index in nodes){
			current = nodes[index];
			currentID = current.ID;
			//console.log("current barrier id = " + currentID);
			//id, isBarrier, barrierType, possibleActions, passability, x, y, children, parent
			action = null
			if(current.barrierType == 1){
				action = crossings
				//alert("action = " + action)
			} else if (current.barrierType == 2){ 
				action = dams
				//alert("action = " + action)
			}
			//} else {
			//	//alert("creating node, with " + current.barrierType + " barrierType") 
			//}
 
			allNodes[currentID] = new Node(currentID, current.isBarrier, current.barrierType, action, current.passability, 0, 0, null, null);     
			//alert("creating node with " + allNodes[currentID].passability.toString() + " passability")
 
			//alert("creating node with " + current.passability + " passability\n" + allNodes[currentID].toString());
			root = allNodes[currentID];
			numberNodes++;
		} 
		alert("\nread in the nodes. (" + numberNodes.toString() + ")\n");
		// tmp comment alert("\nread in the nodes.\n");
 


 		problems = 0;
 		successes = 0;
 		printIndicator = 0; 

 		// read in all streams and use them to form connections between the nodes. 
		for (index in streams){  
			//alert("looping through streams.")
			try { 
				//alert("stream " + index);
				current = streams[index];
				//alert("current: " + current)
				upstreamID = current.upstreamNodeID.toString();
				downstreamID = current.downstreamNodeID.toString();
				upstream = allNodes[upstreamID]; 
				downstream = allNodes[downstreamID];  


				pathDirections = "M";
				//alert("current.segments: " + current.segments)
				for (j = 0; j + 1 < current.segments.length; j+=2){ 
					if (pathDirections != "M"){
						pathDirections += "L";
					}
					pathDirections += current.segments[j];
					pathDirections += ",";
					pathDirections += current.segments[j+1]; 
				} 

				//// tmp comment alert("adding path " + downstreamID + " -> " + upstreamID + " \n" + pathDirections)
				path = paper.path(pathDirections);  
				path.attr({"stroke-width":2});


				//console.log(downstreamID + " -> " + upstreamID); 
 	
				//upstream.setXY(current.segments[0], current.segments[1]);       //testing
				//downstream.setXY(current.segments[j-2], current.segments[j-1])  //testing  
 	 		  
 	 		  	//alert("setting XY of \n" + downstream.toString() + "\n\n\n" + upstream.toString())
 	 			downstream.setXY(current.segments[0], current.segments[1]);  //normal
				upstream.setXY(current.segments[j-2], current.segments[j-1]) //normal  
 
				 //try {
				downstream.addChild(upstream, current.length, 0, path); 
				successes++;
			} catch (error) { 
				//console.log(upstreamID + " -> " + downstreamID);
				//console.log("upstream " + upstream);
				//console.log("downstream " + downstream);
				//break;
				//console.log(current)
				problems++;
			}

			printIndicator += 1;
			if (printIndicator >= 20000){
				// tmp comment alert("program alive! have processed 20000 streams since last alert.\n" + problems + " problems\n" + successes + " successes");
				printIndicator = 0;
			}
		}

		// tmp comment alert("read in the stream segments");
		console.log("\nread in the stream segments.\n");
		console.log(successes + " successful");
		console.log("(encountered " + problems + " problems along the way)");

		//var root = allNodes["0"];
		//while(root.parent != null){
		//	root = root.parent;
		//}

		// find all of the roots in the network(s)
		for (key in allNodes){
			if (allNodes[key].parent == null){
				this.networkSource.push(allNodes[key]);
			}
		}

		console.log("\nfound " + this.networkSource.length + " roots\n");
		//console.log("root " + root); 

		// finish setting up each network
		for (index in this.networkSource){
			root = this.networkSource[index];
			// tmp comment alert("setting up another branch! \n" + root);
			root.addDrawingNodes(0); 
			//alert("node with " + root.passability.toString() + " passability\n" + root.toString()) 
			root.calculateAccessibility(1.0);
			root.setColors();
			root.nodeDrawing.attr({r:2/*, fill:"blue"*/});
			
		}


		//root.addDrawingNodes(0);
		// tmp comment alert("added the drawings for the nodes!!!")
		//this.addEvents(root);
		//root.calculateAccessibility(1.0);

		//root.nodeDrawing.attr({fill: "blue"/*, r:"15"*/}); 
		//this.networkSource = root; 
		this.allNodes = allNodes; 

		this.checkOPT();

		/*viewBox[0] = 5;
		viewBox[1] = 5;
		viewBox[2] = 60;
		viewBox[3] = 60;
		refreshViewBox();*/

		alert("setup complete!")
		console.log("setup complete!")
	}  





 



/**********************************************************************************************
 *  Network Explorer
 *    Comprises the main part of the tool. 
 *    Manages the elements on the web page:
 *      Listens to the html elements on the page and responds to them.
 *        (slider, pan and  zoom buttons, clicks on canvas)
 *      Paints the River Network and the solution. 
 *    
 **********************************************************************************************/

var dataManager;
var canvas;
var context; 
var budget;
var slider;
var panInput;
var zoomInput;
var information;
var paper;
var set;
var circle;
var width;
var height;
var back;

var viewBox;
var viewRectangle;
var colors;

var mouseIsDown = false;
var mouseDownX;
var mouseDownY;
var mouseUpX;
var mouseUpY;

/**
 * Called when pan button is clicked.
 * If two valid numbers are within the pan text field ("x y")
 * translates the specified the amount. 
 **/
function translateEvent(){ 
	var arguments = panInput.value.split(" ");

	// the length is 1 if there are 2 indices in the array 
	if(arguments.length < 1){
		return;
	}

	// parses a number, which may or may not include a decimal
	var xChange = Number(arguments[0]);
	var yChange = Number(arguments[1]);
	
	translate(xChange, yChange);
	
	// NaN: not a number
	// NaN does not equal itself, so isNaN is needed to make sure there are 
	// 2 valid numbers. 
	/* moved to translate()
	if (!isNaN(xChange) && !isNaN(yChange)) {  
		viewBox[0] += xChange;
		viewBox[1] += yChange;
		viewBox[2] += xChange;
		viewBox[3] += yChange;
		refreshViewBox();
	};*/
}

function translate(xChange, yChange){
	// NaN: not a number
	// NaN does not equal itself, so isNaN is needed to make sure there are 
	// 2 valid numbers. 
	if (!isNaN(xChange) && !isNaN(yChange)) {  
		viewBox[0] += xChange;
		viewBox[1] += yChange;
		viewBox[2] += xChange;
		viewBox[3] += yChange;
		refreshViewBox();
	};
}

/** 
 * Called when the zoom button is clicked. 
 * If the zoom text field contains a valid number, scales
 * the canvas the specified amount. 
 **/ 
function zoomEvent(){ 
	var factor = Number(zoomInput.value);
	
	zoom(factor)
	//if(!isNaN(factor)){
	//	xRange = viewBox[2] - viewBox[0];
	//	yRange = viewBox[3] - viewBox[1];

	//	xRange = xRange / factor; 
	//	viewBox[2] = viewBox[0] + xRange;
	//	yRange = yRange / factor;
	//	viewBox[3] = viewBox[1] + yRange;
	//	refreshViewBox();

		/*width *= factor;
		height *= factor;
		// Change the widht and the height attributes manually through DOM
		$('#canvas').attr('width', width).attr('height', height); */
	//}	 
}

function zoom(factor){
	if(!isNaN(factor)){
		xRange = viewBox[2] - viewBox[0];
		yRange = viewBox[3] - viewBox[1];

		xRange = xRange / factor; 
		viewBox[2] = viewBox[0] + xRange;
		yRange = yRange / factor;
		viewBox[3] = viewBox[1] + yRange;
		refreshViewBox();
	}
}

/**
 * Updates Raphael/SVG's viewbox properties to shift the visible portion of the canvas.
 **/
function refreshViewBox(){
	svg = document.getElementsByTagName("svg")[0];
	//svg.viewBox = viewBox[0].toString() + " " + viewBox[1].toString() + " " + viewBox[2].toString() + " " + viewBox[3].toString() + " ";   
	svg.setAttribute("viewBox", viewBox[0].toString() + " " + viewBox[1].toString() + " " + viewBox[2].toString() + " " + viewBox[3].toString() + " ");   
	
	w = viewBox[2] - viewBox[0];
	h = viewBox[3] - viewBox[1];
	paper.setViewBox(0 - viewBox[0], 0 - viewBox[1], w, h); 
 
	//viewRectangle.attr({x:viewBox[0], y:viewBox[1], w:(viewBox[2]-viewBox[0]), h:(viewBox[3]-viewBox[1])})
}

 


/**
 * Responds a change in the budget slider (once user has stopped dragging the handle)
 **/
function updateBudget(){
	// tmp comment alert("budget changing!");
	if(dataManager.budget == slider.value){
		// tmp comment alert("actually, the budget is the same!");
	} else {
		dataManager.budget = slider.value;
		dataManager.updateSolution();
	}
}
 
 

/**
 * Starts the program, though is not called automatically by javascript. 
 *
 * Initializes variables for NetworkExplorer and adds listeners to items
 * on the webpage. 
 **/ 
function main(){ 
	//colors = ['#ffff99', '#cff992', '#b1eda3', '#9cddb7', '#88cdcb', '#78bcdb', '#66abe8', '#549af3', '#4089fa', '#2877fe', '#0066ff']

	colorScaleFunction = chroma.interpolate.bezier(['#223535', 'darkslategray', 'teal', 'cornflowerblue', 'deepskyblue']) 
		//(['lightyellow', 'yellowgreen', 'turquoise', 'dodgerblue'])
		//(['lightyellow', 'greenyellow', 'turquoise', 'dodgerblue'])
		//(['lightyellow', 'yellowgreen', 'deepskyblue', 'dodgerblue'])
		
		// blue to gray: each subsequent entry goes to a darker gray
		//(['darkslategray', 'teal', 'cornflowerblue', 'deepskyblue']) 
		//(['#223535', 'darkslategray', 'teal', 'cornflowerblue', 'deepskyblue'])
		//(['#1c2929', 'darkslategray', 'teal', 'cornflowerblue', 'deepskyblue']) 


	// store a reference to the canvas, get the context for drawing,
	// and add a mouse listener 
	width = 752;//470;
	height = 470; 

	viewBox = [0, 0, 3000, 3000];
	//viewBox = [0, 0, 80, 80];



//=======================================================================================
//========================= Mouse Events ================================================
//=======================================================================================

// On window load, add a bunch of listeners for mouse events
$(window).load(function () {

        var canvas = document.getElementById("canvas");

        // Action performed when mouse button if pressed down
        var mouseDownListener = function(event){

        	console.log("mouse down");

            mouseIsDown = true;
            mouseDownX = event.pageX;
            mouseDownY = event.pageY;

            console.log("initial position :" + mouseDownX + " and " + mouseDownY);
        };

        // Action performed when mouse button is released
        var mouseUpListener = function(event)
        {
        	console.log("mouse up");
        	mouseIsDown = false;
        }

        // Action performed when mouse is moving
        var mouseMoveListener = function(event)
        {
        	// Do nothing unless dragging
        	if(mouseIsDown)
        	{
        		console.log("dragging");

        		var currentx = event.pageX;
        	    var currenty = event.pageY;

        	    translate(0.5*(currentx - mouseDownX), 0.5*(currenty - mouseDownY));

        	    mouseDownX = currentx;
        	    mouseDownY = currenty;
        	}
        }

        // Action performed when mouse scroll is scrolled
        var mouseZoomListener = function(event)
        {
        	  /* we want to prevent document scrolling when pressing the arrows: */
		    event.preventDefault();

		    // Delta returns +120 when up and -120 when down 
		    // There might be some browser issues according to online sources
		    // For now it works for chrome
            if (event.wheelDelta >= 120)
            	{zoom(1.1);}
    		else if (event.wheelDelta <= -120)
            	{zoom(0.9);}

        }

        // Adding all the listeners for mouse events: down, up, move, scroll
        canvas.addEventListener("mousedown",mouseDownListener,false);
        canvas.addEventListener("mouseup", mouseUpListener,false);
        canvas.addEventListener("mousemove", mouseMoveListener, false);
        canvas.addEventListener('mousewheel', mouseZoomListener, false);      
    });

//=======================================================================================
//=========================End of Mouse Events ==========================================
//=======================================================================================	

	 
paper = new Raphael(document.getElementById('canvas'), width, height); 
	/*paper.drag(function(dx, dy, x, y, dragMove){console.log("moving!: change x,y" + dx + "," + dy)},
		function(x, y, dragStart){console.log("start of mouse drag!!!!!!!!!!!!!"); alert("start drag")},
		function(dragEnd){console.log("finished mouse drag!!!!!!!!!!!!"); alert("stopped drag")});
	*/

	// paper.canvas.mousemove(function(e) {
	//   var offset = $(this).offset(), offsetX = e.pageX - offset.left, offsetY = e.pageY - offset.top;
	//   //do something with offsetX and offsetY
	//   console.log("moving");

	// });

	$(document).keydown(function(event) {
	

		/* since we are using jquery, the event is already normalize */
		var arrowKeys = {"left": 37, "up": 38, "right": 39, "down": 40, "plus": 187, "minus": 189};
		if(event.keyCode == arrowKeys["left"]) {
		translate(10, 0)
		}
		else if(event.keyCode == arrowKeys["up"]) {
			translate(0, 10)			
		}
		else if(event.keyCode == arrowKeys["right"]) {
			translate(-10, 0)
		}
		else if(event.keyCode == arrowKeys["down"]) {
			translate(0, -10) 
		} 
		else if(event.keyCode == arrowKeys["plus"]){
			zoom(1.1) 
		} 
		else if(event.keyCode == arrowKeys["minus"]){
			zoom(0.9)
		}
	
		/* we want to prevent document scrolling when pressing the arrows: */
		event.preventDefault();
	
	});
	
	//paper.setViewBox(0, 0, width, height );
	refreshViewBox();
 
	// Setting preserveAspectRatio to 'none' lets you stretch the SVG
	paper.canvas.setAttribute('preserveAspectRatio', 'none');
 
	// initialize DataManager instance
	dataManager = new DataManager(null, null, null, null);  
	//dataManager.init();


	// add click listeners to the zoom and pan buttons
	document.getElementById("pan").onclick = translateEvent; 
	document.getElementById("zoom").onclick = zoomEvent;  

	// stores reference to the budget slider and adds a change listener
	slider = document.getElementById("budgetSlider");
	slider.onchange = updateBudget;
	//// tmp comment alert("after slider");

	// stores references to the zoom and pan text fields 
	panInput = document.getElementById("panInput");
	zoomInput = document.getElementById("zoomInput");

	information = document.getElementById("information");

	// initializes budget value. 
	slider.value = 0;
	slider.max = 32000000;
	dataManager.budget = slider.value;

	// change data source **
	//$.get("BarrierAndStreamInfo.json", dataManager.init);
	//$.get("BarrierAndStreamInfoOptNetwork.json", function(data){
	//$.get("BarrierAndStreamInfoOptNetworkReduced.json", function(data){  
	$.get("BarrierAndStreamInfoOptNetworkReduced2.json", function(data){    
	//$.get("BarrierAndStreamInfoReduced.json", function(data){
	//$.get("BarrierAndStreamInfoSuperReduced.json", function(data){
	//$.get("BarrierAndStreamInfo.json", function(data){
		dataManager.init(data);
		dataManager.addEventsToAllBranches(dataManager.networkSource, dataManager.updateSelected);
		// tmp comment alert("finished setting things up!")
	});
	//$.get("BarrierAndStreamInfoReduced.json", function(data){
	//	dataManager.init(data);
	//	dataManager.addEvents(dataManager.networkSource, dataManager.updateSelected);
	//});
	//$.get("BarrierAndStreamInfoReduced.json", dataManager.init);
  
}
 
// start everything!    
main(); 
