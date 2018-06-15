var jrfReport=class jrfReport {
	constructor(theConfig){
		var self=this;
//		self.allFieldNames=newHashMap();
		self.allIssues;
		self.reuseAllIssues=false;
		self.config=theConfig;
		self.config.model=System.webapp.model;
		self.childs=newHashMap();
		self.advanceChilds=newHashMap();
		self.treeIssues=newHashMap();
		self.rootElements=newHashMap();
		self.rootIssues=newHashMap();
		self.rootProjects=newHashMap();
		self.bFinishReport=false;
		System.webapp.getTaskManager().extendObject(self);
		self.jira=System.webapp.getJira();
		self.confluence=System.webapp.getConfluence();
		self.result="";
		self.updatePrecomputedAccumulators=false;
		self.adjustAccumItemFunctions=newHashMap();
	}
	adjustAccumItem(accumType,accumValue,issue,fieldName,notAdjust){
		var self=this;
		var fnc=self.adjustAccumItemFunctions.getValue(accumType);
		if (fnc!=""){
			return fnc(accumValue,issue,fieldName,notAdjust);
		}
		return accumValue;
	}
	getChilds(){
		return this.childs;
	}
	getAdvanceChilds(){
		return this.advanceChilds;
	}
	save(){
		
	}
	load(){
		
	}
	isReusingIssueList(){
		var self=this;
		if ((isDefined(self.allIssues)&&(self.reuseAllIssues))){
			return true;
		}
		return false;
	}
	execute(bDontReloadFiles){
		var self=this;
		loggerFactory.getLogger().enabled=self.config.logDebug;
		self.config.htmlDebug=self.config.logHtmlDebug;
		
		//clean the destination html.... to save memory when run more than one intents
        var jqResult=$("#ReportResult");
        jqResult.html("");
		if (!self.isReusingIssueList()){
			self.allIssues=undefined; // unassing allIssues.... to free memory
			self.childs.clear();
			self.advanceChilds.clear();
			self.rootElements.clear();
			self.rootIssues.clear();
			self.rootProjects.clear();

		}
		self.rootIssues.clear();
		
		self.addStep("Getting Confluence Report Model.... ",function(){

	        var cfc=System.webapp.getConfluence();
			//cfc.getAllPages();
			self.addStep("Manipulating Content",function(content){
				log(content);
				var jsonObj=JSON.parse(content);
				var sContent=jsonObj.body.storage.value;
				var sHtml=he.decode(sContent);
				//self.model=sHtml;
				self.config.model=sHtml;
				self.continueTask(); 
//				var theHtml=$(sHtml);
			});
	        var arrValues=self.config.selReportModel.selected;
			var contentId=arrValues[0].key;
			cfc.getContent(contentId);
		});
		
		
		self.addStep("Loading report model engine.... ",function(){
			if (bDontReloadFiles==false) {
				var arrFiles=[	//"ts/demo.ts",
								"js/jrfIssueFactory.js",
								"js/libs/sha256.js",
								"js/libs/showdown.js",
//								"js/libs/FileSaver.js",
								"js/libs/wiki2html.js",
								"js/rcglibs/RCGVarEngine.js",
								"js/rcglibs/RCGFileUtils.js",
								"js/modelProcessor/jrfModel.js",
								"js/modelProcessor/jrfToken.js",
								"js/modelProcessor/jrfNoop.js",
								"js/modelProcessor/jrfDebug.js",
								"js/modelProcessor/jrfForEach.js",
								"js/modelProcessor/jrfField.js",
								"js/modelProcessor/jrfGetVar.js",
								"js/modelProcessor/jrfSum.js",
								"js/modelProcessor/jrfFormula.js",
								"js/modelProcessor/jrfInclude.js"
	/*							"js/rcglibs/RCGLogUtils.js",
								"js/rcglibs/RCGChronoUtils.js",
								"js/rcglibs/RCGHashMapUtils.js"
	*/						 ]; //test
				System.webapp.loadRemoteFiles(arrFiles);
			} else {
				System.webapp.continueTask();
			}
		});

		self.addStep("Construct Issue Dynamic Object.... ",function(){
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
			self.allIssues=newIssueFactory(self);
			self.updatePrecomputedAccumulators=false;
	        var bWithPrepcomps=self.config.ResetLeafPrecomputations;
	        if (isDefined(bWithPrepcomps)&&bWithPrepcomps){
				var userId=self.jira.getUser();
				var arrUsers=self.config.UsersCanResetLeafs;
				arrUsers.forEach(function(userAllowed){
					if (userAllowed.key==userId){
						self.updatePrecomputedAccumulators=true;
					}
				});
	        }
	        var sBillingAdjustFunction=self.config.BillingElementAdjustFunction;
	        if (isDefined(sBillingAdjustFunction)&&(sBillingAdjustFunction!="")){
	    		var fncFormula=Function("actualValue","issue",sBillingAdjustFunction);
	    		self.adjustAccumItemFunctions.add("Childs",fncFormula);
	        }
	        
	        var sAdvanceAdjustFunction=self.config.AdvanceElementAdjustFunction;
	        if (isDefined(sAdvanceAdjustFunction)&&(sAdvanceAdjustFunction!="")){
	    		var fncFormula=Function("actualValue","issue",sAdvanceAdjustFunction);
	    		self.adjustAccumItemFunctions.add("AdvanceChilds",fncFormula);
	        }

        // change de "fieldValue" method
	        

			self.continueTask();
		});
		// first launch all issue retrieve ...
		self.addStep("Getting All Issues in the Scope.... ",function(){
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
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
			log("All issues in Report:"+ self.allIssues.list.length()+ " issues");
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
				var theJQL="";
				if (self.config.rootIssues.values.length>0){
					self.config.rootIssues.values.forEach(function(selIssue) {
						if (theJQL!=""){
							theJQL+=",";
						}
						theJQL+=selIssue.key;
					});
					theJQL="id in ("+theJQL+")";
				} else if (self.config.rootIssues.jql==""){
					log("there is not root issues nor jql to do a report");
					self.bFinishReport=true;
				} else {
					theJQL=self.config.rootIssues.jql;
				}
				if (!self.bFinishReport){
					var fncProcessIssue=function(issue){
						self.rootIssues.add(issue.key,issue);
					}
					self.addStep("Processing jql to get root issues:"+theJQL,function(){
						self.jira.processJQLIssues(
										theJQL,
										fncProcessIssue);
					});
				} else {
					self.continueTask();
				}
			}
			self.continueTask();
		});
		
		self.addStep("Processing root elements.... ",function(){
			if (self.bFinishReport) return self.continueTask();
			//self.treeIssues=newHashMap();
			var bAlerted=false;
			self.rootIssues.walk(function(value,iProf,key){
				log("Root Issue: "+key);
				var issue=self.allIssues.getById(key);
				if (issue==""){
					if (!bAlerted) {
						alert("The issue:"+key+" is not in the scope... al roots have to be in the scope");
					} else {
						log("The issue:"+key+" is not in the scope... al roots have to be in the scope");
					}
				} 
			})
			self.rootProjects.walk(function(value,iProf,key){
				log("Root Project: "+key);
			})
			log("Resume Root issues:"+self.rootIssues.length() +
			    "		Root project:"+self.rootProjects.length()+
			    "		Issues in scope:"+ self.allIssues.list.length());
			self.continueTask();
		});

		var issuesAdded=newHashMap();
		self.treeIssues=issuesAdded;
		// assing childs and advance childs to root elements
		self.addStep("Assign Childs and Advance",function(){
			self.rootIssues.walk(function(value,iProf,key){
				log("Root Issue: "+key);
				var issue=self.allIssues.getById(key);
				if (!issuesAdded.exists(key)){
					issuesAdded.add(key,issue);
				}
				if (!self.childs.exists(key)){
					self.childs.add(key,issue);
				}
			});
			var formulaChild=self.config.billingHierarchy;
			var formulaAdvance=self.config.advanceHierarchy;
			if (formulaChild!=""){
				var sFncFormulaChild="var bResult="+formulaChild+"; return bResult;";
				var sFncFormulaAdv="var bResult="+formulaAdvance+"; return bResult;";
				var fncIsChild=Function("child","parent",sFncFormulaChild);
				var fncIsAdvPart=Function("child","parent",sFncFormulaAdv);
				
	//			var treeIssues=issuesAdded.toArray([{doFieldName:"self",resultFieldName:"issue"}]);
				var fncProcessChild=self.createManagedCallback(function(objStep,issueParent){
					var issueChild=objStep.value;
					if (issueChild.id=="PDP-36"){
						log("Testing "+issueChild.id);
					}
					var bIsChild=false;
					try{
						bIsChild=fncIsChild(issueChild,issueParent);
					} catch(err){
						log ("somthing es not good in child formula:"+sFncFormulaChild);
						log ("using child: "+JSON.stringify(issueChild));
						log ("using parent: "+JSON.stringify(issueParent));
						bIsChild=false;
					}
					if (bIsChild){
						if (!issueParent.getChilds().exists(issueChild.getKey())){ // when reusing dynobj the childs are setted
							issueParent.addChild(issueChild);
						}
						if (!issuesAdded.exists(issueChild.getKey())){
							issuesAdded.add(issueChild.getKey(),issueChild);
							fncGetIssueChilds(issueChild);
						}
					}
					var bIsAdvPart=false;				
					try{
						bIsAdvPart=fncIsAdvPart(issueChild,issueParent);
					} catch(err){
						log ("somthing es not good in advance formula:"+sFncFormulaAdv);
						log ("using child: "+JSON.stringify(issueChild));
						log ("using parent: "+JSON.stringify(issueParent));
						bIsAdvPart=false;
					}
					if (bIsAdvPart){
						if (!issueParent.getAdvanceChilds().exists(issueChild.getKey())){ // when reusing dynobj the childs are setted
							issueParent.addAdvanceChild(issueChild);
						}
						if (!issuesAdded.exists(issueChild.getKey())){
							issuesAdded.add(issueChild.getKey(),issueChild);
							fncGetIssueChilds(issueChild);
						}
					}
				});
				var fncGetIssueChilds=function(issueParent){
					var auxKey="Report";
					if (isDefined(issueParent.getKey)){
						auxKey="Issue:"+issueParent.getKey();
					} else {
						log("The parent has not key... maybe an error?");
					}
					self.addStep("Getting childs for " + auxKey + "....",function(){
					//walkAsync(sName,callNode,callEnd,callBlockPercent,callBlockTime,secsLoop,hsOtherParams,barrier){
						log("Task Manager Status:"+self.getRunningTask().parent.actStep + " " + self.getRunningTask().parent.steps.length);
						self.allIssues.list.walkAsync("Getting childs for "+auxKey
													,function(issueChild){
														fncProcessChild(issueChild,issueParent)
													 }
													,self.createManagedCallback(function(){
														log("Finished "+"Getting childs for "+auxKey);
														log("Task Manager Status:"+self.getRunningTask().parent.actStep 
																+ " " + self.getRunningTask().parent.steps.length);
														self.continueTask();
														}
													));
					//},0,1,undefined,undefined,undefined,"INNER",undefined
					}
					);
				}
	
				self.childs.walk(function(childIssue){
					fncGetIssueChilds(childIssue);
				});
			}
			self.continueTask();
		});

		// load comments of issues
		self.addStep("Loading comments of "+ issuesAdded.length()+"issues",function(){
			var arrKeyGroups=[];
			var keyGroup=[];
			arrKeyGroups.push(keyGroup);
			issuesAdded.walk(function (element){
				if (keyGroup.length>10){
					keyGroup=[];
					arrKeyGroups.push(keyGroup);
				}
				keyGroup.push(element.getKey());
			});
			var fncAddComments=self.createManagedCallback(function(jsonIssues){
				var oIssues=JSON.parse(jsonIssues);
				var arrIssues=oIssues.issues;
				var key;
				var issue;
				var comments;
				var htmlComments;
				var comment;
				var htmlComment;
				var objComment;
				arrIssues.forEach(function (jsonIssue){
					key=jsonIssue.key;
					if (issuesAdded.exists(key)){
						issue=issuesAdded.getValue(key);
						comments=jsonIssue.fields.comment.comments;
						htmlComments=jsonIssue.renderedFields.comment.comments;
						var bFind=false;
						for (var i=0;i<comments.length;i++){
							comment=comments[i];
							htmlComment=htmlComments[i];
							objComment={id:comment.created.trim(),body:comment.body.trim(),htmlBody:htmlComment.body.trim()};
							issue.addComment(objComment);
							bFind=true;
						}
//						if (bFind){
//							var vResult=issue.getHtmlLastCommentStartsWith("Descripción Formal",true,"<br/>",true);
//							log (vResult);
//						}
					} else {
						log("The issue ["+key+"] does not exists... Error");
					}
				});
			});
			arrKeyGroups.forEach(function(group){
				if (group.length>0){
					var sIssues="";
					group.forEach(function (key){
						sIssues+=((sIssues!=""?",":"")+key);
					});
					self.addStep("Retrieving Comments of Group ["+sIssues+"]",function(){
						self.jira.getComments(group,fncAddComments);
					});
				}
			});
			
			self.continueTask();
		});
		
		// load report model and submodels
		// Process Model with The Report
		self.addStep("Processing Model",function(){
			var theModel=new jrfModel(self);
			if (isDefined(self.config.listDefaultVariables)){
				self.config.listDefaultVariables.forEach(function(defaultVar){
					theModel.variables.initVar(defaultVar[0]);				
					theModel.variables.pushVar(defaultVar[0],defaultVar[1]);				
				})
			}
			theModel.process(); // hash inner task....
		});
		

		self.addStep("Setting the HTML",function(sModelProcessedResult){
	        var jqResult=$("#ReportResult");
	        jqResult.html(sModelProcessedResult);
			loggerFactory.getLogger().enabled=true;
			self.result=sModelProcessedResult;
			self.continueTask();
		});
		
		self.addStep("Removing all Issues in the scope.... ",function(){
			self.allIssues.list.clear();
			log("Report uses "+ self.allIssues.list.length()+ " issues");
			self.childs=newHashMap();
			self.advanceChilds=newHashMap();
			//self.treeIssues=newHashMap();
			self.rootElements=newHashMap();
			self.rootIssues=newHashMap();
			self.rootProjects=newHashMap();
			self.continueTask();
		});	

		self.continueTask();
	}
}