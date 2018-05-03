class jrfReport{
	constructor(theConfig){
		var self=this;
		self.config=theConfig;
		self.allIssues=[];
		self.rootElements=[];
		self.rootIssues=[];
		self.rootProjects=[];
		self.bFinishReport=false;
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
		self.addStep("Getting All Issues in the Scope.... ",function(){
			var fncGetBlock=self.createManagedCallback(function(blkResponse){
				log("A block");
			});
			if (isDefined(self.config.jqlScope)){
				if (isDefined(self.config.jqlScope.jql)){
					return self.jira.getJQLIssues(self.config.jqlScope.jql,fncGetBlock);
				}
			} 
			self.jira.getAllIssues(fncGetBlock);
		});	
		self.addStep("Asigning all Issues in the scope.... ",function(allIssues){
			self.allIssues=allIssues;
			log("Report utilices "+ self.allIssues.length+ " issues");
			self.continueTask();
		});	
		// get root elements.... issues and/or projects
		self.addStep("Getting root elements.... ",function(){
			log("Getting root elements");
			if (self.config.rootsByJQL){
				if (self.config.rootIssues.values.length>0){
					self.rootIssues=self.config.rootIssues.values;
				} else if (self.config.rootIssues.jql==""){
					log("there is not root issues nor jql to do a report");
					self.bFinishReport=true;
				} else {
					self.addStep("Executing jql:"+self.config.rootIssues.jql,function(){
						self.jira.getJQLIssues(self.config.rootIssues.jql);
					});
					self.addStep("Setting as root issues all results of JQL:"+self.config.rootIssues.jql,function(arrIssues){
						for (var i=0;i<arrIssues.length;i++){
							var issue=arrIssues[i];
							log("Issue:"+issue.key);
							self.rootIssues.push(issue.key);
						}
						self.continueTask();
					});
				}
			}
			if (self.config.rootsByProject){
				if (self.config.rootProjects.length>0){
					log("Loading projects selected to be roots");
					self.rootProjects=self.config.rootProjects;
				} else {
					log("there is not projects selected to do a report");
					self.bFinishReport=true;
				}
			}
			self.continueTask();
		});
		self.addStep("Processing root elements.... ",function(){
			if (self.bFinishReport) return self.continueTask();
			for (var i=0;i<self.rootIssues.length;i++){
				log("Root Issue ["+i+"]: "+self.rootIssues[i]);
			}
			for (var i=0;i<self.rootProjects.length;i++){
				log("Root Projects ["+i+"]: "+self.rootProjects[i]);
			}
			log("Resume Root issues:"+self.rootIssues.length +
			    "		Root project:"+self.rootProjects.length+
			    "		Issues in scope:"+ self.allIssues.length);
			self.continueTask();
		});
		// assing childs and advance childs to root elements
		// load report model and submodels
		// replace the jrf Tokens
		self.continueTask();
	}
}