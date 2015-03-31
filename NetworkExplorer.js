
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
	this.accessibilityFromRoot;
	this.accessibilityLeaving;
	this.improvedAccessibilityFromRoot;
	this.improvedAccessibilityLeaving; 
	this.x = x;
	this.y = y; 
	this.children = new Array();
	this.children[0] = new Array(); // the child node
	this.children[1] = new Array(); // the length of the stream segment to child
	this.children[2] = new Array(); // the accessibility of the stream segment to the child
	this.children[3] = new Array(); // the streamSegments path object for drawing
	this.children[4] = new Array(); // the stream id
	this.outGoingAccessibility = 0.0;
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
	Node.prototype.addChild = function (node, length, accessibility, streamSegments, streamID){ 
		this.children[0].push(node);
		this.children[1].push(length);
		this.children[2].push(accessibility); 
		this.children[3].push(streamSegments);
		this.children[4].push(streamID);
		node.parent = this;
	}, 

	/**
	 * Returns true if this has the given node as a child. 
	 **/ 
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
		this.nodeDrawing = drawing;
		//this.nodeDrawing.attr({r:20}); 
		pairedNode = this;
		this.needsNodeDrawing = false
		this.nodeDrawing.click(function(){ 
 			dataManager.updateSelected(pairedNode);
 		});  
	},

	/**
	 * Add the node drawing for the node and its descendants. 
	 **/
	Node.prototype.addDrawingNodes = function(count, override){ 
		if (this.needsNodeDrawing && (this.isBarrier || override)){
			this.needsNodeDrawing = false;
			if (this.barrierType == 2){
				this.nodeDrawing = paper.circle(this.x,this.y,5);
			} else {
				this.nodeDrawing = paper.circle(this.x,this.y,3);
			}
			this.nodeDrawing.attr({fill: "green"}); 
		} 
		
		if (count >= 2000){
			// tmp comment ourAlert("still drawing nodes!");
			count = 0;
		}
		
		for(index in this.children[0]){
			this.children[0][index].addDrawingNodes(++count, false);
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

		// -1 means no action is to be taken 
		if (action == -1){
			this.improvedPassability = this.passability
			this.currentAction = -1 
		}
		// possibleActions should not be null. 
		else if (this.possibleActions == null){
			console.log("problem: tried to set action " + action + " of node " + this.toString()
				+ "\n\npossibleActions = " + this.possibleActions)
			this.improvedPassability = this.passability
			this.currentAction = -1 
		}
		// set the action and update the passability accordingly
		else { 

			this.improvedPassability = this.possibleActions[action].improvedPassability 
			this.currentAction = action
			// *** redundent coloring? color used for debugging? 2015 commentted out
			//this.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".90"})  
		} 

		// mark node as needing repaint if the passability has changed
		if (previousPassability != this.improvedPassability){
			this.requireRepaint = true
		}

	},

	/**
	 * Return a string with the node id, the id of its children, and information
	 * about passability, accessibility, and selection status.
	 *
	 * This string is not an html report string, which is given by reportString()
	 **/
	Node.prototype.toString = function (){
		output = "Node " + this.id + "\n     ";  
 				       	
 		// add the ids of all child nodes
 		if(this.children != null && this.children[0] != null && this.children[0].length > 0){ 
			for (index in this.children[0]){
				output += this.children[0][index].id + ","
			}
		}  
 		
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
	 * 
	 * This string is in html format. 
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
				output += "action taken: " + this.currentAction + "<br>"; 
				output += "improved passability: " + this.improvedPassability.toFixed(3) + "<br>";   
			}
		}
		
		if (this.children[2] != undefined && this.children[2][0] != undefined){
			output += "accessibility going out: " + this.children[2][0].toFixed(3) + "<br>"; 
		} 

		output += "x: " + this.x + "<br>"
		output += "y: " + this.y + "<br>"

		return output;
	},

	/** 
	 * Return a string with the node id, the id of its children, and information
	 * about passability, accessibility, and selection status.
 	 * 
	 * This string is in html format. 
	 **/
	Node.prototype.reportStringForStream = function (index){ 
		output = "Stream " + this.children[4][index] + "<br>";    
		if (this.children[2][index] != undefined) { 
			output += "accessibility: " + this.children[2][index].toFixed(3) + "<br>"; 
		} else {
			console.log("accessibility of stream segment " + index + " of " + this.id + 
				" is undefined upon report generation. \n\n " + this.toString())
		}

		return output;
	},

	/**
	 * Sets the selection status of this node to the value of param selected.  
	 **/ 
	Node.prototype.setSelection = function (selected){
		if (this.selected != selected){
			this.requireRepaint = true
			this.selected = selected
			//this.nodeDrawing.attr({fill: "#FFFF66", stroke:"transparent","opacity":".85"});

		}
	},

	/**
	 * Sets the partial selection status of this node to param partiallySelected.
	 * If a node is partially selected, it is on the path to the root. 
	 **/ 
	Node.prototype.setPartialSelection = function (partiallySelected){
		if (this.partiallySelected != partiallySelected){
			this.requireRepaint = true
			this.partiallySelected = partiallySelected 
			//this.nodeDrawing.attr({fill: "#66FF66", stroke:"transparent","opacity":".85"});
		}
	},

	Node.prototype.getNodeRadius = function(){
		if(this.currentAction == -1){
			if (!this.isBarrier || this.barrierType == 1){
				return crossingSize
			} else {
				return damSize
			}
		} else {
			if (!this.isBarrier || this.barrierType == 1){
				return crossingSize + 2
			} else {
				return damSize + 2
			}
		}
	},

	/**
	 * Set the colors of the node drawing and the colors of stream segments
	 * leading to the child nodes; then call the function for all descendants. 
	 **/
	Node.prototype.setColors = function (){  
		// update colors of this node and streams leaving it
		if (!this.selected){ 
			this.colorUnselected() 
		} else { 
			this.colorSelected() 
		}

		// update colors of all children
		for (index in this.children[0]){
			this.children[0][index].setColors();  
		}		 
		this.requireRepaint = false
	},  

	/**
	 * Set the colors for deselected areas.  
	 **/
	Node.prototype.colorSelected = function() {
		if (!this.requireRepaint){ 
			return  
		}

		nonBarrier = "#003366"			// blue
		crossingNoAction = "#FFFF66"	// yellow			"#087e7d"
		damNoAction = "#FF6E2C"			// orange			"#78c44c"
		crossingAction = "#78c44c"		// green		//"#087e7d"		// turquoise		"#FFFF66"
		damAction = "#8D198D"//"#9966FF" 			// purple"		//"#78c44c"			// green			"#FFFF66"

		nodeSize = this.getNodeRadius()

		// selected
		// color the node  
		if (!this.needsNodeDrawing){
			if (!this.isBarrier){ 
				// the only node that isn't a barrier and is being colored is the root
				this.nodeDrawing.attr({fill: nonBarrier, stroke:"transparent","opacity":".70"});
			} else {
				// no action taken
				if (this.currentAction == -1){
					// crossing, no action taken
					if(this.barrierType == 1){
						this.nodeDrawing.attr({fill: crossingNoAction /*"#18500F"*/, stroke:"transparent","opacity":"0.75", r:nodeSize}); 
					} 
					// dam, no action taken
					else { 
						this.nodeDrawing.attr({fill: damNoAction, stroke:"transparent","opacity":"0.80", r:nodeSize});  
					} 
				} 
				// some action taken (dam or crossing)
				else {
					if(this.barrierType == 1){
						this.nodeDrawing.attr({fill: crossingAction, stroke:"transparent","opacity":".80",r:nodeSize});
					} 
					else {
						this.nodeDrawing.attr({fill: damAction, stroke:"transparent","opacity":".85",r:nodeSize});
					}
				}
			}
		}

		// color the paths to the children (river segments)
		for (index in this.children[0]){ 
			colorString = this.getColor(this.children[2][index])
			this.children[3][index].attr({stroke:colorString,"stroke-width":selectedStreamWidth}); 
		}
	},

	/**
	 * Set the colors for selected areas. 
	 **/
	Node.prototype.colorUnselected = function() {
		if (!this.requireRepaint){ 
			return    
		} 

		pathToRootBarrier = "#003366"		// light green
		pathToRootNonBarrier = "#669900"	// blue
		unselectedNode = "#D4D4D4"			// grey
		pathToRootStream = "black"			// black
		unselectedStream = "#A0A0A0"		// grey
		nodeSize = this.getNodeRadius()

		if (!this.needsNodeDrawing){
			if(this.partiallySelected){
				// on the path to the root 
				if(!this.isBarrier){
					this.nodeDrawing.attr({fill:pathToRootBarrier, stroke:"transparent","opacity":".55", r:nodeSize}); 
				} else {
					this.nodeDrawing.attr({fill: pathToRootNonBarrier, stroke:"transparent","opacity":".50", r:nodeSize}); 
				}
			} else {
				// completely unselected
				this.nodeDrawing.attr({fill: unselectedNode, stroke:"transparent","opacity":".30", r:nodeSize});  
			} 
		}
 
		for (index in this.children[0]){  
			// if this and the child are partiallySelected, color the stream black (path to root)
			if(this.partiallySelected && (this.children[0][index].partiallySelected || this.children[0][index].selected)){
				this.children[3][index].attr({stroke:pathToRootStream}); 
			} else { 
				this.children[3][index].attr({stroke:unselectedStream,"stroke-width":deselectedStreamWidth}); // grey
			}  
		} 
	},

 
 	/**
 	 * Get the appropriate color for a stream segment. 
 	 **/
	Node.prototype.getColor = function(accessibility){   
		return colorScaleFunction(accessibility).hex();
	},

	/**
	 * Calculate the habitat for the node by taking to sum
	 * of each segment's accessibility times the length. 
	 *
	 * if isOriginal is true, stores the habitat calculated
	 * as the original amount of habitat at the node (before 
	 * actions are taken) 
	 **/ 
	Node.prototype.calculateHabitat = function(isOriginal){
		this.previousHabitat = this.currentHabitat

		habitat = 0; 

		for (index in this.children[0]){
			if (this.children[0][index] != null){  
				// accessibility of stream segment * length
				habitat += this.children[2][index] * this.children[1][index];

				// add the habitat of the child
				habitat += this.children[0][index].calculateHabitat(isOriginal);
			} else {
				ourAlert("for some reason, an entry in children[0]" + index.toString() + 
					" is null in calculateHabitat. \n\n" + this.toString())
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
	Node.prototype.calculateAccessibilityNewVersion = function(comingIn){
		/*
		this.accessibilityFromRoot;
		this.accessibilityLeaving;
		this.improvedAccessibilityFromRoot;
		this.improvedAccessibilityLeaving; 
		*/

		this.accessibilityFromRoot = comingIn
		this.accessibilityLeaving = coming * this.passability
		this.improvedAccessibilityFromRoot = this.accessibilityFromRoot
		this.improvedAccessibilityLeaving = this.accessibilityLeaving 

		originalAccessibility = -1
		compare = false
		if (this.children != null && this.children[2][0] != null){
			originalAccessibility = this.children[2][0]
			compare = true
		}

		//ourAlert("calculating accessibility. \ncomingIn = " + comingIn + "\npassability = " + 
			//this.passability + "\nimprovedPassability = " + this.improvedPassability + 
			//"\n\ngoing out should be: " + (comingIn*this.improvedPassability));
		if(this.isBarrier){

			//accessibility = comingIn * (this.passability + this.passabilityImprovement);
			accessibility = comingIn * this.improvedPassability; 
			
			// 2015 this is debug coloring right?
			//colorString = this.getColor(accessibility)
			//this.nodeDrawing.attr({fill: "#FF4500", stroke:"transparent","opacity":".55"}); 
			//this.nodeDrawing.attr({fill: "#1e90ff", stroke:"transparent","opacity":".55"}); 
		} else { 
			accessibility = comingIn;
		} 

		// if the node has children, it will need to be repainted 
		// if the accessibility has changed
		if (compare && originalAccessibility != accessibility){
			this.requireRepaint = true
		}

		// 2015 do these loops need to be separate? 
		for (index in this.children[0]){
			this.children[2][index] = accessibility;    
		}
		for (index in this.children[0]){ 
			this.children[0][index].calculateAccessibility(this.children[2][index]);   
		}
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

		//ourAlert("calculating accessibility. \ncomingIn = " + comingIn + "\npassability = " + this.passability + 
			//"\nimprovedPassability = " + this.improvedPassability + "\n\ngoing out should be: " + 
			//(comingIn*this.improvedPassability));
		if(this.isBarrier){

			//accessibility = comingIn * (this.passability + this.passabilityImprovement);
			accessibility = comingIn * this.improvedPassability; 
			
			// 2015 this is debug coloring right?
			//colorString = this.getColor(accessibility)
			//this.nodeDrawing.attr({fill: "#FF4500", stroke:"transparent","opacity":".55"}); 
			//this.nodeDrawing.attr({fill: "#1e90ff", stroke:"transparent","opacity":".55"}); 
		} else { 
			accessibility = comingIn;
		} 

		// if the node has children, it will need to be repainted 
		// if the accessibility has changed
		if (compare && originalAccessibility != accessibility){
			this.requireRepaint = true
		}

		// 2015 do these loops need to be separate? 
		for (index in this.children[0]){
			this.children[2][index] = accessibility;    
		}
		for (index in this.children[0]){ 
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
		ourAlert("in updateSelected. calledFrom \n" + calledFrom.toString());  
		//dataManager.markAllSelected(calledFrom); 
		// the root of the network containing calledFrom is returned 
		
		// deselect all of the network
		for (index in dataManager.networkSource){
			root = dataManager.networkSource[index]
			dataManager.deselect(root)
		}

		// find the path to the root and store the root (in case of multiple distinct networks)
		activeRoot = dataManager.partiallyDeselect(calledFrom.parent, calledFrom); 
		// select the clicked node and all of its descendants
		dataManager.markAllSelected(calledFrom);  
		// store the root of the current selected area
		dataManager.selectedNode = calledFrom;
		ourAlert("updated selection!") 
		dataManager.updateSolution() 
	},

	/**
	 * Sets current and its descendants to selected. 
	 **/ 
	DataManager.prototype.markAllSelected = function (current){
		if (current == null){
			return null  
		} 

		current.setSelection(true) 

		if (current.children != null){
			for (index in current.children[0]){
				dataManager.markAllSelected(current.children[0][index])   
			}
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
		current.setSelection(false)  
		current.setPartialSelection(true)   

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

		current.setSelection(false)  
		current.setPartialSelection(false)   
		
		if (current.children != null){ 
			for (index in current.children[0]){
				this.deselect(current.children[0][index]);
			}
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

		// clear descendants' passability improvements 
		if (current.children != null){
			for (index in current.children[0]){
				dataManager.clearPassabilityImprovement(current.children[0][index])   
			}
		}
	},

	/**
	 * Create a summary of the overall network information (budget, habitat...) 
	 * for display in the page body.  
	 **/
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
			dataManager.followSolution(start, false)
		} else {
			ourAlert("no solution entry point found!")
		}

		// recalculate accessibility
		dataManager.selectedNode.calculateAccessibility(1.0)
		ourAlert("recalculated accessibility")
		
		// reset colors
		dataManager.updateAllColors(); 
		ourAlert("colors updated")

		// calculate accessible habitat
		dataManager.selectedNode.calculateHabitat(false) 

		// update summary display
		summary.innerHTML = dataManager.createSummary() 
	}, 

	/**
	 * Finds the starting point for the solution to the current 
	 * budget and network selection. 
	 **/
	DataManager.prototype.findSolutionStart = function (){ 
		closestEntry = null
		closestCost = null
		desiredID = dataManager.selectedNode.id
		entriesForNode = dataManager.OPT[desiredID]
		
		/*ourAlert("starting node: " +  dataManager.selectedNode.toString() + "\n\nentries for node: \n" + entriesForNode)

		if (desiredID.toString() in dataManager.OPT) {
			ourAlert("should have an entry! " + desiredID + " is in OPT!")
		} else {
			ourAlert(desiredID + " doesn't seem to be in OPT.")
		}*/

		ourAlert("our budget is " + dataManager.budget + " and we're starting from node " + desiredID)
		foundAnEntry = false
		for (key in entriesForNode) {
			entry = entriesForNode[key]
			cost = Number(entry["cost"]) 
			//ourAlert("cost = \'" + cost + "\'\nentry['cost'] = \'" + entry["cost"] + "\'")
			//if (!isNaN(cost) && (closestCost == null || ((dataManager.budget - cost) < (dataManager.budget - closestCost)) && cost <= dataManager.budget)) {  
			if (!isNaN(cost) && ((closestCost == null && cost <= dataManager.budget) || 
				((dataManager.budget - cost) < (dataManager.budget - closestCost)) && cost <= dataManager.budget)) {  
				closestEntry = entry
				closestCost = cost
				//ourAlert(closestCost + " cost is closer to our budget")
				foundAnEntry = true
			}
		}
		if (!foundAnEntry){
			ourAlert("Did not find an entry for " + desiredID)
			return null;
		} else if (closestCost == 0){
			ourAlert("Our only found entry is for cost 0! The solution will not improve passability!!!")
			return null;
		}

		ourAlert("returning closest entry: " + closestEntry + ", cost of " + closestCost) 
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
		if (start == undefined || dataManager.allNodes[start.nodeID] == undefined || Number(start["value"]) <= 0){
			ourAlert("in followSolution(). returning because solution start or node is undefined")
			return
		}

		// get the node from the dictionary of all nodes and set the action  
		currentNode = dataManager.allNodes[start.nodeID];
		action = start.actionID; 
		currentNode.setAction(action)   
 
 		// follow solution to actions spreading out from child  
		if (start["firstChildID"] != "-1" && Number(start["valueChild"]) > 0){  
			child = dataManager.OPT[start["firstChildID"]][start["valueChild"]]
			dataManager.followSolution(child, true)
		}  

		// follow solution to actions spreading out form sibling
		if(includeSibling && [start["siblingID"]] != "-1" && Number(start["valueSibling"]) > 0){  
			sibling = dataManager.OPT[start["siblingID"]][start["valueSibling"]]
			dataManager.followSolution(sibling, true)
		} 
	},

	/**
	 * Testing function--check to see which nodes are included in OPT
	 * and which nodes, if any, are not.  
	 **/
	DataManager.prototype.checkOPT = function(){ 

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

		  
 		if (someExcluded){ 
 			ourAlert("includedNodes: \n\n" + includedNodes)
			ourAlert("excludedNodes: \n\n" + excludedNodes) 
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
	DataManager.prototype.addEventsToAllBranches = function(branches){
		for (index in branches){ 
			this.addEvents(branches[index]);
		}
	},

	/**
	 * Add events to the node and all its descendants. 
	 **/
	DataManager.prototype.addEvents = function(node){  

		if (node.needsClickListener){
			// add events to the node
			if (node.nodeDrawing != null){
				node.nodeDrawing.click(function(){ 
					dataManager.updateSelected(node);
				});

				// adds hover functions: the first called during hover; the second,
				// when hover stops.   
				node.nodeDrawing.hover(function(){
					information.innerHTML = node.reportString()  
				}, function(){
					information.innerHTML = "\n\n" 
				});
			}

			// add events to streams leaving the node
			for (index in node.children[3]){
				node.children[3][index].click(function(){ 
					dataManager.updateSelected(node);
				});

				node.children[3][index].hover(function(){ 
					information.innerHTML = node.reportStringForStream(index)    
				}, function(){
					information.innerHTML = "\n\n" 
				});
			}

			node.needsClickListener = false;
 	
 			// add events to the node's children
			for (index in node.children[0]){ 
				this.addEvents(node.children[0][index]);
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
 
 	 	displayInfo = info.displayInfo 
 	 	this.initDisplaySettings()  

		// read in all the nodes, create objects for them, and store them into a dictionary.  
		allNodes = this.readInNodes(nodes) 

		// read in all streams and use them to form connections between the nodes.  
		this.readInStreams(streams, allNodes)   
 
		// find all of the roots in the network(s)
		for (key in allNodes){
			if (allNodes[key].parent == null){
				this.networkSource.push(allNodes[key]);
			}
		}

		ourAlert("\nfound " + this.networkSource.length + " roots\n"); 
 
		// finish setting up each network
		for (index in this.networkSource){ 
			root = this.networkSource[index]
			this.initNetwork(root)  
			this.selectedNode = root 
		}

		 
		this.markAllSelected(this.selectedNode)
		this.selectedNode.setColors(); 
		this.allNodes = allNodes;  
		summary.innerHTML = this.createSummary()  

		this.checkOPT();  

		initTransformElements()
		transformToDisplayArea(0,0, displayInfo.maxX, displayInfo.maxY)

		ourAlert("setup complete!") 
	},    

	/**
	 * Creates the initial display dimension settings and refreshes the display.
	 **/ 
	DataManager.prototype.initDisplaySettings = function  (){ 
		//ourAlert("maxX: " + displayInfo.maxX + "\nmaxY: " + displayInfo.maxY)
 		
 		/*if (displayInfo == null){
 			displayInfo = {maxX: 100, maxY: 100};
 		}

 		console.log("maxX: " + displayInfo.maxX + "\nmaxY: " + displayInfo.maxY) 
		viewBox[2] = displayInfo.maxX + 10
		viewBox[3] = displayInfo.maxY + 10

		screenWidth = canvas.offsetWidth
		screenHeight = canvas.offsetHeight 

		displayWidth = viewBox[2] - viewBox[0]
		displayHeight = viewBox[3] - viewBox[1]

		originalXRatio = screenWidth/displayWidth
		originalYRatio = screenHeight/displayHeight 

		refreshViewBox();   */

		/*colorScaleFunction = chroma.interpolate.bezier(['#223535', 'darkslategray', 'teal', 'cornflowerblue', 'deepskyblue'])  


		browserWidth = $(window).width()
		browserHeight = $(window).height()

		width = browserWidth - 300 //752;//470;
		height = browserHeight - 200 //470; 

		alert("viewbox width, height: " + width + "\n" + height + "\n\n\nbrowser width, height: " + browserWidth + "\n" + browserHeight)

		viewBox = [0, 0, displayInfo.maxX, displayInfo.maxY] 
 
		canvas = document.getElementById('canvas') 
		paper = new Raphael(document.getElementById('canvas'), width, height);   

    	// Setting preserveAspectRatio to 'none' lets you stretch the SVG
		paper.canvas.setAttribute('preserveAspectRatio', 'none');
 
		refreshViewBox() 
		addAllPageEvents()*/
	},    

	/**
	 * Reads in all the nodes, creates objects for them, and stores them into a dictionary.  
	 * Returns the dictionary with all of the nodes
	 **/ 
	DataManager.prototype.readInNodes = function  (nodes){ 
		// read in all the nodes, create objects for them, and store them into a dictionary.  
		allNodes = {};
		numberNodes = 0;
		barrierTypes = {"0":0, "1":0, "2":0};
		for (index in nodes){
			current = nodes[index];
			currentID = current.ID;  
 
			//id, isBarrier, barrierType, possibleActions, passability, x, y, children, parent
			action = null
			if(current.barrierType == 1){
				action = crossings 
				barrierTypes["1"] += 1;
			} else if (current.barrierType == 2){ 
				action = dams 
				barrierTypes["2"] += 1;
			} else {
				barrierTypes["0"] += 1;
			}
 
 			newNode = new Node(currentID, current.isBarrier, current.barrierType, action, current.passability, 0, 0, null, null);         
			allNodes[currentID] = newNode 
   
			numberNodes++;
		} 

		//console.log("barrier type counts: 0: " + barrierTypes["0"] + ", 1: " + barrierTypes["1"] + ", 2: " + barrierTypes["2"])
   		ourAlert("barrier type counts: 0: " + barrierTypes["0"] + ", 1: " + barrierTypes["1"] + ", 2: " + barrierTypes["2"]) 

		ourAlert("\nread in the nodes. (" + numberNodes.toString() + ")\n");  
		return allNodes
	},    

	/**
	 * Reads in all streams and uses them to form connections between the nodes.  
	 **/ 
	DataManager.prototype.readInStreams = function  (streams, allNodes){ 
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

				// this should not be necessary
				// if a node is missing, build a default one
				if (upstream == null){
					upstream = new Node(upstreamID, false, -1, null, 1.0, 0, 0, null, null)
					allNodes[upstreamID] = upstream
					nodesMissingReport += upstreamID + "\n"
				}
				// this should not be necessary 
				// if a node is missing, build a default one
				if (downstream == null){
					downstream = new Node(downstreamID, false, -1, null, 1.0, 0, 0, null, null)
					allNodes[downstreamID] = downstream
					nodesMissingReport += upstreamID + "\n"
				}

 
				/*if (downstream.hasChild(upstream)){
					continue;
				} */

				// build a path for drawing each stream
				pathDirections = "M"; 
				for (j = 0; j + 1 < current.segments.length; j+=2){ 
					if (pathDirections != "M"){
						pathDirections += "L";
					}
					pathDirections += current.segments[j];
					pathDirections += ",";
					pathDirections += current.segments[j+1]; 
				} 
 
 				// add the path to the drawing canvas
				path = paper.path(pathDirections);  
				path.attr({"stroke-width":selectedStreamWidth});
				path.attr({stroke:"#FF4D4D"});  

				// use the start and end points of the stream's path for the node's XY coordinates. 
 	 			downstream.setXY(current.segments[0], current.segments[1]);  //normal
				upstream.setXY(current.segments[j-2], current.segments[j-1]) //normal  
  
				downstream.addChild(upstream, current.length, 0, path, index);  
				successes++; 
			} catch (error) {  
				problems++;
			} 
		}
		
		console.log("missing: " + nodesMissingReport)
		// tmp comment ourAlert("read in the stream segments");
		console.log("\nread in the stream segments.\n");
		console.log(successes + " successful");
		console.log("(encountered " + problems + " problems along the way)");
	}, 

	/**
	 * Performs the initial operations required for each network. 
	 * (calculations, deselection, and color setting) 
	 **/ 
	DataManager.prototype.initNetwork = function  (root){ 
		root.addDrawingNodes(0, true); 
		//ourAlert("node with " + root.passability.toString() + " passability\n" + root.toString()) 
		root.calculateAccessibility(1.0);
		root.calculateHabitat(true);
		this.deselect(root)
		root.setColors();
		root.nodeDrawing.attr({r:20/*, fill:"blue"*/});
		//this.selectedNode = root;   
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
var svgPan;
var svgScale;
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

var svgWidth;
var svgHeight;
var displayedWidth;
var displayedHeight;

var viewBox;
var originalXRatio; 
var originalYRatio; 
var originalScale;
var differenceInScale;
var viewRectangle;
var colors;
var translateX;
var translateY;
var scale;
var scaleDifference;
var originalScale;

var networkCenter;
var networkWidth;
var networkHeight;

var mouseIsDown = false;
var mouseDownX;
var mouseDownY;
var mouseUpX;
var mouseUpY; 

var alertClosed = true

var shouldDisplayAlerts = false
var displayAlertsInConsole = true

var damSize = 5
var crossingSize = 3
var selectedStreamWidth = 7 
var deselectedStreamWidth = 5



/** 
 * If two valid numbers are given, translates the specified the amount. 
 **/
function translate(xChange, yChange){
	console.log("in translate (x,y) " + xChange + "," + yChange)
	// NaN: not a number
	// NaN does not equal itself, so isNaN is needed to make sure there are 
	// 2 valid numbers. 
	if (!isNaN(xChange) && !isNaN(yChange)) {  
		//translateX += xChange
		//translateY += yChange 

		//svgPan.setAttribute('transform', 'translate(' + translateX + ',' + translateY + ')')  
		//console.log("new translate x,y: " + translateX + ", " + translateY)  

		networkCenter[0] += xChange/scale
		networkCenter[1] += yChange/scale

		resetTranslation(false)
	};
}

function resetTranslation(print){ 

	newTranslation = recalculateTranslation(print)

	translateX = newTranslation[0] 
	translateY = newTranslation[1]	 

	console.log("new translate x,y: " + translateX + ", " + translateY) 
	
	svgPan.setAttribute('transform', 'translate(' + translateX + ',' + translateY + ')')  
}

function recalculateTranslation(print){

	//networkWidth = svgWidth/scale
	//networkHeight = svgHeight/scale 

	networkCWidth = networkWidth - networkWidth*scaleDifference
	networkCHeight = networkHeight - networkHeight*scaleDifference

	console.log("   using networkD - networkD*scaleDifference " + 
		      "\n     (" + networkWidth + " - " + (networkWidth*scaleDifference) + ")" + 
		      "\n     (" + networkHeight + " - " + (networkHeight*scaleDifference) + ")" + 
		      "\n       network c width: " + (networkWidth - networkWidth*scaleDifference) + 
			  "\n       network c height: " + (networkHeight - networkHeight*scaleDifference)) 

	networkCWidth = networkWidth + networkWidth*scaleDifference
	networkCHeight = networkHeight + networkHeight*scaleDifference

	console.log("   using networkD + networkD*scaleDifference * " + 
		      "\n     (" + networkWidth + " + " + (networkWidth*scaleDifference) + ")" + 
		      "\n     (" + networkHeight + " + " + (networkHeight*scaleDifference) + ")" + 
		      "\n       network c width: " + (networkWidth + networkWidth*scaleDifference) + 
			  "\n       network c height: " + (networkHeight + networkHeight*scaleDifference)) 

	// translate is smaller than it should be? network jumps to bottom left
	//networkCWidth = svgWidth/scale 
	//networkCHeight = svgHeight/scale

	console.log("   using svgD/scale" +  
		      "\n       network c width: " + (svgWidth/scale) + 
			  "\n       network c height: " + (svgHeight/scale)) 

	// zooms from top left
	//networkCWidth = networkWidth
	//networkCHeight = networkHeight
	//
	//console.log("   using networkD" +  
	//	      "\n       network c width: " + networkWidth + 
	//		  "\n       network c height: " + networkHeight) 

	// width   scaleDifference    	width-width*sD		scaleDifference		width*sD
	// 1000          0            		1000  			      1 			  1000
	// 1000          0.1          		 900		        1.1 			  1100
	// 1000         -0.1          		1100	            0.9 			   900

	if (print) { 
		console.log("\nrecalulating translation")
		console.log("   previous translation: " + 
			      "\n     translateX: " + translateX + 
			      "\n     translateY: " + translateY + "\n")
		console.log("   scale: " + scale)
		console.log("   scale difference: " + scaleDifference + "\n")     
		console.log("   network center: " + networkCenter[0] + 
		          "\n                   " + networkCenter[1])  
		console.log("     network width: " + networkWidth + 
			      "\n     network height: " + networkHeight)
		console.log("     network c width: " + networkCWidth + 
			      "\n     network c height: " + networkCHeight) 
	}
	

 	 
	//scaledCenter = [networkCenter[0]*scale, networkCenter[1]*scale]

	//console.log("   scaled center: " + scaledCenter)

	// need to know network width to figure out new top left x,y for translating
	networkTopLeft = [networkCenter[0] - networkCWidth/2, networkCenter[1] - networkCHeight/2]

	if(print){
		console.log("   distance to txy: " + 
			      "\n        x: " + (networkCWidth/2) + 
			      "\n        y: " + (networkCHeight/2)) 
	}

	console.log("   network top left: " + networkTopLeft[0] + 
		      "\n                     " + networkTopLeft[1])
	console.log("   network center: " + networkCenter[0] + 
		      "\n                   " + networkCenter[1]) 

	return networkTopLeft 
}

 
/**
 * Zoom in slightly
 **/ 
function zoomIn()
{
	//zoom(1.1);
	zoom(0.1) 
}

/**
 * Zooms out slightly
 **/ 
function zoomOut()
{
	//zoom(0.9);
	zoom(-0.1)
}

function transformToDisplayArea(leftX, topY, rightX, bottomY){
	
	console.log("transforming to display area. ") 

	displayedWidth = rightX - leftX
	displayedHeight = bottomY - topY



	widthRatio = svgWidth/displayedWidth
	heightRatio = svgHeight/displayedHeight 

	if (heightRatio < widthRatio){
		ratio = heightRatio
	} else {
		ratio = widthRatio
	} 

	svgScale.setAttribute('transform', 'scale(' + ratio + ')') 
	scale = ratio
	originalScale = ratio
	scaleDifference = 0

	networkWidth = svgWidth/scale//rightX - leftX;
	networkHeight = svgHeight/scale//bottomY - topY;

	console.log("  svgWidth: " + svgWidth + "\n  svgHeight: " + svgHeight)

	console.log("\n  network width: " + networkWidth + "\n  networkHeight: " + networkHeight + 
		"\n  displayedWidth: " + displayedWidth + "\n  displayedHeight: " + displayedHeight + "\n") 
	

	networkCenter = [leftX + networkWidth/2, topY + networkHeight/2]

	console.log("  network center before centering: " + networkCenter[0] + 
		      "\n                   " + networkCenter[1]) 
 
 	// whichever dimension has the unused ratio is currently uncentered: center it
 	if (heightRatio < widthRatio){
		networkCenter[0] += (networkWidth - displayedWidth)/2
	} else {
		networkCenter[1] += (networkHeight - displayedHeight)/2 
	} 

	console.log("  network center after centering: " + networkCenter[0] + 
		      "\n                   " + networkCenter[1]) 

	//origin = paper.circle(0,0,20)
	//originalCenter = paper.circle(networkCenter[0],networkCenter[1],20)
	//beginningTransform = recalculateTranslation(false)
	//originalTranslate = paper.circle(beginningTransform[0],beginningTransform[1],20)
	//originalCenter = paper.circle(3735,1405,20) 
	//originalTranslate = paper.circle(1129,0,20)

	//origin.attr({fill: "#9900CC"/*, stroke:"transparent","opacity":".90"*/}) 				// magenta
	//originalCenter.attr({fill: "#FF0000"/*, stroke:"transparent","opacity":".90"*/}) 		// red
	//originalTranslate.attr({fill: "#99CCFF"/*, stroke:"transparent","opacity":".90"*/}) 	// light blue


	console.log("calling reset translate to update translation. (leaving transformToDisplayArea)")
	resetTranslation(true) 

}

function zoom(factor){ 
	console.log("\n\nzooming by " + factor)
	console.log("current scale " + scale)
	if(!isNaN(factor) && (scale + factor) >= 0){    
		 
		scale += factor 
		scaleDifference += factor
		
		svgScale.setAttribute('transform', 'scale(' + scale + ')')   
		//svgPan.setAttribute('transform', 'translate(' + translateX + ',' + translateY + ')')  
		resetTranslation(true)
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
	// tmp comment ourAlert("budget changing!");
	if(dataManager.budget == slider.value){
		// tmp comment ourAlert("actually, the budget is the same!");
	} else {
		dataManager.budget = slider.value;
		dataManager.updateSolution();
	}
}
 
/**
 * Alert the specified text if alerts are currently enabled in our program. 
 **/ 
function ourAlert(text){

	alertsEnabled = true
	/*
	// Chrome
	if(navigator.userAgent.indexOf("Chrome") != -1 ) 
    { 
    	alert('Chrome');
    }
    // Opera
    else if(navigator.userAgent.indexOf("Opera") != -1 )
    {
    	alert('Opera');
    }
    // Firefox
    else if(navigator.userAgent.indexOf("Firefox") != -1 ) 
    {
    	alert('Firefox');
    }
    //Internet Explorer
    else if((navigator.userAgent.indexOf("MSIE") != -1 ) || (!!document.documentMode == true )) //IF IE > 10
    {
    	alert('IE'); 
    }   
    */

    if (alertsEnabled && shouldDisplayAlerts){ 
		alert(text);   
	} 
	 
	if (displayAlertsInConsole){
		console.log(text)
	}
} 

/**
 * Opens a jquery message dialogue with the given text. 
 **/ 
function openJQueryAlert(text){
	$("#dialog-confirm").html(text); 
	//alert("making dialogue box. text \n" + text)
	// Define the Dialog and its properties.
    $("#dialog-confirm").dialog({
		resizable: true,
		modal: false,
		title: "alert",
		height: 250,
		width: 400,
		buttons: {
			"Okay": function () {
				$(this).dialog('close'); 
				return false;
			}, 
			"Stop Alerts": function () {
			    $(this).dialog('close');
			    shouldDisplayAlerts = false;
			    return false;
			}
		}
	}); 
}

/**
 * Add mouse events to the page (hover, drag, click)
 **/ 
function addMouseEvents(){  

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

        	    // if negative, zoomed out; if positive, zoomed in
        	    //scaleDifference = scale - originalScale
				
				/*console.log("\n\nmouse drag")
        		console.log("scaleDifference:  " + scaleDifference) 
        		console.log("   originalScale: " + originalScale)
        		console.log("   scale:         " + scale)
        		console.log("xChange: " + xChange)
        		console.log("yChange: " + yChange)
        	    

        	    // zoomed out: more is displaying on screen, so translate by more
        	    if(scaleDifference < 0){
        			scaleDifference = 0 - (scaleDifference * 0.4)
        	    	xChange *= (1 + scaleDifference)
        	    	yChange *= (1 + scaleDifference)
        	    } else if (scaleDifference > 0) {
        	    	scaleDifference = scaleDifference * 0.4
        	    	xChange *= (1 - scaleDifference)
        	    	yChange *= (1 - scaleDifference)
        	    }  

        	   	console.log("new xChange: " + xChange)
        		console.log("new yChange: " + yChange)*/

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
        	alert("drag!")
        	//tmpconsole.log("dragging");
        		var currentx = event.pageX;
        	    var currenty = event.pageY;

        	    var xChange = currentx - mouseDownX;
        	    var yChange = currenty - mouseDownY;
        	    //tmpconsole.log("xChange  :" + xChange + " and \n yChange   :" + yChange);
      		    //tmpconsole.log("current position :" + currentx + " and " + currenty);
      		    //tmpconsole.log("xScale  :" + xScale + " and yScale : " + yScale);
  
        	    //translate(xChange-w,yChange-h);
        	    if(scale == originalScale){
        	    	scaleChange = 1
        	    } else {
        	    	scaleChange = (scale - originalScale)
        		}

        		console.log("\n\nmouse drag")
        		console.log("scaleChange: " + scaleChange)
        		console.log("   originalScale: " + originalScale)
        		console.log("   scale:         " + scale)
        		console.log("xChange: " + xChange)
        		console.log("yChange: " + yChange)

        	    xChange = xChange/scaleChange
        	    yChange = yChange/scaleChange

        	    console.log("new xChange: " + xChange)
        		console.log("new yChange: " + yChange)

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
}

/**
 * Add events to zoom in and out using - and + keys. 
 **/ 
function addKeyPressEvents(){
	$(document).keydown(function(event) {
	

		/* since we are using jquery, the event is already normalize */
		var arrowKeys = {"left": 37, "up": 38, "right": 39, "down": 40, "plus": 187, "minus": 189};
		var irrelevantKey = false
		
		if ((event.ctrlKey||event.metaKey)){
			return
		}
		
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
			zoom(0.1) 
		} 
		else if(event.keyCode == arrowKeys["minus"]){
			zoom(-0.1)
		} else if (event.keyCode == 84){   
			// t
			testNetwork = [500, 300]
			testScaled = convertToScaledCoordinates(testNetwork)
			testReciprocal = convertToNetworkCoordinates(testScaled) 

			console.log("made up network coodinates: " + testNetwork + "\n" + 
				        "converted to scaled: " + testScaled + "\n" + 
				        "test change back: " + testReciprocal)
		} else {
			console.log("irrelevantKey: " + event.keyCode)
			irrelevantKey = true
		}
	

		if (!irrelevantKey){
			event.preventDefault();
		}
		/* we want to prevent document scrolling when pressing the arrows: */
		//
	
	});
}

/**
 * Add events to all buttons on page (zoom in and out buttons)
 **/ 
function addButtonEvents(){
	// add click listeners to the zoom and pan buttons 
	document.getElementById("zoomIn").onclick = zoomIn; 
	document.getElementById("zoomOut").onclick = zoomOut;  
}

/**
 * Add all events (mouse, key, and button)
 **/ 
function addAllPageEvents(){
	addMouseEvents()
	addKeyPressEvents()
	addButtonEvents()
} 

/**
 * Set up raphael paper element, and create the color scale for accessibility. 
 **/ 
function initDisplaySettings(){
	colorScaleFunction = chroma.interpolate.bezier(['#223535', 'darkslategray', 'teal', 'cornflowerblue', 'deepskyblue'])  


	browserWidth = $(window).width()
	browserHeight = $(window).height()

	width = browserWidth - 300 //752;//470;
	height = browserHeight - 200 //470; 
 	 
	viewBox = [0, 0, width, height] 
 
	canvas = document.getElementById('canvas') 
	paper = new Raphael(document.getElementById('canvas'), width, height);   

	svgWidth = width
	svgHeight = height

    // Setting preserveAspectRatio to 'none' lets you stretch the SVG
	paper.canvas.setAttribute('preserveAspectRatio', 'none');
 
	refreshViewBox() 
}


function initTransformElements(){  
	origin = paper.circle(0,0,20) 
	//originalCenter = paper.circle(networkCenter[0],networkCenter[1],20)
	//beginningTransform = recalculateTranslation(false)
	//originalTranslate = paper.circle(beginningTransform[0],beginningTransform[1],20)
	originalCenter = paper.circle(3735,1405,20) 
	dimensionOver2 = paper.circle(2602,1405,20)  // width/2 or 3735-1129
	dimensionOver22 = paper.circle(1477,1405,20) // 3734-1129-1129 
	dimensionOver222 = paper.circle(348,1405,20) // 3735-1129-1129-1129 
	originalTranslate = paper.circle(-1129,0,20)

	origin.attr({fill: "#9900CC"/*, stroke:"transparent","opacity":".90"*/}) 				// magenta 
	originalCenter.attr({fill: "#FF0000"/*, stroke:"transparent","opacity":".90"*/}) 		// red
	dimensionOver2.attr({fill: "#99FF66"/*, stroke:"transparent","opacity":".90"*/}) 		// green
	dimensionOver22.attr({fill: "#33CC33"/*, stroke:"transparent","opacity":".90"*/}) 		// darker green
	dimensionOver222.attr({fill: "#005200"/*, stroke:"transparent","opacity":".90"*/}) 		// even darker green 
	originalTranslate.attr({fill: "#99CCFF"/*, stroke:"transparent","opacity":".90"*/}) 	// light blue
	
	originalCenter.hover(function(){
					alert("3735, 1405")  
				}, function(){});
	dimensionOver2.hover(function(){
					alert("2602, 1405")  
				}, function(){});
	dimensionOver22.hover(function(){
					alert("1477, 1405")  
				}, function(){});
	dimensionOver222.hover(function(){
					alert("348, 1405")  
				}, function(){});
	originalTranslate.hover(function(){
					alert("-1129, 0")  
				}, function(){});
	origin.hover(function(){
					alert("0, 0")  
				}, function(){}); 

	/*
	// translate on outside
	translateX = 0
	translateY = 0   
	scale = 1

	svgPan = document.createElementNS("http://www.w3.org/2000/svg", "svg:g"); 
	svgPan.setAttribute('transform', 'translate(0,0)');  
	//svgPan.setAttribute('transform', 'translate(20,20)');   

	svgScale = document.createElementNS("http://www.w3.org/2000/svg", "svg:g"); 
	svgScale.setAttribute('transform', 'scale(1)');  
	
	var svgComponents = canvas.childNodes
	var svgComponent = svgComponents[0] 

	$(svgComponent).wrapInner(svgPan)

	//svgPan.setAttribute('transform', 'translate(40,40)');   

	var wrapper = svgComponent.childNodes[0]

	//wrapper.setAttribute('transform', 'translate(40,40)');  

	// $(svgPan).wrapInner(svgScale) does not work
	$(wrapper).wrapInner(svgScale) 

	svgPan = wrapper
	svgScale = wrapper.childNodes[0]
	*/


	
	  // dan thinks zoom needs to be on the inside? seems like I wrote this comment backwards??
	  // zoom on outside
	translateX = 0
	translateY = 0   
	scale = 1

	svgPan = document.createElementNS("http://www.w3.org/2000/svg", "svg:g"); 
	svgPan.setAttribute('transform', 'translate(0,0)');  
	//svgPan.setAttribute('transform', 'translate(20,20)');   

	svgScale = document.createElementNS("http://www.w3.org/2000/svg", "svg:g"); 
	svgScale.setAttribute('transform', 'scale(1)');  
	
	var svgComponents = canvas.childNodes
	var svgComponent = svgComponents[0] 

	$(svgComponent).wrapInner(svgScale)

	svgScale.setAttribute('transform', 'translate(40,40)');   

	var wrapper = svgComponent.childNodes[0]

	wrapper.setAttribute('transform', 'translate(40,40)');  

	// $(svgScale).wrapInner(svgScale) does not work
	$(wrapper).wrapInner(svgPan) 

	svgScale = wrapper
	svgPan = wrapper.childNodes[0] 
}



/**
 * Starts the program, though is not called automatically by javascript. 
 *
 * Initializes variables for NetworkExplorer and adds listeners to items
 * on the webpage. 
 **/ 
function main(){  

	// 2015 commented out: want initial display  to be according to the max x,y values
	// so must call in init() when we have the data
	// cannot add events until we have created the canvas, which we do in initDisplaySettings
	initDisplaySettings() 
	addAllPageEvents()
 
	// initialize DataManager instance
	dataManager = new DataManager(null, null, null, null);  
	//dataManager.init(); 

	// stores reference to the budget slider and adds a change listener
	slider = document.getElementById("budgetSlider");
	slider.onchange = updateBudget; 

	// stores references to the information output areas  
	information = document.getElementById("information");
	summary = document.getElementById("summary");

	// initializes budget value. 
	slider.value = 0;
	slider.max = 10000;
	dataManager.budget = slider.value;

	// change the source file for the data
	 $.get("BarrierAndStreamInfoOpt.json", function(data){  
	// $.get("BarrierAndStreamInfoOptFlipped.json", function(data){  
	// $.get("BarrierAndStreamInfoOptScriptUpdated.json", function(data){     
	// $.get("BarrierAndStreamInfoSmallerDivisor.json", function(data){ 
 	//$.get("BarrierAndStreamInfoOpt50.json", function(data){ 
	//$.get("BarrierAndStreamInfoOptReduced.json", function(data){ 
	//$.get("BarrierAndStreamInfoOptNetworkReduced2.json", function(data){  
	//$.get("BarrierAndStreamInfo.json", function(data){
	//$.get("BarrierAndStreamInfoSubNetwork.json", function(data){	
		dataManager.init(data);
		dataManager.addEventsToAllBranches(dataManager.networkSource);
		// tmp comment ourAlert("finished setting things up!") 
	});  
}
 
// start everything!    
main(); 
