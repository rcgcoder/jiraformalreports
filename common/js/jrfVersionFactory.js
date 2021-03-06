function newVersionFactory(report){
	var theReport=report;
	var dynObj=newDynamicObjectFactory( 
		[{name:"Issue",description:"List of Issues in Version",type:"object"},
		{name:"AccumulatedIssues",description:"List of total Issues running in production with this Version",type:"object"},
		]
		,
		["Key","Name","Description",
		"StartDate","ReleaseDate","Status"]
		,
		[]
		,
		//undefined
		"Version",false
		);
	return dynObj;
}