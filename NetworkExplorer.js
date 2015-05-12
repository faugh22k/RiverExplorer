// all the style options for the tool
// format:
// 		styles = {
//			<style-option>,
//			<style-option2>, 
// 			[...additional styles...]  
// 		}
//
//  	format of a style option:
//  		style-option : {
//				oneNodeTypeSettings : {
//					r : __, fill : __, opacity : __, stroke : __
//				}, 
//				[...settings for other node types...],
//
//				streamTypeSettigns : {
//					"stroke-width" : __, stroke : __
// 				},
//			    [...settings for other stream types...], 
//			
//				colorScaleFunction : chroma.interpolate.bezier([<colors specifying color scale here>])
//			}
//			
var styles = {
	whiteStyle: {
		"unselectedNode": {
			r       : 2,
			fill    :  "#D4D4D4",
			opacity : ".30", 
			stroke  : "transparent",
			//"stroke-width": 0,
			//"stroke-opacity": 0
		}, 
		pathToRootBarrier: {
			r       : 2,
			fill    :  "#D7BCBC", // paler version of crossing no action
			opacity : ".55", 
			stroke  : "transparent",
			//"stroke-width": 0,
			//"stroke-opacity": 0 
		},
		"pathToRootNonBarrier": {
			r       : 2,
			fill    :  "#D4D4D4", // paler version of crossing no action
			opacity : ".55", 
			stroke  : "transparent",
			//"stroke-width": 0,
			//"stroke-opacity": 0 
		},
		"nonBarrier": {
			r                : 2,
			fill             : "CCCCCC", // gray	
			opacity          : 0.70, 
			stroke           : "transparent", 
			//"stroke-width"   : 0,
			//"stroke-opacity" : 0
		},
		"crossingNoAction": {
			r                : 5,
			fill             : "#BC8F8F", // rosy brown //"#FFFF00", // red
			opacity          : 0.75, 
			stroke           : "transparent",
			//"stroke-width"   : 0,
			//"stroke-opacity" : 0
		},
		damNoAction: {
			r                : 10,
			fill             : "#FF8080", // red
			opacity          : 0.8,
			stroke           : "transparent",
			//"stroke-width"   : 0,
			//"stroke-opacity" : 0
		},
		crossingAction: {
			r                : 6,
			fill             : "#00FF00", // green "#00FF7F",  // spring green "#FFFF00", // yellow
			opacity          : 1,
			stroke           : "#666666", // medium gray
			//"stroke-width"   : 3,
			//"stroke-opacity" : 1
		},
		damAction: {
			r              : 20,
			fill           : "#00FF00", // green  // spring green "#FFFF00", // yellow
			opacity        : "1",
			stroke         : "#666666", // medium gray
			//"stroke-width" : 10,
			//"stroke-opacity": 1
		},

		selectedStream: {
			"stroke-width" : 9 
		},

		unselectedStream: {
			"stroke-width" : 1,
			stroke : "#CCCCCC"
		},

		pathToRootStream: {
			"stroke-width" : 7,  
			stroke : "black"
		},

		colorScaleFunction : chroma.interpolate.bezier(['#E0E0E0', 'lightgreen', 'teal', 'mediumblue'])
	},

	darkStyle: {
		"unselectedNode": {
			r       : 2,
			fill    :  "#D4D4D4",
			opacity : ".30", 
			stroke  : "transparent",
			//"stroke-width": 0,
			//"stroke-opacity": 0
		}, 
		"pathToRootBarrier": {
			r       : 2,
			fill    :  "#003366", // paler version of crossing no action
			opacity : ".55", 
			stroke  : "transparent",
			//"stroke-width": 0,
			//"stroke-opacity": 0 
		},
		"pathToRootNonBarrier": {
			r       : 2,
			fill    :  "#669900", // paler version of crossing no action
			opacity : ".55", 
			stroke  : "transparent",
			//"stroke-width": 0,
			//"stroke-opacity": 0 
		},
		"nonBarrier": {
			r                : 3,
			fill             : "003366", // gray	
			opacity          : 0.70, 
			stroke           : "transparent", 
			//"stroke-width"   : 0,
			//"stroke-opacity" : 0
		},
		"crossingNoAction": {
			r                : 3,
			fill             : "#FFFF66", // rosy brown //"#FFFF00", // red
			opacity          : 0.75, 
			stroke           : "transparent",
			//"stroke-width"   : 0,
			//"stroke-opacity" : 0
		},
		damNoAction: {
			r                : 5,
			fill             : "#FF6E2C", // red
			opacity          : 0.8,
			stroke           : "transparent",
			//"stroke-width"   : 0,
			//"stroke-opacity" : 0
		},
		crossingAction: {
			r                : 5,
			fill             : "#78c44c", // green "#00FF7F",  // spring green "#FFFF00", // yellow
			opacity          : 1,
			stroke           : "#666666", // medium gray
			//"stroke-width"   : 3,
			//"stroke-opacity" : 1
		},
		damAction: {
			r              : 8,
			fill           : "#FF6E2C", // green  // spring green "#FFFF00", // yellow
			opacity        : "1",
			stroke         : "#8D198D", // medium gray
			//"stroke-width" : 10,
			//"stroke-opacity": 1
		},

		selectedStream: {
			"stroke-width" : 7
		},

		unselectedStream: {
			"stroke-width" : 2,
			stroke : "#CCCCCC"
		},

		pathToRootStream: {
			"stroke-width" : 5, 
			stroke : "black"
		},

		colorScaleFunction : chroma.interpolate.bezier(['#223535', 'darkslategray', 'teal', 'cornflowerblue', 'deepskyblue'])
	}
} 






