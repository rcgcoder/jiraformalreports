class jrfReport{
	constructor(theConfig){
		var self=this;
		self.config=theConfig;
		self.config.model=System.webapp.model;
		self.allIssues;
		self.rootElements=newHashMap();
		self.rootIssues=newHashMap();
		self.rootProjects=newHashMap();
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
			// create a dynobj for store the issues.... 
			var dynObj=newDynamicObjectFactory(
								[]
								//arrAttributeList
								,
								[]
								//arrAttributes
								,
								[]
								//arrAttributesPercs
								,
								"scopeIssues");
			var fncProcessIssue=function(issue){
				dynObj.new(issue.key,issue.fields.summary);
			}
			
			self.jira.processJQLIssues(self.config.jqlScope.jql,
									  fncProcessIssue,
									  dynObj);
		});	
		self.addStep("Asigning all Issues in the scope.... ",function(allIssues){
			self.allIssues=allIssues;
			log("Report utilices "+ self.allIssues.list.length()+ " issues");
			self.continueTask();
		});	
		// get root elements.... issues and/or projects
		self.addStep("Getting root elements.... ",function(){
			log("Getting root elements");
			if (self.config.rootsByProject){
				if (self.config.rootProjects.length>0){
					log("Loading projects selected to be roots");
					self.config.rootProjects.forEach(function(projectId) {
						self.rootProjects.add(projectId,projectId);
					});

				} else {
					log("there is not projects selected to do a report");
					self.bFinishReport=true;
				}
			}
			if (self.config.rootsByJQL){
				if (self.config.rootIssues.values.length>0){
					self.config.rootIssues.values.forEach(function(issueId) {
						self.rootIssues.add(issueId,issueId);
					});
				} else if (self.config.rootIssues.jql==""){
					log("there is not root issues nor jql to do a report");
					self.bFinishReport=true;
				} else {
					var fncProcessIssue=function(issue){
						self.rootIssues.add(issue.key,issue);
					}
					self.addStep("Processing jql to get root issues:"+self.config.rootIssues.jql,function(){
						self.jira.processJQLIssues(
										self.config.rootIssues.jql,
										fncProcessIssue);
					});
				}
			}
			self.continueTask();
		});
		self.addStep("Processing root elements.... ",function(){
			if (self.bFinishReport) return self.continueTask();
			self.rootIssues.walk(function(value,iProf,key){
				log("Root Issue: "+key);
			})
			self.rootProjects.walk(function(value,iProf,key){
				log("Root Project: "+key);
			})
			log("Resume Root issues:"+self.rootIssues.length() +
			    "		Root project:"+self.rootProjects.length()+
			    "		Issues in scope:"+ self.allIssues.list.length());
			self.continueTask();
		});
		// assing childs and advance childs to root elements
		// load report model and submodels
		// replace the jrf Tokens
		self.addStep("Processing Model",function(){
			var theModel=new jrfModel(self);
			var sModelProcessed=theModel.process();
	        var jqResult=$("#ReportResult");
	        jqResult.html(sModelProcessed);
			
			self.continueTask();
		});
		self.continueTask();
	}
}