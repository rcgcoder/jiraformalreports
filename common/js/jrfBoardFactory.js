function newBoardFactory(report){
	var theReport=report;
	var dynObj=newDynamicObjectFactory( 
		[{name:"Issue",description:"List of Issues in Board",type:"object"},
		 {name:"Sprint",description:"List of Sprints in Board",type:"object"},
		 {name:"Version",description:"List of Versions in Board",type:"object"}
		]
		,
		["Key","Name","Type"]
		,
		[]
		,
		//undefined
		"Board",false
		);
	return dynObj;

}