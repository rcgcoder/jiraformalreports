function newSprintFactory(report){
	var theReport=report;
	var dynObj=newDynamicObjectFactory( 
		[{name:"Issue",description:"List of Issues in Board",type:"object"},
		 {name:"Version",description:"List of Versions in Board",type:"object"}
		]
		,
		["Key","Name","Status","StartDate","EndDate","CompleteDate"]
		,
		[]
		,
		//undefined
		"Sprint",false
		);
	return dynObj;
}