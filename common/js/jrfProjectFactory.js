function newProjectFactory(report){
	var theReport=report;
	var dynObj=newDynamicObjectFactory( 
		[{name:"Board",description:"List of Boards in Project",type:"object"},
		 {name:"Issue",description:"List of Issues in Project",type:"object"},
		 {name:"Sprint",description:"List of Sprints in Project",type:"object"},
		 {name:"Version",description:"List of Versions in Project",type:"object"}
		]
		,
		["Key","Name"]
		,
		[]
		,
		//undefined
		"Project",false
		);
	return dynObj;

}