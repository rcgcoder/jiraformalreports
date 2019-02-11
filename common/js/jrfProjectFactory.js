function newProjectFactory(report){
	var theReport=report;
	var dynObj=newDynamicObjectFactory( 
		[{name:"Board",description:"List of Boards in Project",type:"object"},
		 {name:"Issue",description:"List of Issues in Project",type:"object"},
		 {name:"Sprint",description:"List of Sprints in Project",type:"object"},
		 {name:"Version",description:"List of Versions in Project",type:"object"}
		]
		,
		["Key","Name","Report"]
		,
		[]
		,
		//undefined
		"Project",false
		);
	dynObj.functions.add("loadSprints",function(){
		var self=this;
		var report=self.getReport();
		var oJira=report.jira;
		report.parallelizeProcess(self.getBoards(),function(board){
			report.addStep("Getting Board Sprints of project "+self.getKey(),function(){
				oJira.getBoardSprints(board.getKey());
			});
			report.addStep("Processing Board ("+board.getKey()+") Sprint List for project "+self.getKey(),function(arrSprints){
				arrSprints.forEach(function(srcSprint){
					var srcSprintKey=srcSprint.id+"";
					var oSprint=report.sprints.new(srcSprint.name,srcSprintKey);
					oSprint.setKey(srcSprintKey);
					oSprint.setStatus(srcSprint.state);
					oSprint.setBoard(board);
					board.addSprint(oSprint,srcSprintKey);
					self.addSprint(oSprint,srcSprintKey);
					if (isDefined(srcSprint.startDate)){
						oSprint.setStartDate(new Date(srcSprint.startDate));
					}
					if (isDefined(srcSprint.endDate)){
						oSprint.setEndDate(new Date(srcSprint.endDate));
					}
					if (isDefined(srcSprint.completeDate)){
						oSprint.setCompleteDate(new Date(srcSprint.completeDate));
					}
				});
			});
		});
		report.addStep("Filling Versions of project "+self.getKey(),function(){
			report.addStep("Getting Version List of Project "+self.getKey(),function(){
				oJira.getProjectVersions(self.getKey());
			});
			report.addStep("adding Versions to Project "+self.getKey(),function(arrVersions){
				arrVersions.forEach(function(version){
					if (!self.getVersions().exists(version.name)){
						var oVersion=report.versions.new(version.name,version.name);
						if (isDefined(version.description)){
							oVersion.setDescription(version.description);
						} else {
							oVersion.setDescription(version.name);
						}
						if (isDefined(version.startDate)) oVersion.setStartDate(version.startDate);
						if (isDefined(version.releaseDate)) oVersion.setReleaseDate(version.releaseDate);
						if (version.released){
							oVersion.setStatus("Deployed");
						} else if (version.archived){
							oVersion.setStatus("Canceled");
						} else if (oVersion.getReleaseDate()!==""){
							if (isDefined(version.overdue)&&version.overdue){
								oVersion.setStatus("Delayed");
							} else {
								oVersion.setStatus("Planned");
							}
						} else {
							oVersion.setStatus("Development");
						}
						self.addVersion(oVersion,version.name);
					}
				});
			});
		});
		report.addStep("Retrieving Issues for all Sprints in project "+ self.getKey(),function(){
			report.parallelizeProcess(self.getSprints(),function(sprint){
				self.addStep("Getting Issues for Sprint "+sprint.getKey()+","+sprint.getBoard().getKey(),function(){
					oJira.getSprintIssues(sprint.getKey(),sprint.getBoard().getKey());
				});
				self.addStep("Processing Issues for Sprint "+sprint.getKey()+","+sprint.getBoard().getKey(),function(arrIssues){
					arrIssues.forEach(function(srcIssue){
						var srcIssueKey=srcIssue.key;
						if (report.allIssues.exists(srcIssueKey)){
							var oIssue=report.allIssues.getById(srcIssueKey);
							sprint.addIssue(oIssue,srcIssueKey);
						}
					});
				});
			});
		});
	});		
	return dynObj;

}