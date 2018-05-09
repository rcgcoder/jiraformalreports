class jrfReport{
	constructor(theConfig){
		var self=this;
		self.config=theConfig;
		self.config.model=System.webapp.model;
		self.childs=newHashMap();
		self.advanceChilds=newHashMap();
		self.treeIssues=newHashMap();
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
	constructIssueFactory(){
		var self=this;
		// create a dynobj for store the issues.... 
		self.allIssues=newIssueFactory(self);
	}
	execute(){
		var self=this;
		self.addStep("Construct Issue Dynamic Object.... ",function(){
			self.allIssues=newIssueFactory(self);
			self.continueTask();
		});
		// first launch all issue retrieve ...
		self.addStep("Getting All Issues in the Scope.... ",function(){
			var fncProcessIssue=function(issue){
				var oIssue=self.allIssues.new(issue.fields.summary,issue.key);
				oIssue.setJiraObject(issue);
				oIssue.updateInfo();
				oIssue.setKey(issue.key);
			}
			
			self.jira.processJQLIssues(self.config.jqlScope.jql,
									  fncProcessIssue);
		});	
		self.addStep("Asigning all Issues in the scope.... ",function(){
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
				var issue=self.allIssues.getById(key);
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
		self.addStep("Assign Childs and Advance",function(){
			var formulaChild=self.config.billingHierarchy;
			var formulaAdvance=self.config.advanceHierarchy;
			var sFncFormulaChild="var bResult="+formulaChild+"; return bResult;";
			var sFncFormulaAdv="var bResult="+formulaAdvance+"; return bResult;";
			var fncIsChild=Function("child","parent",sFncFormulaChild);
			var fncIsAdvPart=Function("child","parent",sFncFormulaAdv);
			var issuesAdded=newHashMap();
			self.rootIssues.walk(function(value,iProf,key){
				log("Root Issue: "+key);
				var issue=self.allIssues.getById(key);
				issuesAdded.add(key,issue);
				self.childs.add(key,issue);
			});
//			var treeIssues=issuesAdded.toArray([{doFieldName:"self",resultFieldName:"issue"}]);
			var fncGetIssueChilds=function(parentIssue){
				self.allIssues.list.walk(function(issueChild){
					if (issueChild.id=="BENT-242"){
						log("Testing "+issueChild.id);
					}
					var bIsChild=fncIsChild(issueChild,issueParent);
					if (bIsChild){
						issueParent.addChild(issueChild);
						if (!issuesAdded.exists(issueChild.getKey())){
							issuesAdded.add(issueChild.getKey(),issueChild);
							fncGetIssueChilds(issueChild);
						}
					}
					var bIsAdvPart=fncIsAdvPart(issueChild,issueParent);
					if (bIsAdvPart){
						issueParent.addAdvanceChild(issueChild);
						if (!issuesAdded.exists(issueChild.getKey())){
							issuesAdded.add(issueChild.getKey(),issueChild);
							fncGetIssueChilds(issueChild);
						}
					}
				});
			}
			self.childs.list.walk(function(parentIssue){
				fncGetIssueChilds(parentIssue);
			});
			self.continueTask();
		});
		// load report model and submodels
		// Process Model with The Report
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