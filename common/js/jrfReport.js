var jrfReport=class jrfReport {
	constructor(theConfig){
		var self=this;
//		self.allFieldNames=newHashMap();
		self.allIssues;
		self.reuseAllIssues=false;
		self.config=theConfig;
		self.config.model=System.webapp.model;
		self.objModel;
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
		self.resultContentId="";
		self.updatePrecomputedAccumulators=false;
		self.adjustAccumItemFunctions=newHashMap();
		self.reportDateTime=new Date();
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
		if ((isDefined(System.webapp.IssueCache)&&(self.reuseAllIssues))){
			return true;
		}
		return false;
	}
	loadJSONIssue(jsonIssue){
		var self=this;
		var oIssue=self.allIssues.new(jsonIssue.fields.summary,jsonIssue.key);
		oIssue.setJiraObject(jsonIssue);
		oIssue.updateInfo();
		oIssue.setKey(jsonIssue.key);
		return oIssue;
	}
	cleanModel(sContent){
		//debugger;
		sContent=replaceAll(sContent,"&lt;jRf","&lt;JRF",true);
		sContent=replaceAll(sContent,"jrF&gt;","JRF&gt;",true);
		sContent=replaceAll(sContent,"&lt;jRf_formula","&lt;JRF_FORMULA",true);
		sContent=replaceAll(sContent,"jrF_FORMULA&gt;","JRF_FORMULA&gt;",true);
		sContent=replaceAll(sContent,"&lt;jRf_filter","&lt;JRF_FILTER",true); 
		sContent=replaceAll(sContent,"jrF_FILTER&gt;","JRF_FILTER&gt;",true);
		sContent="<div>"+sContent+"</div>";
		//["<",">"],
		var jrfCleaner=new jrfHtmlCleaner(sContent,[["<",">"],["&lt;","&gt;"],["{{","}}"],["<JRF_FORMULA","JRF_FORMULA>"],["<JRF_FILTER","JRF_FILTER>"]]);
		sContent=jrfCleaner.clean();
		sContent=replaceAll(sContent,"&lt;JRF_FORMULA","&lt;JRF FORMULA");
		sContent=replaceAll(sContent,"JRF_FORMULA&gt;","JRF&gt;");
		sContent=replaceAll(sContent,"&lt;JRF_FILTER","&lt;JRF FILTER");
		sContent=replaceAll(sContent,"JRF_FILTER&gt;","JRF&gt;");
		var sHtml=he.decode(sContent);
		var arrStringsToRemove=[];
		arrStringsToRemove.push('class="highlight-red"');
		arrStringsToRemove.push('data-highlight-colour="red"');
		arrStringsToRemove.push('class="highlight-yellow" ');
		arrStringsToRemove.push('data-highlight-colour="yellow"');
		arrStringsToRemove.push('data-highlight-colour="red"');
		arrStringsToRemove.push('color: rgb(0,0,0);');
		arrStringsToRemove.push('color: rgb(51,51,51);');
		arrStringsToRemove.push('color: rgb(23,43,77);');
		arrStringsToRemove.push('style=""');
		arrStringsToRemove.forEach(function(strTgt){
			var iPos=0;
			iPos=sHtml.saFindPos(strTgt,false,iPos);
			while (iPos>=0){
				sHtml=sHtml.saReplace(iPos,strTgt.length,"");
				iPos=sHtml.saFindPos(strTgt,false,iPos);
			}
		});
		return sHtml.saToString();
	}

	execute(bDontReloadFiles){
		var self=this;
		var tm=self.getTaskManager();
		tm.asyncTimeWasted=0;
		tm.asyncTaskCallsBlock=0;
		tm.asyncTaskCallsMaxDeep=0;
		loggerFactory.getLogger().enabled=self.config.logDebug;
		loggerFactory.getLogger().setAlertOnError(self.config.AlertErrors);
		self.config.htmlDebug=self.config.logHtmlDebug;
		
		//clean the destination html.... to save memory when run more than one intents
        var jqResult=$("#ReportResult");
        jqResult.html("");

        //debugger;
        if (self.isReusingIssueList()){
			var issueCache=System.webapp.IssueCache;
			self.allIssues=issueCache.allIssues; 
			self.childs=issueCache.childs;
			self.advanceChilds=issueCache.advanceChilds;
			self.rootElements=issueCache.rootElements;
			self.rootIssues=issueCache.rootIssues;
			self.rootProjects=issueCache.rootProjects;
			self.treeIssues=issueCache.treeIssues;
        }
        
        if (!self.isReusingIssueList()){
			self.allIssues=undefined; // unassing allIssues.... to free memory
			self.childs=newHashMap();
			self.advanceChilds=newHashMap();
			self.rootElements=newHashMap();
			self.rootIssues=newHashMap();
			self.rootProjects=newHashMap();
			self.treeIssues=newHashMap();
		}
		var issuesAdded=self.treeIssues;
		var bAlerted=false;
//		self.rootIssues.clear();
		
		
		
		self.addStep("Loading report model engine.... ",function(){
			if (bDontReloadFiles==false) {
				var arrFiles=[	//"ts/demo.ts",
								"js/jrfIssueFactory.js",
								"js/libs/sha256.js",
								"js/libs/showdown.js",
								"js/libs/wiki2html.js",
								"js/rcglibs/RCGStringArray.js",
								"js/rcglibs/RCGVarEngine.js",
								"js/rcglibs/RCGFilterManager.js",
								"js/rcglibs/RCGFileUtils.js",
								"js/modelProcessor/jrfHtmlCleaner.js",
								"js/modelProcessor/jrfInteractive.js",
								"js/modelProcessor/jrfModel.js",
								"js/modelProcessor/jrfToken.js",
								"js/modelProcessor/jrfNoop.js",
								"js/modelProcessor/jrfCondition.js", 
								"js/modelProcessor/jrfDebug.js",
								"js/modelProcessor/jrfField.js",
								"js/modelProcessor/jrfGetVar.js",
								"js/modelProcessor/jrfSum.js",
								"js/modelProcessor/jrfFormula.js",
								"js/modelProcessor/jrfComment.js",
								"js/modelProcessor/jrfFilter.js",
								"js/modelProcessor/jrfSubset.js",
								"js/modelProcessor/jrfExport.js",
								"js/modelProcessor/jrfLoopBase.js",
								"js/modelProcessor/jrfForEach.js",
								"js/modelProcessor/jrfStatistics.js",
								"js/modelProcessor/jrfDirective.js",
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
		self.addStep("Getting Confluence Report Model.... ",function(){
	        var cfc=System.webapp.getConfluence();
			//cfc.getAllPages();
			self.addStep("Manipulating Content",function(content){
				log(content);
				var jsonObj=JSON.parse(content);
				var sContent=jsonObj.body.storage.value;
				var sHtml=self.cleanModel(sContent);
				self.config.model=sHtml;
				self.continueTask(); 
//				var theHtml=$(sHtml);
			});
	        var arrValues=self.config.selReportModel.selected;
			var contentId=arrValues[0].key;
			cfc.getContent(contentId);
		});
		//Initialize Report Model.... with variables, etc
		self.addStep("Initializing Model",function(){
			var tm=self.getTaskManager();
			tm.asyncTimeWasted=0;
			tm.asyncTaskCallsBlock=0;
			tm.asyncTaskCallsMaxDeep=0;
			var theModel=new jrfModel(self);
			self.objModel=theModel;
			if (isDefined(self.config.listDefaultVariables)){
				self.config.listDefaultVariables.forEach(function(defaultVar){
					if (isUndefined(defaultVar[2])||
					    (defaultVar[2]=="undefined")||
					    (defaultVar[2]=="")){
							theModel.variables.initVar(defaultVar[0]);				
							theModel.variables.pushVar(defaultVar[0],defaultVar[1]);
					} else {
						var dtAux=toDateNormalDDMMYYYYHHMMSS(defaultVar[2]);
						theModel.variables.setVar(defaultVar[0],defaultVar[1],dtAux);
					}
				})
			}
			if (isDefined(self.config.listReportsHistory)){
				self.config.listReportsHistory.forEach(function(defaultVar){
					var dtAux1=toDateNormalDDMMYYYYHHMMSS(defaultVar[1]);
					var dtAux2=toDateNormalDDMMYYYYHHMMSS(defaultVar[2]);
					theModel.variables.setVar(defaultVar[0],[dtAux1,dtAux2],dtAux2);
				})
			}
			if (isDefined(self.config.interactiveResult)){
				theModel.variables.setVar("interactiveResult",self.config.interactiveResult);
			}
			if (isDefined(self.config.interactiveResult)){
				theModel.variables.setVar("interactiveResult",self.config.interactiveResult);
			}
			if (isDefined(self.config.interactiveResult)){
				theModel.variables.setVar("fullView",self.config.fullView);
			}
			if (isDefined(self.config.withComprobations)){
				theModel.variables.setVar("withComprobations",self.config.withComprobations);
			}
			if (isDefined(self.config.expandAllRows)){
				theModel.variables.setVar("expandAllRows",self.config.expandAllRows);
			}
			//debugger;
            var arrDates=["ReportInitDate","ReportEndDate","ContractInitDate",
                "ContractEndDate", "ContractAdvancedDate"];
		    arrDates.forEach(function(dateParam){
		      if (isDefined(self.config['dates'][dateParam])){
				  theModel.variables.initVar(dateParam);
				  theModel.variables.initVar(dateParam+"_text");
				  var dateValue=self.config['dates'][dateParam];
				  if (dateValue!=""){
					  theModel.variables.pushVar(dateParam+"_text",dateValue);				
					  dateValue=toDateNormalDDMMYYYYHHMMSS(dateValue);
					  theModel.variables.pushVar(dateParam,dateValue);				
				  } else {
					  theModel.variables.pushVar(dateParam+"_text","");				
					  theModel.variables.pushVar(dateParam,"");				
				  }
		      }
		    });
		    var fncAddVariable=function(varName,varValue,isDate){
				theModel.variables.initVar(varName);
				theModel.variables.setVar(varName,varValue);
				if ((typeof isDate!=="undefined")&&(isDate)){
					theModel.variables.initVar(varName+"_text");
					theModel.variables.setVar(varName+"_text",formatDate(varValue,4));
				}
		    }
		    var repIni=theModel.variables.getVar("ReportInitDate");
		    var repEnd=theModel.variables.getVar("ReportEndDate");
		    var repContractIni=theModel.variables.getVar("ContractInitDate");
		    var fullMonthsPeriod=fullMonthsInter(repIni,repEnd);
		    var fullMonthsBefore=fullMonthsInter(repContractIni,repIni);
		    fncAddVariable("fullMonthsPeriod",fullMonthsPeriod);
		    fncAddVariable("fullMonthsBefore",fullMonthsBefore);
		    
		    var firstDayMonthPeriodInit=toMonthStart(repIni);
		    
		    fncAddVariable("lastDayMonthPeriodInit",toMonthEnd(repIni),true);
		    fncAddVariable("lastDayMonthPreviosPeriod",toMonthEnd(repIni,true),true);
		    fncAddVariable("firstDayMonthPeriodEnd",toMonthStart(repEnd),true);
		    fncAddVariable("lastDayMonthPeriodEnd",toMonthEnd(repEnd)),true;
		    fncAddVariable("lastDayMonthThisPeriod",toMonthEnd(repEnd,true),true);
		    
		    fncAddVariable("ReportDateTime",self.reportDateTime,true);
		    
	    	theModel.variables.initVar("withAdvancedWorks");				
		    if (isDefined(self.config['dates']["withAdvancedWorks"])&&(self.config['dates']["withAdvancedWorks"])){
				theModel.variables.pushVar("withAdvancedWorks",self.config['dates']["withAdvancedWorks"]);
		    } else {
				theModel.variables.pushVar("withAdvancedWorks",false);				
		    }
		    self.continueTask();
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
	        
			//debugger;
			if (isDefined(self.config.excludeProjects)&&self.config.excludeProjects){
				self.config.excludedProjectsList.forEach(function(prj){
					self.allIssues.addExcludedProject(prj.key);
				});
			}
			if ((isDefined(self.config.excludeFunctionEnabled)&&self.config.excludeFunctionEnabled)&&
			   (isDefined(self.config.excludeFunction)&&(self.config.excludeFunction.trim()!=""))){
				self.allIssues.setExcludeFunction(self.config.excludeFunction);
			}
			if ((isDefined(self.config.relatedIssuesFindFunctionEnabled)&&self.config.relatedIssuesFindFunctionEnabled)&&
					   (isDefined(self.config.relatedIssuesFindFunction)&&(self.config.relatedIssuesFindFunction.trim()!=""))){
						self.allIssues.setRelatedIssueFindFunction(self.config.relatedIssuesFindFunction);
					}

        // change de "fieldValue" method
			self.continueTask();
		});
		// first launch all issue retrieve ...
		self.addStep("Getting All Issues in the Scope.... ",function(){
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
			if (self.config.jqlScope.jql!=""){
				self.jira.processJQLIssues(self.config.jqlScope.jql,function(jsonIssue){self.loadJSONIssue(jsonIssue)});
			} else {
				self.continueTask();
			}
		});	
		self.addStep("Asigning all Issues in the scope.... ",function(){
			log("All issues in Report:"+ self.allIssues.list.length()+ " issues");
			self.continueTask();
		});	

	
		// get root elements.... issues and/or projects
		self.addStep("Getting root elements.... ",function(){
			log("Getting root elements");
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
/*			if (self.config.rootsByProject){
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
*/			debugger;
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
					var fncProcessRootIssue=function(issue){
						self.rootIssues.add(issue.key,issue);
					}
					self.addStep("Processing jql to get root issues:"+theJQL,function(){
						self.jira.processJQLIssues(
										theJQL,
										fncProcessRootIssue);
					});
				} else {
					self.continueTask();
				}
			}
			self.continueTask(); 
		});
		
		var hsKeyWaiting=newHashMap();
		self.addStep("Processing root elements.... ",function(){
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
			if (self.bFinishReport) return self.continueTask();
			//self.treeIssues=newHashMap();
			var bAlerted=false;
			var arrLinkTypes=self.config.useIssueLinkTypes;
			var arrKeyGroups=[];
			var keyGroup=[];
			arrKeyGroups.push(keyGroup);
			var maxItemsInGroup=100;
			var maxLettersInGroup=2000;
			var grpLength=0;
			var fncAddToGroup=function(issueKey){
				if ((keyGroup.length>=maxItemsInGroup)
					||
					(((grpLength+issueKey.length))>=maxLettersInGroup)
					)
						{
					keyGroup=[];
					grpLength=0;
					arrKeyGroups.push(keyGroup);
				}
				grpLength+=issueKey.length;
				keyGroup.push(issueKey);
				nPendingIssues++;
			}
			var hsEpics=newHashMap();
			var grpEpicsLength=0;
			var arrEpicGroups=[];
			var epicGroup=[];
			arrEpicGroups.push(epicGroup);
			var fncAddEpicToGroup=function(issueKey){
				if ((epicGroup.length>=maxItemsInGroup)
					||
					(((grpEpicsLength+issueKey.length))>maxLettersInGroup)
					)
						{
					epicGroup=[];
					arrEpicGroups.push(epicGroup);
					grpEpicsLength=0;
				}
				grpEpicsLength+=issueKey.length;
				epicGroup.push(issueKey);
				nPendingEpics++; // its a epic.... but it´s need to know that is a epic issues call is running
			}
			
			var fncExtractPendingKeys=function(jsonIssue){
				nProcessedIssues++;
				var key=jsonIssue.key;
				if (!hsKeyWaiting.exists(key)){
					hsKeyWaiting.add(key,key);
				}
				log("Issue "+key+"("+nProcessedIssues+") issues:"+nRetrievedIssues+"/" +nPendingIssues+ " Epics :"+nRetrievedEpics+"/"+nPendingEpics);
				var issue=self.allIssues.getById(key);
				if (issue==""){
					issue=self.loadJSONIssue(jsonIssue);
				} else {
					nDuplicatedIssues++;					
				}
				if (!issue.isProjectExcluded()){
					var arrPendingKeys=issue.getPendingLinkedIssueKeys(arrLinkTypes,self.allIssues);
					if (self.config.withEpicLinkRelations){
						arrPendingKeys=arrPendingKeys.concat(issue.getEpicChildsRelations(self.allIssues));
					}
					if (self.config.relatedIssuesFindFunctionEnabled){
						arrPendingKeys=arrPendingKeys.concat(issue.getRelatedIssuesByFunction(self.allIssues));
					}
					arrPendingKeys.forEach(function(issueKey){
						if (!hsKeyWaiting.exists(issueKey)){
							hsKeyWaiting.add(issueKey,issueKey);
							fncAddToGroup(issueKey);
						}
					});
					var iType=issue.fieldValue("issuetype");
					if (iType=="Hito"){
						if (!hsEpics.exists(key)){
							hsEpics.add(key,key);
							fncAddEpicToGroup(key);
						}
					} else {
						var eLink=issue.fieldValue("Epic Link");
						if (isDefined(eLink)&&(eLink!="")){
							var issueParent=self.allIssues.getById(eLink);
							if (key!=""){
								if (issueParent!=""){
									if (!issueParent.existsLinkedIssueKey(key)){
										issueParent.addLinkedIssueKey(key,key);
									}
									if (!issueParent.existsEpicChild(key)){
										issueParent.addEpicChild(issue);
									}
								} else {
									fncAddToGroup(eLink);
								}
							} else {
								logError("The key link is '' in issue "+ issueParent.getKey());
							}
						}
					}
				}
			};
			var fncProcessEpicChilds=function(jsonIssue,index,resultLength){
				if (index==0) nPendingIssues+=resultLength; // now all the issues are pending....
				fncExtractPendingKeys(jsonIssue);
			};
			
			var nCallsStarted=0;
			var nCallsEnded=0;
			var nProcessedIssues=0;
			var nPendingIssues=0;
			var nRetrievedIssues=0;
			var nPendingEpics=0;
			var nDuplicatedIssues=0;
			var nRetrievedEpics=0;
			var nTotalStepsPlaned=0;
			var nStepsPlaned=0;
			self.addStep("Getting root base issues",function(){
				var fncRetrieveGroup=self.createManagedCallback(function(group){
					//debugger;
					if (group.length>0){
						var sIssues="";
						group.forEach(function (key){
							sIssues+=((sIssues!=""?",":"")+key);
						});
						if (sIssues!="") {
							var theJQL="id in ("+sIssues+")";
							nStepsPlaned++;
							nTotalStepsPlaned++;
							self.addStep("Retrieving issues of Group ["+sIssues+"]",function(){
								nCallsStarted++;
								//logError(nCallsStarted+" - JQL:"+theJQL);
								self.jira.processJQLIssues(
										theJQL,
										fncExtractPendingKeys);
							});
							self.addStep("Finish Retrieving issues of Group ["+sIssues+"]",function(){
								nRetrievedIssues+=group.length; // the get epics issues call is finished... increase retrieved each epic called in group
								nStepsPlaned--;
								nCallsEnded++;
								fncProcessRestOfPending();
								//self.continueTask(); // not needed.... processrestofpending do one
							});
						}
					}
				});
				
				var fncRetrieveEpicGroup=self.createManagedCallback(function(group){
					//debugger;
					if (group.length>0){
						var sIssues="";
						group.forEach(function (key){
							sIssues+=((sIssues!=""?",":"")+key);
						});
						if (sIssues!="") {
							var theJQL='"Epic Link" in ('+sIssues+')';
							nTotalStepsPlaned++;
							nStepsPlaned++;
							self.addStep("Retrieving issues of Epic Group ["+sIssues+"]",function(){
								nCallsStarted++;
								//logError(nCallsStarted+" - JQL:"+theJQL);
								self.jira.processJQLIssues(theJQL,fncProcessEpicChilds);
							});
							self.addStep("Finish Retrieving issues of Epic Group ["+sIssues+"]",function(){
								nRetrievedEpics+=group.length; // the get epics issues call is finished... increase retrieved each epic called in group
								nStepsPlaned--;
								nCallsEnded++;
								fncProcessRestOfPending();
								//self.continueTask(); // not needed.... processrestofpending do one
							});
						}
					}
				});
				var fncProcessRestOfPending=self.createManagedCallback(function(){
					var bSomethingRetrieving=((arrKeyGroups.length>1)||(arrEpicGroups.length>1));
					while(arrKeyGroups.length>1){
						var group=arrKeyGroups.shift();
						fncRetrieveGroup(group);
					} 
					while(arrEpicGroups.length>1){
						var group=arrEpicGroups.shift();
						fncRetrieveEpicGroup(group);
					} 
					if (bSomethingRetrieving) return self.continueTask();
					if (nStepsPlaned>0)return self.continueTask();
						// first epics...
					if ((arrEpicGroups.length==1)&&(arrEpicGroups[0].length>0)){
						log("Testing to retrieve last epic group")
						log("Issue Groups:"+arrKeyGroups.length + " First Issue Group:" + arrKeyGroups[0].length);
						log("Epics Groups:"+arrEpicGroups.length + " First Group Epics:" + arrEpicGroups[0].length);
						var group=arrEpicGroups[0];
						arrEpicGroups=[];
						epicGroup=[];
						arrEpicGroups.push(epicGroup);
						grpEpicsLength=0;
						fncRetrieveEpicGroup(group);
					} else if ((arrKeyGroups.length==1)&&(arrKeyGroups[0].length>0)){
						log("Testing to retrieve last issue group")
						log("Issue Groups:"+arrKeyGroups.length + " First Issue Group:" + arrKeyGroups[0].length);
						log("Epics Groups:"+arrEpicGroups.length + " First Group Epics:" + arrEpicGroups[0].length);
						var group=arrKeyGroups[0];
						arrKeyGroups=[];
						keyGroup=[];
						arrKeyGroups.push(keyGroup);
						grpLength=0;
						fncRetrieveGroup(group);
						bSomethingRetrieving=true;
					}
					console.log("Calls"+nCallsEnded+"/"+nCallsStarted
							+" Procesed "+ nProcessedIssues +"."
							+" Tot:"+(nDuplicatedIssues+self.allIssues.list.length() )+" Dups:"+nDuplicatedIssues+" + All Stored:"+self.allIssues.list.length() +")" 
							+" in " +nStepsPlaned +"/"+ nTotalStepsPlaned +" steps."
							+" Issues: "+ nRetrievedIssues+"/"+nPendingIssues 
							+" Epics:"+ nRetrievedEpics + "/"+nPendingEpics
							+" Issues left:"+ arrKeyGroups[0].length
							+" Epics left:" + arrEpicGroups[0].length );
					self.continueTask();
				});				

				//debugger;
				nPendingIssues=self.rootIssues.length();
				self.rootIssues.walk(fncExtractPendingKeys);
				fncProcessRestOfPending();
			});
			self.addStep("Finish loading Root Issues",function(){
/*				self.rootProjects.walk(function(value,iProf,key){
					log("Root Project: "+key);
				});
*/				log("Resume Root issues:"+self.rootIssues.length() +
				    "		Root project:"+self.rootProjects.length()+
				    "		Issues in scope:"+ self.allIssues.list.length());
				self.continueTask();
			});
			self.continueTask();
		});
		
		// load comments of issues
		self.addStep("Loading comments of "+ issuesAdded.length()+"issues",function(){
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
			var arrKeyGroups=[];
			var keyGroup=[];
			arrKeyGroups.push(keyGroup);
			var maxItemsInGroup=100;
			var maxLettersInGroup=2000;
			var grpLength=0;
			var sKeyAux;
			self.rootIssues.walk(function (jsonIssue,iDeep,issueKey){
				if ((keyGroup.length>=maxItemsInGroup)||(grpLength>=maxLettersInGroup)){
					keyGroup=[];
					grpLength=0;
					arrKeyGroups.push(keyGroup);
				}
				//sKeyAux=element.getKey();
				grpLength+=issueKey.length;
				keyGroup.push(issueKey);
			});
			var fncAddComments=function(jsonIssues){
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
					if (self.allIssues.exists(key)){
						issue=self.allIssues.getById(key);
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
						// applying "Jira Formal Report Adjusts"
						var sTokenAdjustComment="Jira Formal Report Adjusts";
						var hsReportAdjusts=issue.getCommentsStartsWith(sTokenAdjustComment);
						hsReportAdjusts.walk(function(oAdjustComment){
							//debugger;
							var sCommentBody=oAdjustComment.body;
							var sAux=sCommentBody.substring(sTokenAdjustComment.length+1,sCommentBody.length);
							var oAdjusts=JSON.parse(sAux); // may be a object (single change) or an array (multiple changes)
							if (!Array.isArray(oAdjusts)){ // if only one change
								oAdjusts=[oAdjusts]; // create as array
							}
							oAdjusts.forEach(function (oAdjust){
								var adjustType="";
								var fieldName="";
								var fieldValue="";
								var changeDate="";
								var isLifeChange=false;
								if (isDefined(oAdjust.changeDate)){
									isLifeChange=true;
									changeDate=toDateNormalDDMMYYYYHHMMSS(oAdjust.changeDate);
								}
								adjustType=oAdjust.type;
								if (isUndefined(adjustType)||(adjustType=="FieldValue")){
									fieldName=oAdjust.field; // may be simple name (timespent) or complex (status.name)
									fieldValue=oAdjust.newValue; // may be a simple value (16000) or complex ( {name:"the new name",id:14,...})
									var arrFieldPath=fieldName.split(".");
									var sField=arrFieldPath[0];
									var sField=issue.getExistentFieldId(sField);
									if (!isLifeChange){
										if (!isDefined(issue["set"+sField])){//the field is in the "field interest list"
											log("Only can adjust interested fields... the field:"+sField + " is not in the list");
										} else if (arrFieldPath.length==1){ // simple field
											issue["set"+sField](fieldValue);
										} else {
											var actValue=issue["get"+sField]();
											for (var i=1;i<arrFieldPath.length-1;i++){
												var sSubPath=arrFieldPath[i];
												if (isUndefined(actValue[sSubPath])){
													actValue[sSubPath]={};
												}
												actValue=actValue[sSubPath];
											}
											actValue[arrFieldPath[arrFieldPath.length-1]]=fieldValue;
										}
									} else {
										var hsLifeAdjusts=issue.getFieldLifeAdjustById(sField);
										if (hsLifeAdjusts==""){
											hsLifeAdjusts=newHashMap();
											issue.getFieldLifeAdjusts().add(sField,hsLifeAdjusts);
										}
										var oLifeChange={};
										oLifeChange.effectDate=changeDate;
										oLifeChange.newValue=fieldValue;
										oLifeChange.fieldPath=arrFieldPath;
										hsLifeAdjusts.add(changeDate.getTime()+"",oLifeChange);
									}
								} else if (adjustType=="RelationFilter") {
									var fncFilter=oAdjust.filter;
									var typeRelation=oAdjust.relation;
									if (isDefined(fncFilter)&&isString(fncFilter)){
										var sSource=fncFilter;
										sSource=`'';
												var issue=_arrRefs_[0];
												var report=issue.getReport();
												var model=report.objModel;
												result=` +sSource;
										var fncFormula=createFunction(sSource);
										issue.addRelationFilter(fncFormula,typeRelation);
									}
								}
							});
						});
					} else {
						logError("The issue ["+key+"] does not exists... Error");
					}
				});
			}
			var hsListComments=newHashMap();
			arrKeyGroups.forEach(function(group){
				if (group.length>0){
/*					var sIssues="";
					group.forEach(function (key){
						sIssues+=((sIssues!=""?",":"")+key);
					});
					self.addStep("Retrieving Comments of Group ["+sIssues+"]",function(){
						self.jira.getComments(group,fncAddComments);
					});
*/
					hsListComments.push(group);
				}
			});
			self.addStep("Getting comments parallelized.", function(){
				var fncCall=function(group){
//					self.addStep("Retrieve Comments of Group",function(){
						self.jira.getComments(group,fncAddComments);
//					});
//					self.addStep("Do nothing to absorve the continueTask of getcomments",function(){
						/* do nothing */
//					});
//					self.continueTask();
				};
				self.parallelizeCalls(hsListComments,fncCall);
			});
			self.continueTask();
		});
		
		// load report model and submodels
		// Process Model with The Report
		self.addStep("Parsing Model",function(){
			self.objModel.process("parse"); // parse....
		});
			
		// assing childs and advance childs to root elements
		self.addStep("Assign Childs and Advance",function(){
			if (self.isReusingIssueList()){
				return self.continueTask();
			}
			var tm=self.getTaskManager();
			tm.asyncTimeWasted=0;
			tm.asyncTaskCallsBlock=3000;
			tm.asyncTaskCallsMaxDeep=15;
			var arrLinkTypes=self.config.useIssueLinkTypes;
			
			var countAdded=0;
			hsKeyWaiting.walk(function(issue,iProf,key){
				self.rootIssues.add(key,issue);
				countAdded++;
			});
			logError("Added "+countAdded+" "+ ((100*countAdded)/self.rootIssues.length()) +"% to the seletion JQL")
			var nExcludedIssues=0;
			self.rootIssues.walk(function(jsonIssue,iProf,key){
				//log("Root Issue: "+key);
				var issue=self.allIssues.getById(key);
				if (issue!=""){
					var bExcluded=false;
					if (issue.isProjectExcluded()/*||(issue.isExcludedByFunction())*/){
						//debugger;
						nExcludedIssues++;
					}else {
						if (!issuesAdded.exists(key)){
							issuesAdded.add(key,issue);
						}
						if (!self.childs.exists(key)){
							self.childs.add(key,issue);
						}
					}
				} else {
					logError("The issue "+ key + " does not exists in the all Issues retrieved list");
				}
			});
			if (nExcludedIssues>0){
				log("Excluded "+nExcludedIssues+" root issues after apply project exclude list filter");
			}
			var formulaChild=self.config.billingHierarchy;
			var formulaAdvance=self.config.advanceHierarchy;
			if (formulaChild!=""){
				var sFncFormulaChild="var bResult="+formulaChild+"; return bResult;";
				var sFncFormulaAdv="var bResult="+formulaAdvance+"; return bResult;";
				var fncIsChild=Function("child","parent",sFncFormulaChild);
				var fncIsAdvPart=Function("child","parent",sFncFormulaAdv);
				
	//			var treeIssues=issuesAdded.toArray([{doFieldName:"self",resultFieldName:"issue"}]);
				var fncProcessChild=self.createManagedCallback(function(issueChild,issueParent){
					var bIsChild=false;
					try{
						bIsChild=fncIsChild(issueChild,issueParent);
					} catch(err){
						var fncGetKey=function(issueAux){
							var issKey="";
							if (isDefined(issueAux.getKey)){
								issKey=issueAux.getKey();
							} else {
								if (isString(issueAux)){
									issKey="String -> '" + issueAux+"'";
								} else if (isArray(issueParent)){
									issKey="Array ->" + issueAux;
								} else {
									issKey=issueAux.constructor.name;
								}
							}
							return issKey;
						}
						//debugger;
						var chKey=fncGetKey(issueChild);
						var prKey=fncGetKey(issueParent);
						logError("something is not good in child formula:"+sFncFormulaChild
								 +"\nusing child: "+chKey
								 +"\nusing parent: "+prKey);
						bIsChild=false;
					}
					if (bIsChild){
						if (!issueParent.getChilds().exists(issueChild.getKey())){ // when reusing dynobj the childs are setted
							issueParent.addChild(issueChild);
						}
						if (!issuesAdded.exists(issueChild.getKey())){
							issuesAdded.add(issueChild.getKey(),issueChild);
						}
					}
					var bIsAdvPart=false;				
					try{
						bIsAdvPart=fncIsAdvPart(issueChild,issueParent);
					} catch(err){
						//debugger;
						var chKey="";
						if (isDefined(issueChild.getKey)){
							chKey=issueChild.getKey();
						} else {
							chKey=issueChild.constructor.name;
						}
						var prKey="";
						if (isDefined(issueParent.getKey)){
							prKey=issueParent.getKey();
						} else {
							prKey=issueParent.constructor.name;
						}
						logError("something es not good in advance formula:"+sFncFormulaAdv
								 +"\nusing child: "+chKey
								 +"\nusing parent: "+prKey);
						bIsAdvPart=false;
					}
					if (bIsAdvPart){
						if (!issueParent.getAdvanceChilds().exists(issueChild.getKey())){ // when reusing dynobj the childs are setted
							issueParent.addAdvanceChild(issueChild);
						}
						if (!issuesAdded.exists(issueChild.getKey())){
							issuesAdded.add(issueChild.getKey(),issueChild);
						}
					}
				});
				var fncGetIssueChilds=function(issueParent){
					var auxKey="Report";
					if (isDefined(issueParent.getKey)){
						auxKey="Issue:"+issueParent.getKey();
					} else {
						debugger;
						logError("The parent has not key... maybe an error?");
					}
					self.addStep("Getting childs for " + auxKey + "....",function(){
					//walkAsync(sName,callNode,callEnd,callBlockPercent,callBlockTime,secsLoop,hsOtherParams,barrier){
						log("Task Manager Status:"+self.getRunningTask().parent.actStep + " " + self.getRunningTask().parent.steps.length);
						var relatedChilds=newHashMap();
						var arrRelatedChilds=issueParent.getPendingLinkedIssueKeys(arrLinkTypes);
						if (self.config.withEpicLinkRelations){
							arrRelatedChilds=arrRelatedChilds.concat(issueParent.getEpicChildsRelations());
						}
						if (self.config.relatedIssuesFindFunctionEnabled){
							arrRelatedChilds=arrRelatedChilds.concat(issueParent.getRelatedIssuesByFunction());
						}
						arrRelatedChilds.forEach(function(relatedIssueKey){
							if (!relatedChilds.exists(relatedIssueKey)){
								relatedChilds.add(relatedIssueKey);
							}
						}); 
						relatedChilds.walkAsync("Getting childs for "+auxKey
													,function(issueChildStep){
														var issueChild=issuesAdded.getValue(issueChildStep.actualNode.key);
														if (!isString(issueChild)){
															if (issueParent.getKey()==issueChild.getKey()){
																debugger;
																logError("Child and Parent are the same"+auxKey+" -> "+ issueParent.getKey());
																log(issueParent.getRelatedIssuesByFunction());
															} else {
																var nChildsPrevParent=issueParent.countChilds();
																var nChildsPrevChild=issueChild.countChilds();
																fncProcessChild(issueChild,issueParent);
																fncProcessChild(issueParent,issueChild);
																if (issueParent.countChilds()>nChildsPrevParent) log("Child/Parent relation "+auxKey+" -> "+ issueChild.getKey()+" added.");
																if (issueChild.countChilds()>nChildsPrevChild) log("Child/Parent relation "+issueChild.getKey()+" -> "+ auxKey +" added.");
															}
														} else {
															logError("Related issue "+auxKey+" -> "+ issueChildStep.actualNode.key +" have not been downloaded or is excluded");
														}
														/*
														nChildsPrev=issueChild.countChilds();
														fncProcessChild(issueParent,issueChild);
														bProcessChild=(issueChild.countChilds()>nChildsPrev);
														log("Child/Parent relation "+auxKey+" <- "+ issueChild.getKey()+" added:"+(issueChild.countChilds()>nChildsPrev));
														if (bProcessChild) {
															log("Adding "+issueChild.getKey() +" to child/parent process");
															fncGetIssueChilds(issueChild);
														}
														*/
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
					if (childIssue==""){
						logError("ChildIssue is ''");
					}
					fncGetIssueChilds(childIssue);
				});
			}
			self.continueTask();
		});
		
		
		
		self.addStep("Final Adjusts to retrieved list of issues",function(){
			self.addStep("Analizing child/parent billing cycles and multiple parents",function(){
				issuesAdded.walk(function(issue){
					if (issue.hasChildCycle()){
						logError("It's necessary to correct child/parent billing errors");
					}
					var rootIssue=issue.getChildRoot();
					if (!issuesAdded.exists(rootIssue.getKey())){
						logError("The root issue: "+ rootIssue.getKey()+" does not exists in process issues list. Maybe an error");
					}
				});
				self.continueTask();
			});
			
			self.addStep("Creating child relations by issue custom formulas",function(){
				issuesAdded.walk(function(issueParent){
					if (parentIssue.existsRelationFilter("Child")){
						debugger;
						var childRelationFilter=issueParent.getRelationFilterById("Child");
						self.addStep("Custom Relations for issue "+issueParent.getKey(),function(){
							issuesAdded.walk(function(issueChild){
								if (issueChild.getKey()!=issueParent.getKey()){
									var bResult=childRelationFilter([issueChild]);
									if (bResult){
										if (!issueParent.getChilds().exists(issueChild.getKey())){ // when reusing dynobj the childs are setted
											issueParent.addChild(issueChild);
										}
									}
								}
							});
						});
					}
				});
				self.continueTask();
			});

			self.addStep("Removing issues by Exclude function",function(){
				var hsRemoveKeys=newHashMap();
				issuesAdded.walk(function(issue){
					if (issue.isExcludedByFunction()){
						hsRemoveKeys.add(issue.getKey(),issue.getKey());
					}
				});
				var nRemoves=0;
				var nRootsPrevious=self.childs.length();
				hsRemoveKeys.walk(function(issueKey){
					if (self.childs.exists(issueKey)){
						self.childs.remove(issueKey);
						nRemoves++;
					}
				});
				var nRootsFinal=self.childs.length();
				if ((hsRemoveKeys.length()!=nRemoves)
					||((nRootsPrevious-nRemoves)!=nRootsFinal)
					){
					log("The number of keys to remove is different of the effective removed issue count");
				}
				self.continueTask();
			});
			
			self.continueTask();
			
		});
		
		
		self.addStep("Processing Directives",function(){
			debugger;
			var hsVersions=newHashMap();
			var hsAccumulators=newHashMap();
			log("Analizing directives");
			self.objModel.directives.walk(function(hsDirectives,iProof,sDirectiveKey){
				hsDirectives.walk(function(sValue){
					log(sDirectiveKey + " directive setted:"+sValue);
					if ((sDirectiveKey=="use") && (sValue=="versions")){
						self.treeIssues.walk(function(issue){
							var arrVersions=issue.fieldValue("fixVersions");
							arrVersions.forEach(function(version){
								var name=version.name;
								var released=version.released;
								if (!hsVersions.exists(name)){
									hsVersions.add(name,name);
								};
							});
						});
					} else if ((sDirectiveKey=="accumulators")
								&&(!self.config.DontLoadLeafPrecomputations)){
						// the directive accumulators is processed by the model 
						var accumList=self.objModel.accumulatorList;
						var hmKey;
						accumList.walk(function(hsAccum,iProf,accumKey){
							log("Type of accumulators:"+accumKey);		
							hsAccum.walk(function(theFieldAccum){
								issuesAdded.walk(function (issue){
									if (issue.countParentsChild()==0){
										hmKey=issue.getKey()+"."+theFieldAccum.key;
										if (!hsAccumulators.exists(hmKey)){
											hsAccumulators.add(hmKey,{issue:issue,key:theFieldAccum.key});
										} else {
											log("Key:"+hmKey+" is already added");
										}
									}
								});
							});
						});
					}
				});
			});
			if (hsAccumulators.length()>0){
				self.addStep("Getting the accumulators",function(){
					var fncCall=function(callInfo){
						var issue=callInfo.issue;
						var propKey=callInfo.key;
						self.jira.getProperty(issue.getKey(),propKey);
					};
					var fncProcess=function(callInfo,objProperty){
						var issue=callInfo.issue;
						var propKey=callInfo.key;
						if (objProperty!=""){
							log("Start adding properties "+objProperty.key +" to issue:"+issue.getKey() );
							issue.setPrecomputedPropertyLife(objProperty.key,objProperty.value);
							log("End of adding properties "+objProperty.key +" to issue:"+issue.getKey() );
						}
					};
					self.parallelizeCalls(hsAccumulators,fncCall,fncProcess);
				});
			}
			if (hsVersions.length()>0){
				log("Versions in report:"+hsVersions.length());
				self.addStep("Version Directive Active. Getting "+hsVersions.length()+" Versions ....",function(){
					var verCounter=0;
					var sVersions="";
					var fncGetVersionsIssues=function(sVersions){
						self.addStep("Getting versions ("+sVersions+") issues",function(){
							var fncProcessIssue=function(issue){
								//debugger;
								var oIssue;
								if (!self.allIssues.list.exists(issue.key)){
									oIssue=self.allIssues.new(issue.fields.summary,issue.key);
									oIssue.setJiraObject(issue);
									oIssue.updateInfo();
									oIssue.setKey(issue.key);
								} else {
									oIssue=self.allIssues.list.getValue(issue.key);
								}
								if (!self.treeIssues.exists(issue.key)){
									self.treeIssues.add(issue.key,oIssue);
								}
							}
							self.jira.processJQLIssues("fixVersion in ("+sVersions+")",
													  fncProcessIssue);
						});
					}
					hsVersions.walk(function(versionName){
						if (verCounter>=10){
							fncGetVersionsIssues(sVersions);
							verCounter=0;
							sVersions="";
						}
						if (verCounter>0){
							sVersions+=",";
						}
						sVersions+=versionName;
						verCounter++;
					});
					if ((verCounter>0)&&(verCounter<10)){
						fncGetVersionsIssues(sVersions);
					}
				});
			}
			self.continueTask();
		});

		
		// load report model and submodels
		// Process Model with The Report
		self.addStep("Processing Model",function(){
			var tm=self.getTaskManager();
			tm.asyncTimeWasted=0;
			tm.asyncTaskCallsBlock=3000;
			tm.asyncTaskCallsMaxDeep=30;
			tm.autoFree=true;
			self.objModel.process("encode"); // hash inner task....
		});
		
		self.addStep("¿Saving the precomputed values?",function(sModelProcessedResult){
			if (self.config.ResetLeafPrecomputations){
				self.addStep("Saving the precomputed values", function(){
					var hsUpdateProps=newHashMap();
					self.allIssues.list.walk(function(issue){
						if ((issue.countSavePrecomputedPropertys()>0)
							||(self.config.ForceSaveLeafPrecomputations)){
							var hsPrecomps=issue.getSavePrecomputedPropertys();
							hsPrecomps.walk(function(precompObj,iDeep,cacheKey){
								hsUpdateProps.push({issueKey:issue.getKey(),cacheKey:cacheKey,precompObj:precompObj});
							});
						}
					});
					var jira=System.webapp.getJira();
					var fncCall=function(issueUpdate){
						jira.setProperty(issueUpdate.issueKey,issueUpdate.cacheKey,issueUpdate.precompObj);
					};
					self.parallelizeCalls(hsUpdateProps,fncCall);
				});
			}
			self.addStep("Returning the model processed result",function(){
				self.continueTask([sModelProcessedResult]);
			});
			self.continueTask();
		});
		

		self.addStep("Setting the HTML",function(sModelProcessedResult){
			var tm=self.getTaskManager();
			tm.autoFree=false;
			tm.asyncTaskCallsBlock=0;
			tm.asyncTaskCallsMaxDeep=0;
//	        sModelProcessedResult=sModelProcessedResult.saToString();
//	        jqResult.html(sModelProcessedResult);
	        //debugger;
	        var saPrependContent=[];
			saPrependContent.push(`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//ES"
   					"http://www.w3.org/TR/html4/strict.dtd">
					<HTML>
 					<HEAD> 
					<meta http-equiv='Content-Type' content='Type=text/html; charset=utf-8'>
					<script type="text/javascript" src="https://unpkg.com/xlsx/dist/shim.min.js"></script>
					<script type="text/javascript" src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
					
					<script type="text/javascript" src="https://unpkg.com/blob.js@1.0.1/Blob.js"></script>
					<script type="text/javascript" src="https://unpkg.com/file-saver@1.3.3/FileSaver.js"></script>`
					);
			var arrFiles=[	//"ts/demo.ts",
				"css/RCGTaskManager.css",
				"aui/css/aui.css",
	            "aui/css/aui-experimental.css",
	            ]; //test
			arrFiles.forEach(function (sRelativePath){
				var sAbsPath=System.webapp.composeUrl(sRelativePath);
				saPrependContent.push('<link rel="stylesheet" type="text/css" href="'+sAbsPath+'">');
			});
			saPrependContent.push(`
					<script type="text/javascript" >
					function onBodyLoadEvent(){
						alert("Is Full Loaded");
					}
					</script>
					</HEAD> <BODY><DIV id="ResultInnerDiv">
					`);		
			var vAux;
			while (saPrependContent.length>0){
				vAux=saPrependContent.pop();
				sModelProcessedResult.unshift(vAux);
			}
			sModelProcessedResult.push("</DIV></BODY></HTML>");
	        
/*	        var blobResult = new Blob(sModelProcessedResult, {type : "text/html"});
	        var blobUrl = window.URL.createObjectURL(blobResult);
*/	        
			var newId=modelInteractiveFunctions.addInteractiveContent({html:sModelProcessedResult});
			self.pageResultId=newId;
			self.continueTask();
		});
		
		self.addStep("Storing issue info or Removing all Issues in the scope.... ",function(){
			if (!self.reuseAllIssues){
				self.allIssues.list.clear();
				log("Report uses "+ self.allIssues.list.length()+ " issues");
				self.childs=newHashMap();
				self.advanceChilds=newHashMap();
				//self.treeIssues=newHashMap();
				self.rootElements=newHashMap();
				self.rootIssues=newHashMap();
				self.rootProjects=newHashMap();
			} else {
				var issueCache={}
				issueCache.allIssues=self.allIssues; 
				issueCache.childs=self.childs;
				issueCache.advanceChilds=self.advanceChilds;
				issueCache.rootElements=self.rootElements;
				issueCache.rootIssues=self.rootIssues;
				issueCache.rootProjects=self.rootProjects;
				issueCache.treeIssues=self.treeIssues;
				System.webapp.IssueCache=issueCache;
			}
			self.continueTask();
		});
		
		self.addStep("Finally... launches the page results html.... ",function(){
			var fncLaunchPages=function(idPage){
				var thePageId=idPage;
				var fncCallback=function(){
/*					setTimeout(function(){
						modelInteractiveFunctions.openInWindow(thePageId,function(){
							alert("Page Loaded");
						});
					});*/
				}
				setTimeout(function(){
					modelInteractiveFunctions.openInWindow(thePageId,fncCallback,"ReportResult","reportResultDiv");
				},3000);
			}
			fncLaunchPages(self.pageResultId);
			self.continueTask();
		});
		self.continueTask();
	}
	openResultInNewTab(){
		var self=this;
		modelInteractiveFunctions.openNewWindow(self.pageResultId);
	}
	saveResultToFile(){
		var self=this;
		if (isDefined(self.pageResultId)&&(self.pageResultId!="")){
			modelInteractiveFunctions.saveToFile(self.pageResultId);
		}
	}
}