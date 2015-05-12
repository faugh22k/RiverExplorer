Hello!

How to extract a subnetwork and convert it JSON 

	run: getNetworkByRoot.py
		 convertToTree.py
		 reduceStreamSegments.py
		 convertToJSONTieBreaking.py

		 for running getNetworkByRoot:
		 	you will need to know the id of the root for the subnetwork you want to extract
		 	The best way to choose this is by looking at IDs in RiverExplorer

		 getNetworkByRoot will output its data to optReduced/. 
		 	That means that the input folder used for convertToTree and reduceStreamSegments should be optReduced/. 
		 	Both scripts will allow you to change the input/output folder during the run.
		 		Using this option is suggested over changing values directly. 

		 convertToJSONTieBreaking has many toggle options 
		 	while running, choose to change the value of opt
		 		this will result in the script using optReduced/ instead of opt/
		 		Output file names will also be updated to conform to appropriate defaults. 

		 	this script needs to know the ID of the root of the network it is converting data for,
		 	but you should not need to worry about updating/setting the root. getNetworkByRoot writes
		 	the ID to a file, which convertToJSON reads to find the root ID. 

		 Technically, running convertToTree and reduceStreamSegments is optional.
		 	If you choose not to run them, also toggle the corresponding variables in convertToJSONTieBreaking
		 	(it will allow you to change as many values as you wish)

		 	It is strongly suggested that you run convertToTree, as it corrects data inconsistencies to do
		 	with river networks not being perfect tree structures. 

		 	reduceStreamSegments simply simplifies stream segments, reducing data file size and increasing setup speed. 



If you want to find the network root for an opt data file, use findRootFromOpt
	It will print the rootID 

Good luck! :) 



