class jrfReport{
	constructor(theConfig){
		var self=this;
		self.config=theConfig;
		self.rootElements=[];
		var tm=System.webapp.getTaskManager();
		tm.extendObject(self);
		self.jira=System.webapp.getJira();
		self.confluence=System.webapp.getConfluence();
	}
	save(){
		
	}
	load(){
		
	}
	execute(){
		var self=this;
		// first launch all issue retrieve ...
		self.addStep("Getting All Issues.... ",function(){
			self.jira.getAllIssues();
		});	
		// get root elements.... issues and/or projects
		self.addStep("Getting root elements.... ",function(){
			log("Getting root elements");
			if (self.config.rootByJQL)
			self.continueTask();
		});
		
		// assing childs and advance childs to root elements
		// load report model and submodels
		// replace the jrf Tokens
		self.continueTask();
	}
}