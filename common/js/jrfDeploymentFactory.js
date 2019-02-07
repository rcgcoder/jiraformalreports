function newDeploymentFactory(report){
	var theReport=report;
	var dynObj=newDynamicObjectFactory( 
		[{name:"Issue",description:"List of Issues in Deployment",type:"object"},
		{name:"AccumulatedIssues",description:"List of total Issues deployed with this Deployment",type:"object"},
		]
		,
		["Key","Name","Description",
		"Status","DevelopmentDate","PreproductionDate","ProducctionDate"]
		,
		[]
		,
		//undefined
		"Deployment",false
		);
	return dynObj;
}