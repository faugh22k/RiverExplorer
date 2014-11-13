
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
	this.originalHabitat = -1;
	this.currentHabitat = -1;  
	this.requireRepaint = true;
}
  

	/**
	 * Adds a child connection to the node. 
	 **/
	Node.prototype.addChild = function (node, length, accessibility, streamSegments){
		//temporary
		/*for (index in this.children){
			if (this.children[0][index] === node){
				// tmp error alert alert("tried to add a child twice!")
				return;
			}
		}*/

		this.children[0].push(node);
		this.children[1].push(length);
		this.children[2].push(accessibility); 
		this.children[3].push(streamSegments);
		node.parent = this;
	}, 

	Node.prototype.hasChild = function (node){
		for (index in this.children){
			if (this.children[0][index] === node){
				return true;
			}
		}
		return false;
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
			//tmpconsole.log("adding drawing for \n" + this.toString() + "\ncount = " + count);
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
		this.currentAction = action 
		previousPassability = this.improvedPassability 

		if (action == -1){
			this.improvedPassability = this.passability
			this.currentAction = -1
			//return;
		}

		else if (this.possibleActions == null){
			console.log("problem: tried to set action " + action + " of node " + this.toString()
				+ "\n\npossibleActions = " + this.possibleActions)
			this.improvedPassability = this.passability
			this.currentAction = -1
			//return
		}

		else { 

			this.improvedPassability = this.possibleActions[action].improvedPassability 
			this.currentAction = action
			this.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".90"})  
		} 

		if (previousPassability != this.improvedPassability){
			this.requireRepaint = true
		}

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
		output = "ID " + this.id + "<br>";    
		if (this.isBarrier){ 
			if (this.barrierType == 1){
				output += "Crossing <br>";
			} else if (this.barrierType == 2){
				output += "Dam <br>";
			}
			output += "passability: " + this.passability.toFixed(3) + "<br>";  
			if(this.currentAction != -1){
				output += "\naction taken: " + this.currentAction + "<br>"; 
				output += "improved passability: " + this.improvedPassability.toFixed(3) + "<br>";   
			}
		}
		
		if (this.children[2] != undefined && this.children[2][0] != undefined){
			output += "\n\naccessibility going out: " + this.children[2][0].toFixed(3) + "<br>";

			output += "children: "
			for (index in this.children[0]){
				output += this.children[0][index].id + ", "
			}
			output += "<br>"
		}

		output += "selected: " + this.selected + "<br>"
		output += "partiallySelected: " + this.partiallySelected + "<br>"
		output += "repaint? " + this.requireRepaint
		return output;
	},

	Node.prototype.setSelection = function (selected){
		if (this.selected != selected){
			this.requireRepaint = true
			this.selected = selected
			//this.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".85"});

		}
	},

	Node.prototype.setPartialSelection = function (partiallySelected){
		if (this.partiallySelected != partiallySelected){
			this.requireRepaint = true
			this.partiallySelected = partiallySelected 
			//this.nodeDrawing.attr({fill: "#66FF66", stroke:"transparent","opacity":".85"});
		}
	},

	/**
	 * Set the colors of the node drawing and the colors of stream segments
	 * leading to the child nodes; then call the function for all descendants. 
	 **/
	Node.prototype.setColors = function (){ 
		if (!this.selected && !this.partiallySelected && !this.requireRepaint){
			//return
		}

		//66CCFF blue
		if (!this.selected){ 
			this.colorUnselected() 
		} else { 
			this.colorSelected() 
		}

		for (index in this.children[0]){
			this.children[0][index].setColors();  
		}		 
		this.requireRepaint = false
	},  

	Node.prototype.colorSelected = function() {
		if (!this.requireRepaint){ 
			return  
		}

		// selected
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
			colorString = this.getColor(this.children[2][index])
			this.children[3][index].attr({stroke:colorString}); 
		}
	},

	Node.prototype.colorUnselected = function() {
		if (!this.requireRepaint){ 
			return    
		} 

		if(this.partiallySelected){
			// on the path to the root
			// color the node
			if(!this.isBarrier){
				this.nodeDrawing.attr({fill: "#003366", stroke:"transparent","opacity":".55"}); 
			} else {
				this.nodeDrawing.attr({fill: "#669900", stroke:"transparent","opacity":".50"}); 
			}
		} else {
			// unselected
			this.nodeDrawing.attr({fill: "#D4D4D4", stroke:"transparent","opacity":".30"});  
		} 
 
		for (index in this.children[0]){  
			// if this and the child are partiallySelected, color the stream black (path to root)
			if(this.partiallySelected && (this.children[0][index].partiallySelected || this.children[0][index].selected)){
				this.children[3][index].attr({stroke:"black"}); 
			} else { 
				this.children[3][index].attr({stroke:"#A0A0A0"}); // grey
			}  
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
	Node.prototype.calculateHabitat = function(isOriginal){
		this.previousHabitat = this.currentHabitat

		habitat = 0; 

		for (index in this.children[0]){
			if (this.children[0][index] != null){ 
				//alert("calculating habitat for children!\n***********************\n\n" + this.toString() + "\n\n***********************\nchildren[0] = " + this.children[0][index]) 
				// accessibility of stream segment * length
				habitat += this.children[2][index] * this.children[1][index];

				// add the habitat of the child
				habitat += this.children[0][index].calculateHabitat(isOriginal);
			} else {
				alert("for some reason, an entry in children[0]" + index.toString() + " is null in calculateHabitat. \n\n" + this.toString())
			}
		}

		if (isOriginal)
			this.originalHabitat = habitat
		this.currentHabitat = habitat;
		return habitat;
	},

	/**
	 * Calculate the accessibility of the node's child segments 
	 * by multiplying initial accessibility (comingIN) by the 
	 * passability. Then call itself for the node's descendants.  
	 **/ 
	Node.prototype.calculateAccessibility = function(comingIn){
		originalAccessibility = -1
		compare = false
		if (this.children != null && this.children[2][0] != null){
			originalAccessibility = this.children[2][0]
			compare = true
		}

		//alert("calculating accessibility. \ncomingIn = " + comingIn + "\npassability = " + this.passability + "\nimprovedPassability = " + this.improvedPassability + "\n\ngoing out should be: " + (comingIn*this.improvedPassability));
		if(this.isBarrier){

			//accessibility = comingIn * (this.passability + this.passabilityImprovement);
			accessibility = comingIn * this.improvedPassability; 
			colorString = this.getColor(accessibility)
			this.nodeDrawing.attr({fill: "#FF4500"/*"#33B533"*/, stroke:"transparent","opacity":".55"});
			//alert("passability: " + this.improvedPassability + "\ncoming in: " + comingIn +  	"\nheading out:" + accessibility + "\n\n" + this.toString());  
			this.nodeDrawing.attr({fill: "#1e90ff"/*"#33B533"*/, stroke:"transparent","opacity":".55"});
			//for (index in this.children[0]){ 
			//	this.children[3][index].attr({stroke:colorString});  
			//} 
		} else {
			//alert("(not a barrier)\npassability: " + this.improvedPassability + "\ncoming in: " + comingIn +  	"\nheading out:" + accessibility); 
			accessibility = comingIn;
		}

		if (compare && originalAccessibility != accessibility){
			this.requireRepaint = true
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
		//dataManager.markAllSelected(calledFrom); 
		// the root of the network containing calledFrom is returned 
		activeRoot = dataManager.partiallyDeselect(calledFrom.parent, calledFrom); 
		dataManager.markAllSelected(calledFrom); 

		// deselect nodes that are parts of unconnected networks. 
		alert("deselecting networks separate from the partially selected one.")
		for (index in dataManager.networkSource){ 
			root = dataManager.networkSource[index]
			//alert("changing colors of other networks " + root)
			if (root != activeRoot){
				alert("current root: \n" + root.toString() + "\n\nactive root: \n" + activeRoot.toString())
				dataManager.deselect(root);
			}
		}

		dataManager.selectedNode = calledFrom;
		alert("updated selection!") 
		dataManager.updateSolution() 
	},

	/**
	 * Sets current and its descendants to selected. 
	 **/ 
	DataManager.prototype.markAllSelected = function (current){
		if (current == null){
			return null  
		}
		

		//current.selected = true     
		current.setSelection(true)
		current.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".85"});

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

		//current.selected = false;
		//current.partiallySelected = true; 
		current.setSelection(false)  
		current.setPartialSelection(true)  
		//current.nodeDrawing.attr({fill: "#66FF66", stroke:"transparent","opacity":".85"});
		//current.nodeDrawing.attr({fill: "#003366", stroke:"transparent","opacity":".70"});

		 for (index in current.children[0]){  
		 	nextNode = current.children[0][index];
		 	if(nextNode != previous){
		 		this.deselect(nextNode); 
		 		nextNode.nodeDrawing.attr({fill: "#FF4D4D", stroke:"transparent","opacity":".70"});
		 	} else {
		 		nextNode.nodeDrawing.attr({fill: "#66FF66", stroke:"transparent","opacity":".85"});
		 	}
		 } 

		if (current.parent != null){ 
			return this.partiallyDeselect(current.parent, current);  
		}
		return current;
	},

	/**
	 * Deselect current and all of its descendants. 
	 **/
	DataManager.prototype.deselect = function (current){
		if (current == null){
			return;
		}
		
		//current.selected = false;
		//current.partiallySelected = false; 
		current.setSelection(false)  
		current.setPartialSelection(false)  
		current.nodeDrawing.attr({fill: "#9966FF", stroke:"transparent","opacity":".85"});
		
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

	DataManager.prototype.createSummary = function(){
		original = parseInt(this.selectedNode.originalHabitat)
		current = parseInt(this.selectedNode.currentHabitat)
		gain = current - original

		output = "current budget: " + dataManager.budget + "<br>"
		output += "<br>" 
		output += "orginal habitat: " + (this.selectedNode.originalHabitat).toFixed(2) + "<br>"  
		output += "current habitat: " + (this.selectedNode.currentHabitat).toFixed(2) + "<br>"   
		output += "habitat gain: " + gain.toString()   
		return output
	}

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
		dataManager.selectedNode.calculateHabitat(false)
		alert("current habitat:  " + dataManager.selectedNode.currentHabitat.toString() + "\nprevious habitat: " + dataManager.selectedNode.previousHabitat.toString()) 

		summary.innerHTML = dataManager.createSummary() 
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
				//alert(closestCost + " cost is closer to our budget")
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
		//solution ** alert("action: " + action + "    current node: \n" + currentNode.toString())
		currentNode.setAction(action)   

		//alert("taking action " + action + " at \n" + currentNode.toString() + "\nopt entry: \n" + start)

		//solution ** alert("start: " + start + "\n\ncurrentNode: " + currentNode);

		//alert("the id of the child is: " +  start["firstChildID"] + "\nthe value of the child is: " +  start["valueChild"])
		if (start["firstChildID"] != "-1" && Number(start["valueChild"]) > 0){ 
			// solution ** alert("following solution to actions spreading out from child!")
			child = dataManager.OPT[start["firstChildID"]][start["valueChild"]]
			dataManager.followSolution(child, true)
		} 

		/*if(includeSibling){
			alert("the id of the sibling is: " +  start["siblingID"] + "\nthe value of the sibling is: " +  start["siblingChild"])
		}*/
		if(includeSibling && [start["siblingID"]] != "-1" && Number(start["valueSibling"]) > 0){ 
			//solution ** alert("following solution to actions spreading out from sibling!")
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

			// adds hover functions: the first called during hover; the second,
			// when hover stops.   
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
		//alert("action options for: \ndams = " + dams + "\ncrossings = " + crossings)
 
 		displayInfo = info.displayInfo 
 		alert("maxX: " + displayInfo.maxX + "\nmaxY: " + displayInfo.maxY)
 		console.log("maxX: " + displayInfo.maxX + "\nmaxY: " + displayInfo.maxY) 
		viewBox[2] = displayInfo.maxX + 10
		viewBox[3] = displayInfo.maxY + 10

		screenWidth = canvas.offsetWidth
		screenHeight = canvas.offsetHeight 

		displayWidth = viewBox[2] - viewBox[0]
		displayHeight = viewBox[3] - viewBox[1]

		originalXRatio = screenWidth/displayWidth
		originalYRatio = screenHeight/displayHeight

		//originalXRatio = originalXRatio/2.7 
		//originalYRatio = originalYRatio/2.7  

		//viewBox[0] = 5;
		//viewBox[1] = 5;
		//viewBox[2] = 500;//200;//130;//800; //150;  
		//viewBox[3] = 500;//200;//130;//500; //150;   
		refreshViewBox();   
 
		/*//tmpconsole.log(nodes)
		//tmpconsole.log(streams)
		//tmpconsole.log(info)*/  

		// read in all the nodes, create objects for them, and store them into a dictionary. 
 		root = null;
		allNodes = {};
		numberNodes = 0;
		for (index in nodes){
			current = nodes[index];
			currentID = current.ID; 

			semiRelevant = false
			relevant = false 
 
			//id, isBarrier, barrierType, possibleActions, passability, x, y, children, parent
			action = null
			if(current.barrierType == 1){
				action = crossings
				//alert("action = " + action)
			} else if (current.barrierType == 2){ 
				action = dams
				//alert("action = " + action)
			} 
 
 			newNode = new Node(currentID, current.isBarrier, current.barrierType, action, current.passability, 0, 0, null, null);         
			allNodes[currentID] = newNode

			if (newNode == null){
				alert("newly created node " + currentID + " is null!")
			}
			if (allNodes[currentID] == null){
				alert("allNodes[currentID] for newly created node " + currentID + " is null!")
			} 
  
			root = allNodes[currentID];
			numberNodes++;
		} 
		alert("\nread in the nodes. (" + numberNodes.toString() + ")\n"); 
  

 		problems = 0;
 		successes = 0;
 		printIndicator = 0;   

 		nodesMissingReport = ""

 		// read in all streams and use them to form connections between the nodes. 
		for (index in streams){   
			try {  
				current = streams[index]; 
				upstreamID = current.upstreamNodeID.toString();
				downstreamID = current.downstreamNodeID.toString();
				upstream = allNodes[upstreamID]; 
				downstream = allNodes[downstreamID];  

				if (upstream == null){
					upstream = new Node(upstreamID, false, -1, null, 1.0, 0, 0, null, null)
					allNodes[upstreamID] = upstream
					nodesMissingReport += upstreamID + "\n"
				}
				if (downstream == null){
					downstream = new Node(downstreamID, false, -1, null, 1.0, 0, 0, null, null)
					allNodes[downstreamID] = downstream
					nodesMissingReport += upstreamID + "\n"
				}

 
				/*if (downstream.hasChild(upstream)){
					continue;
				} */

				pathDirections = "M"; 
				for (j = 0; j + 1 < current.segments.length; j+=2){ 
					if (pathDirections != "M"){
						pathDirections += "L";
					}
					pathDirections += current.segments[j];
					pathDirections += ",";
					pathDirections += current.segments[j+1]; 
				} 
 
				path = paper.path(pathDirections);  
				path.attr({"stroke-width":2});
				path.attr({stroke:"#FF4D4D"}); 
 				


				////tmpconsole.log(downstreamID + " -> " + upstreamID);  
 	 		  
 	 		  	//alert("setting XY of \n" + downstream.toString() + "\n\n\n" + upstream.toString())
 	 			downstream.setXY(current.segments[0], current.segments[1]);  //normal
				upstream.setXY(current.segments[j-2], current.segments[j-1]) //normal  
  
				downstream.addChild(upstream, current.length, 0, path);  
				successes++;
			} catch (error) { 
				////tmpconsole.log(upstreamID + " -> " + downstreamID);
				////tmpconsole.log("upstream " + upstream);
				////tmpconsole.log("downstream " + downstream);
				//break;
				////tmpconsole.log(current)
				problems++;
			}

			

			printIndicator += 1;
			if (printIndicator >= 20000){
				// tmp comment alert("program alive! have processed 20000 streams since last alert.\n" + problems + " problems\n" + successes + " successes");
				printIndicator = 0;
			}
		}
		
		console.log("missing: " + nodesMissingReport)
		// tmp comment alert("read in the stream segments");
		console.log("\nread in the stream segments.\n");
		console.log(successes + " successful");
		console.log("(encountered " + problems + " problems along the way)");
 
		// find all of the roots in the network(s)
		for (key in allNodes){
			if (allNodes[key].parent == null){
				this.networkSource.push(allNodes[key]);
			}
		}

		alert("\nfound " + this.networkSource.length + " roots\n");
		////tmpconsole.log("root " + root); 
 
		// finish setting up each network
		for (index in this.networkSource){ 
			root = this.networkSource[index];
			// tmp comment alert("setting up another branch! \n" + root);

			if (index % 10 == 0){
				alert("setting up another branch! (" + index + "th) \n" + root);
			}

			root.addDrawingNodes(0); 
			//alert("node with " + root.passability.toString() + " passability\n" + root.toString()) 
			root.calculateAccessibility(1.0);
			root.calculateHabitat(true);
			this.deselect(root)
			root.setColors();
			root.nodeDrawing.attr({r:2/*, fill:"blue"*/});
			this.selectedNode = root; 
			
		}

		this.markAllSelected(this.selectedNode)
		this.selectedNode.setColors(); 
		this.allNodes = allNodes;  
		summary.innerHTML = this.createSummary()  

		this.checkOPT(); 

		viewBox[0] = -283.05631288504526
		viewBox[1] = -172.02534530159937
		viewBox[2] = -195.8833291059239
		viewBox[3] = -87.29966458999581
		refreshViewBox()

		alert("setup complete!")
		//tmpconsole.log("setup complete!")
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
var information;
var summary;
var paper;
var set;
var circle;
var width;
var height;
var back;

var viewBox;
var originalXRatio; 
var originalYRatio; 
var viewRectangle;
var colors;

var mouseIsDown = false;
var mouseDownX;
var mouseDownY;
var mouseUpX;
var mouseUpY; 

/** 
 * If two valid numbers are given, translates the specified the amount. 
 **/
function translate(xChange, yChange){
	// NaN: not a number
	// NaN does not equal itself, so isNaN is needed to make sure there are 
	// 2 valid numbers. 
	if (!isNaN(xChange) && !isNaN(yChange)) {  
	    screenWidth = canvas.offsetWidth
		screenHeight = canvas.offsetHeight

		console.log("screenWidth: " + screenWidth + "\nscreenHeight: " + screenHeight)

		displayWidth = viewBox[2] - viewBox[0]
		displayHeight = viewBox[3] - viewBox[1]

		console.log("displayWidth: " + displayWidth + "\ndisplayHeight: " + displayHeight)

		widthDifference = screenWidth/displayWidth 
		heightDifference = screenHeight/displayHeight 

		console.log("widthDifference: " + widthDifference + "\nheightDifference: " + heightDifference)

		xRatioChange = widthDifference/originalXRatio
		yRatioChange = heightDifference/originalYRatio

		//xRatioChange = xRatioChange/0.9
		//yRatioChange = yRatioChange/0.9

		console.log("originalXRatio: " + originalXRatio + "\noriginalYRatio: " + originalYRatio) 

		console.log("xRatioChange: " + xRatioChange + "\nyRatioChange: " + yRatioChange) 
 		 
		xChange = xChange/xRatioChange
		yChange = yChange/yRatioChange

		console.log("xChange: " + xChange + "\nyChange: " + yChange) 

		viewBox[0] += xChange;
		viewBox[1] += yChange;
		viewBox[2] += xChange;
		viewBox[3] += yChange;
		refreshViewBox();
	};
}

 

function zoomIn()
{
	zoom(1.1);
}

function zoomOut()
{
	zoom(0.9);
}
function zoom(factor){
	/*if(!isNaN(factor)){
		xRange = viewBox[2] - viewBox[0]  
		yRange = viewBox[3] - viewBox[1]  

		xRange = xRange / factor; 
		leftX = viewBox[0]
		rightX = viewBox[2]
		originalWidth = rightX - leftX
		widthChange = xRange - originalWidth
		leftX += widthChange/2.0
		rightX = leftX + xRange 
		
		//viewBox[2] = viewBox[0] + xRange;
		viewBox[0] = leftX
		viewBox[2] = rightX

		yRange = yRange / factor;
		topY = viewBox[1]
		bottomY = viewBox[3]
		originalWidth = bottomY - topY
		heightChange = yRange - originalWidth
		topY += heightChange/2.0
		bottomY = topY + yRange 
		//viewBox[3] = viewBox[1] + yRange;
		viewBox[1] = topY
		viewBox[3] = bottomY
		refreshViewBox();
	}

	if(!isNaN(factor)){ 
		width = viewBox[2] - viewBox[0]
		height = viewBox[3] - viewBox[1]

		xChange = width/2
		yChange = height/2

		viewBox[0] += xChange;
		viewBox[1] += yChange;
		viewBox[2] += xChange;
		viewBox[3] += yChange;


		width = width/factor
		height = height/factor

		viewBox[2] = viewBox[0] + width
		viewBox[3] = viewBox[1] + height

		viewBox[0] -= xChange;
		viewBox[1] -= yChange;
		viewBox[2] -= xChange;
		viewBox[3] -= yChange;

		refreshViewBox();
	}*/

	if(!isNaN(factor)){ 
		leftX = viewBox[0]
		rightX = viewBox[2]
		topY = viewBox[1]
		bottomY = viewBox[3]

		width = rightX - leftX
		height = bottomY - topY 

		newWidth = width / factor
		newHeight = height / factor

		widthChange = newWidth - width
		heightChange = newHeight - height

		xChange = widthChange/2 
		yChange = heightChange/2

		leftX += xChange
		topY += yChange

		rightX = leftX + newWidth
		bottomY = topY + newHeight

		viewBox[0] = leftX
		viewBox[1] = topY
		viewBox[2] = rightX
		viewBox[3] = bottomY

		refreshViewBox();
	}
}

/**
 * Updates Raphael/SVG's viewbox properties to shift the visible portion of the canvas.
 **/
function refreshViewBox(){
	svg = document.getElementsByTagName("svg")[0];
	//svg.viewBox = viewBox[0].toString() + " " + viewBox[1].toString() + " " + viewBox[2].toString() + " " + viewBox[3].toString() + " ";   
	
	// view box: leftX, topY, rightX, bottomY   
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

	viewBox = [5, 5, 3000, 3000];
	//viewBox = [0, 0, 80, 80];



	//=======================================================================================
	//========================= Mouse Events ================================================
	//=======================================================================================

	// On window load, add a bunch of listeners for mouse events
	$(window).load(function () {

	    xRange = viewBox[2] - viewBox[0];
		yRange = viewBox[3] - viewBox[1];

		var xScale = xRange/3000;
		var yScale = yRange/3000;

		var xChange = 0;
		var yChange = 0;
		var currentx = 0;
		var currenty = 0;
        var canvas = document.getElementById("canvas");

        // Action performed when mouse button if pressed down
        var mouseDownListener = function(event){

        	//tmpconsole.log("mouse down");

            mouseIsDown = true;
            mouseDownX = event.pageX;
            mouseDownY = event.pageY;



            //tmpconsole.log("initial position :" + mouseDownX + " and " + mouseDownY);
        };

        // Action performed when mouse button is released
        var mouseUpListener = function(event)
        {
        	//tmpconsole.log("mouse up");
        	
        	mouseIsDown = false;
        }

        // Action performed when mouse is moving
        var mouseMoveListener = function(event)
        {
        	// Do nothing unless dragging
        	if(mouseIsDown)
        	{
        		//tmpconsole.log("dragging");  

        		currentx = event.pageX ;
        	    currenty = event.pageY ;

        	    xChange = currentx - mouseDownX;
        	    yChange = currenty - mouseDownY;
        	    mouseDownX = currentx;
        	    mouseDownY = currenty;

        		//translate(xChange*xScale*0.5,yChange*yScale*0.5);
        		translate(xChange,yChange);

            //tmpconsole.log("xChange:" + xChange + " and yChange   " + yChange);
                        //tmpconsole.log("viewbox xrange   :" + xRange + " and yRange   " + yRange);



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

        var mouseDragListener = function(event)
        {
        	//tmpconsole.log("dragging");
        		var currentx = event.pageX;
        	    var currenty = event.pageY;

        	    var xChange = currentx - mouseDownX;
        	    var yChange = currenty - mouseDownY;
        	    //tmpconsole.log("xChange  :" + xChange + " and \n yChange   :" + yChange);
      		    //tmpconsole.log("current position :" + currentx + " and " + currenty);
      		    //tmpconsole.log("xScale  :" + xScale + " and yScale : " + yScale);
  
        	    //translate(xChange-w,yChange-h);
        	    translate(xChange,yChange);

        	    mouseDownX = currentx;
        	    mouseDownY = currenty;

        }

        //Adding all the listeners for mouse events: down, up, move, scroll
        canvas.addEventListener("mousedown",mouseDownListener,false);
        canvas.addEventListener("mouseup", mouseUpListener,false);
        canvas.addEventListener("mousemove", mouseMoveListener, false);
        canvas.addEventListener('mousewheel', mouseZoomListener, false); 
        //canvas.addEventListener('mousedrag', mouseDragListener, false);

    });

	//=======================================================================================
	//=========================End of Mouse Events ==========================================
	//=======================================================================================	

	canvas = document.getElementById('canvas') 
	paper = new Raphael(document.getElementById('canvas'), width, height); 
	//paper = new Raphael(canvas, width, height); 
	/*paper.drag(function(dx, dy, x, y, dragMove){//tmpconsole.log("moving!: change x,y" + dx + "," + dy)},
		function(x, y, dragStart){//tmpconsole.log("start of mouse drag!!!!!!!!!!!!!"); alert("start drag")},
		function(dragEnd){//tmpconsole.log("finished mouse drag!!!!!!!!!!!!"); alert("stopped drag")});
	*/

	// paper.canvas.mousemove(function(e) {
	//   var offset = $(this).offset(), offsetX = e.pageX - offset.left, offsetY = e.pageY - offset.top;
	//   //do something with offsetX and offsetY
	//   //tmpconsole.log("moving");

	// });

    // Setting preserveAspectRatio to 'none' lets you stretch the SVG
	paper.canvas.setAttribute('preserveAspectRatio', 'none');


	$(document).keydown(function(event) {
	

		/* since we are using jquery, the event is already normalize */
		var arrowKeys = {"left": 37, "up": 38, "right": 39, "down": 40, "plus": 187, "minus": 189};
		var irrelevantKey = false
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
		} else {
			irrelevantKey = true
		}
	

		if (!irrelevantKey){
			event.preventDefault();
		}
		/* we want to prevent document scrolling when pressing the arrows: */
		//
	
	});
	
	//paper.setViewBox(0, 0, width, height );
	refreshViewBox();
 
	// Setting preserveAspectRatio to 'none' lets you stretch the SVG
	paper.canvas.setAttribute('preserveAspectRatio', 'none');
 
	// initialize DataManager instance
	dataManager = new DataManager(null, null, null, null);  
	//dataManager.init();


	// add click listeners to the zoom and pan buttons 
	document.getElementById("zoomIn").onclick = zoomIn; 
	document.getElementById("zoomOut").onclick = zoomOut;  

	// stores reference to the budget slider and adds a change listener
	slider = document.getElementById("budgetSlider");
	slider.onchange = updateBudget;
	//// tmp comment alert("after slider");

	// stores references to the information output areas  
	information = document.getElementById("information");
	summary = document.getElementById("summary");

	// initializes budget value. 
	slider.value = 0;
	slider.max = 500;
	dataManager.budget = slider.value;

	// change the source file for the data
	$.get("BarrierAndStreamInfoOpt.json", function(data){ 
	//$.get("BarrierAndStreamInfoOptReduced.json", function(data){ 
	//$.get("BarrierAndStreamInfoOptNetworkReduced2.json", function(data){  
	//$.get("BarrierAndStreamInfo.json", function(data){
	//$.get("BarrierAndStreamInfoSubNetwork.json", function(data){	
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