/**********************************************************************************************
 *  Node class. 
 *    Stores a node in the river network, which may be a barrier or a split in the river.
 *    A node can have as many children as necessary. A child connection includes the child
 *    node and the length and accessibility of the river segment connecting the two nodes.
 *    Every node is uniquely identified by an id. That id is not the same as the barrier id
 *    in the original input data. 
 **********************************************************************************************/
function Node (id, isBarrier, barrierType, possibleActions, passability){
	this.id = id;

	this.isBarrier = isBarrier; 
	this.barrierType = barrierType;     // 1 crossing 2 dam

	// stores the possible actions and the resulting improved passability
	// in a dictionary
	this.possibleActions = possibleActions;

	this.passability = passability;     			// passability when no action is taken
	this.passabilityImprovement = 0.0;  			// the improvement to the base-level passability
	this.improvedPassability = this.passability;    // the current passability (with action taken)
	
	this.accessibilityFromRoot = -1;				// the accessibility coming in from the root of the network
	this.accessibilityLeaving;						// the accessibility leaving the node 

	this.x = 0;										// the original x and y for the node
	this.y = 0; 									// found from the stream data, so when
													// nodes are created the number hasn't been
													// retrieved yet
	

	// 2D array to store the connections to the node's children
	// this array stores the child nodes, as well as all information
	// needed for the edges
	this.children = new Array();
	this.children[0] = new Array(); 				// the child node  (will be upstream of node)
	this.children[1] = new Array(); 				// the length of the stream segment to child
	this.children[2] = new Array(); 				// the accessibility of the stream segment to the child
	this.children[3] = new Array(); 				// the streamSegments path object for drawing
	this.children[4] = new Array(); 				// the stream id 
	
	this.parent = null;								// the parent of a node is downstream
													// the parent is not known until the streams data is processed
	
	this.selected = true;							
	this.partiallySelected = false;					// if a node is partially selected, it is on the path to the root
													// from the currently selected subnetwork
	
	this.nodeDrawing = null;						// stores raphael circle object for the node
	this.needsNodeDrawing = true;					// non-barriers do not have drawn circles for them
	this.needsClickListener = true;					 
	
	this.currentAction = -1;						// stores currently chosen action at this node
	this.previousHabitat = -1;						// the last habitat gain amount
	this.originalHabitat = -1;						// the amount of habitat within the subnetwork starting at
													//   node from when no actions were taken 
	this.currentHabitat = -1;  						// the current amount of habitat starting from node
	
	this.requireRepaint = true; 					// only repaint when it is possible that the display 
													// of this node or part of the subnetwork is different
													// managed by setters and paint functions
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
	 * Add the node drawing for the node and its descendants (if they 
	 * are barriers). 
	 *
	 * override: boolean
	 *           add a node drawing for this node, regardless of 
	 *			 its barrier status. (intended use: making roots have drawings)
	 **/
	Node.prototype.addDrawingNodes = function(override){ 
		// add a drawing if appropriate
		if (this.needsNodeDrawing && (this.isBarrier || override)){
			this.needsNodeDrawing = false; 

			// the drawing settings will be updated in paint
			this.nodeDrawing = paper.circle(this.x,this.y,5); 
		} 
		 
		// add drawings for all barrier children nodes
		for(index in this.children[0]){
			this.children[0][index].addDrawingNodes(false);
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
		// there is no passability improvement from the base level
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
	 * This string is not an html report string, which is given by htmlReportString()
	 **/
	Node.prototype.toString = function (){ 
		return this.formatInformation("\n")
	},

	/** 
	 * Return a string with the node id, the id of its children, and information
	 * about passability, accessibility, and selection status.
	 * 
	 * This string is in html format (to be used for displaying information
	 * on the page itself). 
	 **/
	Node.prototype.htmlReportString = function (){  
		return this.formatInformation("<br>")
	},

	/**
	 * Return a string with the node id, the id of its children, and information
	 * about passability, accessibility, and selection status.
	 *
	 * Depending on the use of the string, it will need a different line break
	 * symbol. "<br>" should be used for html, and "\n" should be used for other 
	 * uses such as logged messages.  
	 **/
	Node.prototype.formatInformation = function (lineBreak){
		output = "ID " + this.id + lineBreak;    			// always display ID
		
		if (this.isBarrier){ 								// if barrier, display type
			if (this.barrierType == 1){
				output += "Crossing " + lineBreak;
			} else if (this.barrierType == 2){
				output += "Dam " + lineBreak;
			}

			output += "passability: " + this.passability.toFixed(3) + lineBreak;  // display the base passability

			if(this.currentAction != -1){										  // if an action has been taken,	
				output += "action taken: " + this.currentAction + lineBreak; 	  // display the improved passability, action	
				output += "improved passability: " + this.improvedPassability.toFixed(3) + lineBreak;   
			}
		}
		
		// if there are streams leading out from this node, the accessibility leaving the node
		if (this.children[2] != undefined && this.children[2][0] != undefined){
			output += "accessibility going out: " + this.children[2][0].toFixed(3) + lineBreak; 
		}  

		return output;
	},

	/** 
	 * Return a string with the stream ID and the accessibility of the stream.
 	 * 
	 * This string is in html format. 
	 **/
	Node.prototype.htmlReportStringForStream = function (index){ 
		output = "Stream " + this.children[4][index] + "<br>";    
		if (this.children[2][index] != undefined) { 
			output += "accessibility: " + this.children[2][index].toFixed(3) + "<br>"; 
		} else {
			console.log("accessibility of stream segment " + index + " of " + this.id + 
				" is undefined upon report generation. \n\n " + this.toString())
		}

		output += "<br>parent node: " + this.id

		return output;
	},

	/**
	 * Sets the selection status of this node to the value of param selected.  
	 *
	 * Flags the node as needing paint if the value is changed.
	 **/ 
	Node.prototype.setSelection = function (selected){
		if (this.selected != selected){
			this.requireRepaint = true
			this.selected = selected  
		}
	},

	/**
	 * Sets the partial selection status of this node to param partiallySelected.
	 * If a node is partially selected, it is on the path to the root. 
	 *
	 * Flags the node as needing paint if the value is changed.  
	 **/ 
	Node.prototype.setPartialSelection = function (partiallySelected){
		if (this.partiallySelected != partiallySelected){
			this.requireRepaint = true
			this.partiallySelected = partiallySelected  
		}
	}, 

	/**
	 * Set the colors of the node drawing and the colors of stream segments
	 * leading to the child nodes; then call the function for all descendants. 
	 *
	 * If the node does not need repaint, does not repaint the node
	 * or its outgoing streams, but the function does still call 
	 * itself on the child nodes. It is possible that they require
	 * a repaint. 
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
	 *
	 * If repaint is not needed, does nothing. 
	 **/
	Node.prototype.colorSelected = function() {
		if (!this.requireRepaint){ 
			return  
		}

		// selected
		// color the node  
		if (!this.needsNodeDrawing){

			// non-barrier node
			if (!this.isBarrier){ 
				// the only node that isn't a barrier and is being colored is the root
				this.nodeDrawing.attr(currentStyle.nonBarrier);
			} 

			// barrier node
			else {
				// no action taken 
				if (this.currentAction == -1){
					// crossing 
					if(this.barrierType == 1){
						this.nodeDrawing.attr(currentStyle.crossingNoAction);
					} 
					// dam 
					else { 
						this.nodeDrawing.attr(currentStyle.damNoAction);
					} 
				} 

				// some action taken  (dam or crossing)
				else {
					// crossing
					if(this.barrierType == 1){
						this.nodeDrawing.attr(currentStyle.crossingAction); 
					} 
					// dam
					else {
						this.nodeDrawing.attr(currentStyle.damAction);
					}
				}
			}
		}

		// color the paths to the children (river segments)
		for (index in this.children[0]){ 
			// since the color of selected streams changes, must get the current color
			// (get the color from the gradient based on accessibility)
			colorString = this.getColor(this.children[2][index]) 
			
			this.children[3][index].attr({
				stroke         : colorString,
				"stroke-width" : currentStyle.selectedStream["stroke-width"]
			}); 
		}
	},

	/**
	 * Set the colors for selected areas. 
	 *
	 * If repaint is not needed, does nothing.  
	 **/
	Node.prototype.colorUnselected = function() {
		if (!this.requireRepaint){ 
			return    
		}  

		if (!this.needsNodeDrawing){

			// on the path to the root 
			if(this.partiallySelected){
				// non-barrier
				if(!this.isBarrier){ 
					this.nodeDrawing.attr(currentStyle.pathToRootNonBarrier)
				} 
				// barrier
				else { 
					this.nodeDrawing.attr(currentStyle.pathToRootBarrier)
				}
			} 

			// completely unselected
			else {     
				this.nodeDrawing.attr(currentStyle.unselectedNode)     
			}    
		}
 
		for (index in this.children[0]){  
			// if this and the child are partiallySelected, this stream is on the path to root   
			if(this.partiallySelected && (this.children[0][index].partiallySelected || this.children[0][index].selected)){ 
				this.children[3][index].attr(currentStyle.pathToRootStream); 
			} 

			// this outgoing stream is completely unselected
			else {  
				this.children[3][index].attr(currentStyle.unselectedStream);
			}  
		} 
	},

 
 	/**
 	 * Get the appropriate color for a stream segment. 
 	 *
 	 * accessibility is used to retrieve the appropriate color
 	 * from the color gradient. 
 	 **/
	Node.prototype.getColor = function(accessibility){   
		return currentStyle.colorScaleFunction(accessibility).hex();
	},

	/**
	 * Calculate the habitat for the node by taking to sum   
	 * of each descendant segment's accessibility times the   
	 * length.   
	 *
	 * if isOriginal is true, stores the habitat calculated
	 * as the original amount of habitat at the node (before 
	 * actions are taken) 
	 **/ 
	Node.prototype.calculateHabitat = function(isOriginal){
		this.previousHabitat = this.currentHabitat		// used for flagging requireRepaint 

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

		if (isOriginal) {
			// original habitat is the original habitat for the subnetwork starting
			// from this node. It is used to calculate habitat improvement, so it 
			// should not be dependent upon the accessibilities of segments leading 
			// to this subnetwork form the root. 
			this.originalHabitat = habitat/this.accessibilityFromRoot
		}

		this.currentHabitat = habitat;
		return habitat;
	}, 

	/**
	 * Calculate the accessibility of the node's child segments 
	 * by multiplying initial accessibility (comingIn) by the 
	 * passability. Then call itself for the node's descendants.  
	 **/ 
	Node.prototype.calculateAccessibility = function(comingIn){
		originalAccessibility = -1
		
		// if this node has children, compare outgoing accessibility
		// (for repaint flagging)
		compare = false
		if (this.children != null && this.children[2][0] != null){
			originalAccessibility = this.children[2][0]
			compare = true
		}

		if (this.accessibilityFromRoot == -1){
			this.accessibilityFromRoot = comingIn
		}

		if(this.isBarrier){ 
			accessibility = comingIn * this.improvedPassability;  
		} else { 
			accessibility = comingIn;
		} 

		// if the node has children, it will need to be repainted 
		// if the accessibility has changed
		if (compare && originalAccessibility != accessibility){
			this.requireRepaint = true
		}

		// these loops need to be separate
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
	this.networkSource = [];      		// in case there are multiple networks, store the roots in array
	this.selectedNode = selectedNode;   // the root fo the currently selected subnetwork
	this.allNodes = allNodes;    		// dictionary of all nodes indexed by node id

	this.OPT = OPT;						// the solution data
	this.budget = budget;  				// the current budget available 
}  

	/**
	 * Selects the subnetwork rooted at node calledFrom, partially
	 * selects the path to the root, and completely deselects the rest of the network. 
	 *
	 * Updates the current solution as well. 
	 *
	 * Called when a node or stream is clicked. 
	 **/ 
	DataManager.prototype.updateSelected = function (calledFrom){ 
		ourAlert("in updateSelected. calledFrom \n" + calledFrom.toString());  
		
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
		current.passabilityImprovement = 0.0 				// there is no improvement
		current.improvedPassability = current.passability 	// reset to base level
		current.currentAction = -1   						// no action is being taken

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
	 * Finds the solution for the current budget and selected subnetwork
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
		// stores the best found solution entry point
		// it is possible that there is not solution with the exact same budget,
		// so we take the closest one <= budget
		closestEntry = null
		closestCost = null
		desiredID = dataManager.selectedNode.id
		entriesForNode = dataManager.OPT[desiredID] 

		ourAlert("our budget is " + dataManager.budget + " and we're starting from node " + desiredID)
		foundAnEntry = false
		
		for (key in entriesForNode) {
			entry = entriesForNode[key]
			cost = Number(entry["cost"]) 
			

			if (!isNaN(cost) && ((closestCost == null && cost <= dataManager.budget) || 
				((dataManager.budget - cost) < (dataManager.budget - closestCost)) && cost <= dataManager.budget)) {  
				closestEntry = entry
				closestCost = cost 
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
	 * (click and hover)
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
					information.innerHTML = node.htmlReportString()  
				}, function(){
					information.innerHTML = "<br>" 
				});
			}

			// add events to streams leaving the node
			for (index in node.children[3]){
				node.children[3][index].click(function(){ 
					dataManager.updateSelected(node);
				});

				node.children[3][index].hover(function(){ 
					information.innerHTML = node.htmlReportStringForStream(index)     
				}, function(){
					information.innerHTML = "<br>" 
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
	 * Reads in all the nodes, creates objects for them, and stores them into a dictionary.  
	 * Returns the dictionary with all of the nodes
	 *
	 * nodes is the portion of the json data that encodes the nodes information
	 **/ 
	DataManager.prototype.readInNodes = function  (nodes){ 
		// read in all the nodes, create objects for them, and store them into a dictionary.  
		allNodes = {};
		numberNodes = 0;
		barrierTypes = {"0":0, "1":0, "2":0};  // to check that the barrier types are reasonable
		
		for (index in nodes){
			current = nodes[index];
			currentID = current.ID;  
 
			
			action = null
			// store the appropriate options for actions: crossings, dams, or no actions 
			if(current.barrierType == 1){
				action = crossings 
				barrierTypes["1"] += 1;
			} else if (current.barrierType == 2){ 
				action = dams 
				barrierTypes["2"] += 1;
			} else {
				barrierTypes["0"] += 1;
			}

 			// id, isBarrier, barrierType, possibleActions, passability 
 			newNode = new Node(currentID, current.isBarrier, current.barrierType, action, current.passability);         
			allNodes[currentID] = newNode 
   
			numberNodes++; 
		} 
   
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

 
				/*if (downstream.hasChild(upstream)){
					alert("already has connection")
					continue;
				} */

				// build a path for drawing each stream
				// Mx,y moves a metaphorical pencil to a point
				// Lx,y draws a line from where the pencil is to x,y 
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

				// use the start and end points of the stream's path for the node's XY coordinates. 
 	 			downstream.setXY(current.segments[0], current.segments[1]);   
				upstream.setXY(current.segments[j-2], current.segments[j-1])  
  
				downstream.addChild(upstream, current.length, 0, path, index);  
				successes++; 
			} catch (error) {  
				problems++;
			} 
		}
		
		if (nodesMissingReport != ""){
			console.log("missing: " + nodesMissingReport) 
		}
		console.log("\nread in the stream segments.\n");
		console.log(successes + " successful");
		console.log("(encountered " + problems + " problems along the way)");
	}, 

	/**
	 * Performs the initial operations required for each network. 
	 * (calculations, deselection, and color setting) 
	 **/ 
	DataManager.prototype.initNetwork = function  (root){ 
		root.addDrawingNodes(true);   			// add node drawings, including one for the root
		root.calculateAccessibility(1.0);		// calculate accessibility starting from full 1.0
		root.calculateHabitat(true);			// calculate current habitat and store it as initial habitat
		this.deselect(root)						 
		root.setColors();						 
		root.nodeDrawing.attr({r:20});  
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

var budget;   // current allocated budget   
var slider;   // slider to change the budget  

var information;   // html element to display node/stream information 
var summary;       // html element to display overall summary information


var circle;
var width;
var height; 


// raphael variables
var paper;      //  rapael canvas element 
var viewBox;    //  used for initial paper dimensions 
var canvas;     //  html area where the paper element is placed 

 
// used for panning in responce to mouse drag
var mouseIsDown = false;
var mouseDownX;
var mouseDownY;
var mouseUpX;
var mouseUpY; 

// current transformation settings  
var translateX;
var translateY;
var scale;

// html elements to control scale and translate 
var svgPan;
var svgScale;

// the width and height of the svg drawing area
// used to determine current network width and height
var svgWidth;
var svgHeight; 

// the network coordinates that are currently being 
// displayed at the center of the screen 
var networkCenter; 

// color scale for accessibilities 
var colors;

// visual settings for barriers and streams
// are now at the top of the file because
// the styles are space intensive

// the chosen style for the curent display of the website
// specifies colors and other drawing settings for nodes
// and streams
var currentStyle = styles.whiteStyle  

// settings for how to display alerts
var shouldDisplayAlerts = false
var displayAlertsInConsole = true




/** 
 * If two valid numbers are given, translates the specified the amount. 
 **/
function translate(xChange, yChange){
	console.log("in translate (x,y) " + xChange + "," + yChange)
	// NaN: not a number
	// NaN does not equal itself, so isNaN is needed to make sure there are 
	// 2 valid numbers. 
	if (!isNaN(xChange) && !isNaN(yChange)) {   

		networkCenter[0] -= xChange/scale
		networkCenter[1] -= yChange/scale

		resetTranslation() 
	};
}

/**
 * Updates the currents svg translation according to current
 * scale and networkCenter 
 **/
function resetTranslation(){ 

	newTopLeft = recalculateNetworkTopLeft()


	translateX = -newTopLeft[0] 	// because it is the canvas that is being moved around
	translateY = -newTopLeft[1]	 	// we need to translate by the opposite of the amount
									// we want the visual components to be translated by

	console.log("new translate x,y: " + translateX + ", " + translateY) 
	
	svgPan.setAttribute('transform', 'translate(' + translateX + ',' + translateY + ')')  
}

/**
 * Calculates the current network coordinate that should be located
 * at the top left corner of the display area. (calculated from 
 * current scale and networkCenter) 
 *
 * (network coordinates come from the x,y values read in from the network data.)   
 **/
function recalculateNetworkTopLeft(){ 

	// calculate the current network width and height on display
	networkWidth = svgWidth/scale 
	networkHeight = svgHeight/scale  

	// find the top left corner
	networkTopLeft = [networkCenter[0] - networkWidth/2, networkCenter[1] - networkHeight/2] 

	return networkTopLeft 
}

/**
 * Updates settings to center the given area in the display window
 **/
function transformToDisplayArea(leftX, topY, rightX, bottomY){ 

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
  

	networkCenter = [(leftX+rightX)/2, (topY+bottomY)/2] 
	resetTranslation() 

}
 

/**
 * Zoom in slightly
 **/ 
function zoomIn()
{
	zoom(1.15); 
}

/**
 * Zooms out slightly
 **/ 
function zoomOut()
{
	zoom(0.85); 
}

/**
 * Zoom by factor, update current display transformations
 **/ 
function zoom(factor){ 
	console.log("\n\nzooming by " + factor)
	console.log("current scale " + scale)
	if(!isNaN(factor)){      
		scale *= factor  

		
		svgScale.setAttribute('transform', 'scale(' + scale + ')')    
		resetTranslation()
	}
}

 
/**
 * Updates Raphael/SVG's viewbox properties to shift the visible portion of the canvas.
 * 
 * Should not be called after the initial setup
 **/
function initViewBox() { 
	svg = document.getElementsByTagName("svg")[0]; 
	// view box: [leftX, topY, rightX, bottomY]   
	w = viewBox[2] - viewBox[0]; 
	h = viewBox[3] - viewBox[1];  
	paper.setViewBox(0 - viewBox[0], 0 - viewBox[1], w, h);     
}

  
/**
 * Responds a change in the budget slider (once user has stopped dragging the handle)
 **/
function updateBudget(){ 
	if(dataManager.budget != slider.value){ 
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
 * Add mouse events to the page (mouse down, mouse move, mouse up, mouse zoom)
 **/ 
function addMouseEvents(){  

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
        mouseIsDown = true;
        mouseDownX = event.pageX;
        mouseDownY = event.pageY; 
    };

    // Action performed when mouse button is released
    var mouseUpListener = function(event)
    {         
        mouseIsDown = false;
    };

    // Action performed when mouse is moving
    var mouseMoveListener = function(event)
    {

        // Do nothing unless dragging
        if(mouseIsDown)
        {    
        	currentx = event.pageX ;
        	currenty = event.pageY ;

        	xChange = currentx - mouseDownX;
        	yChange = currenty - mouseDownY;

        	mouseDownX = currentx;
        	mouseDownY = currenty; 

        	translate(xChange,yChange);  
        }
    };

    // Action performed when mouse scroll is scrolled
    var mouseZoomListener = function(event)
    {
        /* we want to prevent document scrolling when pressing the arrows: */
		event.preventDefault();

		// Delta returns +120 when up and -120 when down 
		// There might be some browser issues according to online sources
		// For now it works for chrome
        if (event.wheelDelta >= 120)
        {zoomIn();}
    	else if (event.wheelDelta <= -120)
        {zoomOut();}
    };

    //Adding all the listeners for mouse events: down, up, move, scroll
    canvas.addEventListener("mousedown",mouseDownListener,false);
    canvas.addEventListener("mouseup", mouseUpListener,false);
    canvas.addEventListener("mousemove", mouseMoveListener, false);
    canvas.addEventListener('mousewheel', mouseZoomListener, false);  

}

/**
 * Add events to zoom in and out using - and + keys, and to pan using the arrow keys. 
 **/ 
function addKeyPressEvents(){
	$(document).keydown(function(event) {
	

		/* since we are using jquery, the event is already normalized */
		var arrowKeys = {"left": 37, "up": 38, "right": 39, "down": 40, "plus": 187, "minus": 189};
		var irrelevantKey = false;
		
		// if a command or control key is pressed, the default 
		// event should occur. 
		if ((event.ctrlKey||event.metaKey)){
			return;
		}
		
		if(event.keyCode == arrowKeys["left"]) {
			translate(10, 0);
		}
		else if(event.keyCode == arrowKeys["up"]) {
			translate(0, 10);			
		}
		else if(event.keyCode == arrowKeys["right"]) {
			translate(-10, 0);
		}
		else if(event.keyCode == arrowKeys["down"]) {
			translate(0, -10);
		} 
		else if(event.keyCode == arrowKeys["plus"]){
			zoomIn() 
		} 
		else if(event.keyCode == arrowKeys["minus"]){
			zoomOut()
		} 
		else {
			console.log("irrelevantKey: " + event.keyCode)
			irrelevantKey = true
		}
	
		/* we want to prevent document scrolling when pressing the arrows: */ 
		if (!irrelevantKey){
			event.preventDefault();
		}
		
	
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
	addMouseEvents();
	addKeyPressEvents();
	addButtonEvents();
} 

/**
 * Set up raphael paper element relative to the current browser window size
 **/ 
function initDisplaySettings(){
	browserWidth = $(window).width();
	browserHeight = $(window).height();

	width = browserWidth - 300; //752;//470;
	height = browserHeight - 200; //470; 
 	 
	viewBox = [0, 0, width, height] ;
 
	canvas = document.getElementById('canvas');
	paper = new Raphael(document.getElementById('canvas'), width, height);   

	svgWidth = width;
	svgHeight = height;

    // Setting preserveAspectRatio to 'none' lets you stretch the SVG
	paper.canvas.setAttribute('preserveAspectRatio', 'none');
 
	initViewBox()  
}

/**
 * Initializes the transfomation html elements and the transformation settings
 **/
function initTransformElements(){   

	translateX = 0
	translateY = 0   
	scale = 1

	// used to manually pan
	svgPan = document.createElementNS("http://www.w3.org/2000/svg", "svg:g"); 
	svgPan.setAttribute('transform', 'translate(0,0)');   

	// used to manually zoom
	svgScale = document.createElementNS("http://www.w3.org/2000/svg", "svg:g"); 
	svgScale.setAttribute('transform', 'scale(1)');  
	
	var svgComponents = canvas.childNodes;
	var svgComponent = svgComponents[0];

	$(svgComponent).wrapInner(svgScale);

	svgScale.setAttribute('transform', 'translate(40,40)');   

	var wrapper = svgComponent.childNodes[0];

	wrapper.setAttribute('transform', 'translate(40,40)');   
	$(wrapper).wrapInner(svgPan) 

	svgScale = wrapper;
	svgPan = wrapper.childNodes[0];
}



/**
 * Starts the program, though is not called automatically by javascript. 
 * Called for onload from withing the html file
 *
 * Initializes variables for NetworkExplorer and adds listeners to items
 * on the webpage. 
 **/ 
function main(){   
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

	if (typeof localData !== 'undefined') {
		// Working locally: localData is a global variable loaded from localData.js
		dataManager.init(localData);
		dataManager.addEventsToAllBranches(dataManager.networkSource);
	}
	else {
		// Normal case: make async call for the data
		var barrierFile = "BarrierAndStreamInfoOpt.json"; // change this to use different data
		//var barrierFile = "BarrierAndStreamInfoOptReduced1.json"; // smaller test network one (westfield) 
		//var barrierFile = "BarrierAndStreamInfoOptReduced2.json"; // smallest test network two (in middle left area of the main one)
		//var barrierFile = "BarrierAndStreamInfoOptReduced3.json"; // largest test network three (top third of main watershed)

		$.get(barrierFile, function(data){  
			dataManager.init(data);
			dataManager.addEventsToAllBranches(dataManager.networkSource);
		});
	}
} 
