class jrfReport{
	constructor(theConfig){
		var self=this;
		self.config=theConfig;
		self.rootElements=[];
		var tm=System.webapp.getTaskManager();
		tm.extendObject(self);
	}
	save(){
		
	}
	load(){
		
	}
	execute(){
		var self=this;
		var jira=System.webapp.getJira();
		// first launch all issue retrieve ...
		self.addStep("Getting All Issues.... ",function(){
			var jira=self.getJira();
			jira.getAllIssues();
		});
		
		// get root elements.... issues and/or projects
		// assing childs and advance childs to root elements
		// load report model and submodels
		// replace the jrf Tokens
	}
}