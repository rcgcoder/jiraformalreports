var jrfReport=class jrfReport {
	constructor(theConfig){
		var self=this;
		if (isDefined(theConfig)){
	//		self.allFieldNames=newHashMap();
			self.allIssues;
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
			self.storeManager="";
		}
	}	
	getStorageObject(){
		var self=this;
		var storer=self.storeManager;
		var objResult={};
		var hsFunctionsSrc=newHashMap();
		storer.functions.walk(function(fncBody,deep,key){
			var sFncFormula=""+fncBody.toString();
			hsFunctionsSrc.add(key,sFncFormula);
		});
		var objFullResult={};
		
		var lastTime=(new Date()).getTime();
		var fncProgressCallback= function(){
			var actTime=(new Date()).getTime();
			if ((actTime-lastTime)>(3000)){
				log("Force update status");
				lastTime=actTime;
				storer.getTaskManager().forceChangeStatus();
			}
		}
		
		objFullResult.functions=storer.generateJson(hsFunctionsSrc,fncProgressCallback);
		
		objResult.config=self.config;
		objResult.allIssues=self.allIssues.list;
		objResult.childs=self.childs;
		objResult.advanceChilds=self.advanceChilds;
		objResult.treeIssues=self.treeIssues;
		objResult.rootElements=self.rootElements;
		objResult.rootIssues=self.rootIssues;
		objResult.rootProjects=self.rootProjects;
		objFullResult.data=storer.generateJson(objResult,fncProgressCallback);
		return objFullResult;
	}
	
	loadFromStorageObject(storedFullObj){
		var self=this;
		var storer=self.storeManager;
		if ((storer==="")||(isUndefined(storer))){
			self.storeManager=new RCGObjectStorageManager("Reports",System.webapp.getTaskManager());
			storer=self.storeManager;
		}
	
		storer.addStep("Parsing Functions",function(){
			return storer.parseJson(storedFullObj.functions);
		});
		storer.addStep("Generating Functions",function(functionSrcs){
			storer.sequentialProcess(functionSrcs,function(fncSrc,deep,key){
				if (!storer.functions.exists(key)){
					storer.functions.remove(key);
				};
				var fncCompiled=createFunction(fncSrc);
				storer.functions.add(key,fncCompiled);
			});
		});
		storer.addStep("Parsing Project Data",function(){
			return storer.parseJson(storedFullObj.data);
		});
		storer.addStep("Procesing the stored readed info",function(storedObj){
			self.config=storedObj.config;  
			var attribs=[//"allIssues", // allIssues is the factory... not need to be assigned
				         "childs","advanceChilds"
				        ,"treeIssues","rootElements","rootIssues","rootProjects"];
			var auxIssues=storedObj["allIssues"];
			self.hsAllIssues=auxIssues;
			attribs.forEach(function(attrName){
				var attValue=storedObj[attrName];
				self[attrName]=attValue;
			});
			return self;
		});
	}

	adjustAccumItem(accumType,accumValue,issue,fieldName,atDatetime,notAdjust){
		var self=this;
		var fnc=self.adjustAccumItemFunctions.getValue(accumType);
		if (fnc!=""){
			return fnc(accumValue,issue,fieldName,atDatetime,notAdjust);
		}
		return accumValue;
	}
	getChilds(){
		return this.childs;
	}
	getAdvanceChilds(){
		return this.advanceChilds;
	}
	save(idReport){
		var self=this;
		var idReportKey="LastReport";
		if (isDefined(idReport))idReportKey=idReport;
		self.addStep("Saving Report...",function(){
			return self.storeManager.save(idReportKey,self);
		});
	}
	existStored(idReport){
		var self=this;
		var idReportKey="LastReport";
		if (isDefined(idReport)) idReportKey=idReport;
		self.addStep("Check if "+idReportKey+" is saved",function(){
			return self.storeManager.exists(idReportKey);
		});
		self.addStep("update reusing flag",function(bExists){
			if (!bExists){
				self.reuseReport=false;
			}
		});
	}
	load(idReport){
//		debugger;
		var self=this;
		var idReportKey="LastReport";
		if (isDefined(idReport)) idReportKey=idReport;
		self.addStep("loading Report from storage... it takes a while",function(auxReport){
			return self.storeManager.load(idReportKey);
		});
		self.addStep("Assigning loaded Values",function(auxReport){
			self.config=auxReport.config;
			var attribs=[//"allIssues"  // not assign all issues
						,"childs","advanceChilds"
				        ,"treeIssues","rootElements","rootIssues","rootProjects"];
			self.allIssues=baseDynamicObjectFactory.getFactoryGlobal("Issue");
			attribs.forEach(function(attrName){
				self[attrName]=auxReport[attrName];
			});
		});
	}
	isReusingIssueList(){
		var self=this;
		return self.config.reuseIssues;
	}
	isReusingReport(){
		var self=this;
		return self.config.reuseReport;
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
		arrStringsToRemove.push(' style="color: rgb(9,30,66);"');
		arrStringsToRemove.push(' style="color: rgb(136,19,145);"');
		arrStringsToRemove.push('class="auto-cursor-target"');
		arrStringsToRemove.push('style=""');
		arrStringsToRemove.push(' class="table-wrap"');
		arrStringsToRemove.push('<div>');
		arrStringsToRemove.push('</div>');
		arrStringsToRemove.forEach(function(strTgt){
			sHtml=sHtml.saReplaceAll(strTgt,"",true);
/*			var iPos=0;
			iPos=sHtml.saFindPos(strTgt,false,iPos);
			while (iPos>=0){
				sHtml=sHtml.saReplace(iPos,strTgt.length,"");
				iPos=sHtml.saFindPos(strTgt,false,iPos);
			}*/
		});
		return sHtml.saToString();
	}
	walkAsync(theHashMap,itemFunction,endFunction){
		var self=this;
		var initialItemNumber=theHashMap.length();
		var stepCounter=0;
		var nItemsTotal=theHashMap.length();
		var asyncNumber;
		if (hashmapFactory.stackAsyncCalls!="") asyncNumber=hashmapFactory.stackAsyncCalls.length();
		var tm=self.getTaskManager();
		var fncUpdateStatus=function(){
			tm.changeStatus();
			tm.forceChangeStatus();
		}
		var stepDesc=tm.getRunningTask().description;
/*		logError(stepDesc + "START calling end of walk before process of all items. "
				+" Processed:" +stepCounter
				+" total:"+theHashMap.length() 
				+" started with:"+initialItemNumber
				+" Async Deep Ini:"+asyncNumber
				+" Async Deep Act:"+(hashmapFactory.stackAsyncCalls===""?"":hashmapFactory.stackAsyncCalls.length())
				);
*/
		var fncEnd=self.createManagedCallback(function(objStep){
//			logError("Calling custom End function in walk Async");
			if (stepCounter<theHashMap.length()){
				alert(stepDesc+" ERROR....calling end of walk before process of all items. Processed:"+stepCounter+" total:"+theHashMap.length() +" started with:"+initialItemNumber);
				debugger;
			}
/*			logError(stepDesc + " END calling end of walk before process of all items. "
						+" Processed:" +stepCounter
						+" total:"+theHashMap.length() 
						+" started with:"+initialItemNumber
						+" Async Deep Ini:"+asyncNumber
						+" Async Deep Act:"+(hashmapFactory.stackAsyncCalls===""?"":hashmapFactory.stackAsyncCalls.length())
						);
*/		
			if (isUndefined(endFunction)){
				return objStep;
			} else {
				return endFunction(objStep);
			}
		});
		var fncItem=self.createManagedFunction(function(step){
//			logError("Calling item in walk Async "+stepCounter+"/"+theHashMap.length());
//			console.log(stepCounter+"/"+nItemsTotal+"  -> "+step.actualNode.key);
			itemFunction(step.actualNode.value,step.deep,step.actualNode.key);
			stepCounter+=1+step.actualNode.brothers.length;
		});
		theHashMap.walkAsync("Walking Asynchronous. "+stepDesc
									,fncItem
									,fncEnd
									,fncUpdateStatus
									,fncUpdateStatus
									,2);
		return self.waitForEvent();
	}
	loadJSONIssue(jsonIssue){
		var self=this;
		debugger;
		var oIssue=self.allIssues.new(jsonIssue.fields.summary,jsonIssue.key);
		if (!self.isReusingIssueList()){
			oIssue.setJiraObject(jsonIssue);
			oIssue.updateInfo();
			oIssue.setJiraObject("");
			oIssue.setKey(jsonIssue.key);
		} else {
			debugger;
			oIssue.loaded=false;
			oIssue.numLocks=0;
			oIssue.fullLoad();
		}
		//oIssue.unlock(); // dont Unlock.... loaded for use
		return oIssue;
	}
	createNewIssueFromJsonSteps(jsonIssue,bMaintainLocked){
		var self=this;
		return self.workOnIssueSteps(jsonIssue.key,undefined,bMaintainLocked,function(){
			return self.loadJSONIssue(jsonIssue);
		});
	}

	execute(bDontReloadFiles){
		var self=this;
		var auxAsyncTaskCallsMaxDeep=100;
		var auxAsyncTaskCallsBlock=3000;
		var dontReturnAllIssuesRetrieved=true;
		var tm=self.getTaskManager();
		tm.getStackTraceLinesTime=0;
		tm.asyncTimeWasted=0;
		tm.asyncTaskCallsBlock=5000;
		tm.asyncTaskCallsMaxDeep=100;
		tm.setUpdateStatusDelay(2000);
		loggerFactory.getLogger().enabled=self.config.logDebug;
		loggerFactory.getLogger().setAlertOnError(self.config.AlertErrors);
		self.config.htmlDebug=self.config.logHtmlDebug;
		
		//clean the destination html.... to save memory when run more than one intents
        var jqResult=$("#ReportResult");
        jqResult.html("");

        //debugger;
/*        if (self.isReusingIssueList()){
			var issueCache=System.webapp.IssueCache;
			self.allIssues=issueCache.allIssues; 
			self.childs=issueCache.childs;
			self.advanceChilds=issueCache.advanceChilds;
			self.rootElements=issueCache.rootElements;
			self.rootIssues=issueCache.rootIssues;
			self.rootProjects=issueCache.rootProjects;
			self.treeIssues=issueCache.treeIssues;
        } else {
//        if (!self.isReusingIssueList()){
*/			self.allIssues=undefined; // unassing allIssues.... to free memory
			self.childs=newHashMap();
			self.advanceChilds=newHashMap();
			self.rootElements=newHashMap();
			self.rootIssues=newHashMap();
			self.rootProjects=newHashMap();
			self.treeIssues=newHashMap();
//		}
        var ifr=document.getElementById("ReportResult");
        ifr.onload=undefined;
        ifr.src=window.URL.createObjectURL(new Blob(["generating report...."],{type:"text/html"}));
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
							    "js/rcglibs/RCGObjectStorageUtils.js",
								"js/rcglibs/RCGDynamicObjectStorageUtils.js",
			        			"js/rcglibs/RCGDynamicObjectUtils.js",
								"js/rcglibs/RCGVarEngine.js",
								"js/rcglibs/RCGFilterManager.js",
								"js/rcglibs/RCGFileUtils.js",
								"js/rcglibs/RCGUploadUtils.js",
								"js/rcglibs/RCGDownloadUtils.js",
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
								"js/modelProcessor/jrfExport.js",
								"js/modelProcessor/jrfSubset.js",
								"js/modelProcessor/jrfLoopBase.js",
								"js/modelProcessor/jrfForEach.js",
								"js/modelProcessor/jrfStatistics.js",
								"js/modelProcessor/jrfDirective.js",
								"js/modelProcessor/jrfInclude.js",
								"js/libs/xlsx.core.min.js",
								"js/rcglibs/RCGExcelProcessor.js"
//								"https://unpkg.com/xlsx/dist/xlsx.full.min.js"
//								"https://unpkg.com/blob.js@1.0.1/Blob.js",
//								"https://unpkg.com/file-saver@1.3.3/FileSaver.js"
	/*							"js/rcglibs/RCGLogUtils.js",
								"js/rcglibs/RCGChronoUtils.js",
								"js/rcglibs/RCGHashMapUtils.js"
	*/						 ]; //test
				return System.webapp.loadRemoteFiles(arrFiles);
			}
		});
		self.addStep("Getting check XLSX",function(){
			self.addStep("Download XLSX",function(){
				return System.webapp.loadFileFromNetwork("docx/paraexportarajson.xlsx");
			});
			self.addStep("Process XLSX",function(sRelativePath,content,contentType,theWindow){
				debugger;
				var xlsObj=new RCGExcelProcessor(content);
				var sht=xlsObj.sheets.getFirst().value;
				log(sht.getCell(0,0)+" "+sht.getCell(1,1));
				return xlsObj;
			});
			self.addStep("Process xlsObject",function(xlsObj){
				var iRows=0;
				var nEmpties=0;
				var nWithData=0;
				for (var row in worksheet) {
					var bEmpty=true;
					for (var col in row) {
						var value=worksheet[row][col];
						if (value!==""){
							bEmpty=false;
						}
					}
					if (bEmpty){
						nEmpties++;
					} else {
						nWithData++;
					}
					iRows++;
				}
				log ("rows:"+iRows+" with data:"+nWithData+" empty:"+nEmpties);
			});
		});
		self.addStep("Getting Confluence Report Model.... ",function(){
	        var cfc=System.webapp.getConfluence();
			//cfc.getAllPages();
	        self.addStep("Getting Content from confluence",function(){
		        var arrValues=self.config.selReportModel.selected;
				var contentId=arrValues[0].key;
				return cfc.getContent(contentId);
	        });
			self.addStep("Manipulating Content",function(content){
				log(content);
				var jsonObj=JSON.parse(content);
				var sContent=jsonObj.body.storage.value;
				var sHtml=self.cleanModel(sContent);
				self.config.model=sHtml;
//				var theHtml=$(sHtml);
			});
		});
		//Initialize Report Model.... with variables, etc
		self.addStep("Initializing Model",function(){
			var tm=self.getTaskManager();
			tm.asyncTimeWasted=0;
			tm.asyncTaskCallsBlock=auxAsyncTaskCallsBlock;
			tm.asyncTaskCallsMaxDeep=auxAsyncTaskCallsMaxDeep;
			tm.setUpdateStatusDelay(2000);
			var theModel=new jrfModel(self);
			self.objModel=theModel;
			theModel.variables.initVar("model");				
			theModel.variables.setVar("model",theModel);				
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
				  theModel.variables.initVar(dateParam+"_timestamp");
				  var dateValue=self.config['dates'][dateParam];
				  if (dateValue!=""){
					  theModel.variables.pushVar(dateParam+"_text",dateValue);				
					  dateValue=toDateNormalDDMMYYYYHHMMSS(dateValue);
					  theModel.variables.pushVar(dateParam,dateValue);				
					  theModel.variables.pushVar(dateParam+"_timestamp",dateValue.getTime());				
				  } else {
					  theModel.variables.pushVar(dateParam+"_text","");				
					  theModel.variables.pushVar(dateParam+"_timestamp","");				
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
		    if (repIni<repContractIni){
		    	repIni=repContractIni;
		    }
		    var formalInitDate=formatDate(repIni,3);
		    var formalEndDate=formatDate(repEnd,3);
		    fncAddVariable("formalInitDate",formalInitDate);
		    fncAddVariable("formalEndDate",formalEndDate);
		    
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
	    	theModel.variables.initVar("worksStartDate");
	    	var dateValue=self.config['dates']["ContractInitDate"];
		    if (isDefined(self.config['dates']["withAdvancedWorks"])&&(self.config['dates']["withAdvancedWorks"])){
				theModel.variables.pushVar("withAdvancedWorks",self.config['dates']["withAdvancedWorks"]);
				dateValue=self.config['dates']["ContractAdvancedDate"];
		    }
			dateValue=toDateNormalDDMMYYYYHHMMSS(dateValue);
			theModel.variables.pushVar("worksStartDate",dateValue);
			//theModel.variables.pushVar("worksInitDate",dateValue);
		});

		self.addStep("Construct Issue Dynamic Object.... ",function(){
			self.allIssues=newIssueFactory(self);
			self.allIssues.setTaskManager(self.getTaskManager());
			self.workOnIssueSteps=function(theObjectOrKey,fncWork,bMaintainLocked,fncNotExists){
				return self.allIssues.workOnSteps(theObjectOrKey,fncWork,bMaintainLocked,fncNotExists);
			}
			self.workOnListOfIssueSteps=function(listOfKeysOrObjects,fncWork,maxParallelThreads,fncNotExists){
				return self.allIssues.workOnListSteps(listOfKeysOrObjects,fncWork,maxParallelThreads,fncNotExists);
			}

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
	    		var fncFormula=Function("actualValue","issue","fieldName","atDatetime","notAdjust",sBillingAdjustFunction);
	    		self.adjustAccumItemFunctions.add("Childs",fncFormula);
	        }
	        
	        var sAdvanceAdjustFunction=self.config.AdvanceElementAdjustFunction;
	        if (isDefined(sAdvanceAdjustFunction)&&(sAdvanceAdjustFunction!="")){
	    		var fncFormula=Function("actualValue","issue","fieldName","atDatetime","notAdjust",sAdvanceAdjustFunction);
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
				var fncExclusion=self.config.excludeFunction;
				self.allIssues.setExcludeFunction(fncExclusion);
			}
			if ((isDefined(self.config.relatedIssuesFindFunctionEnabled)&&self.config.relatedIssuesFindFunctionEnabled)&&
					   (isDefined(self.config.relatedIssuesFindFunction)&&(self.config.relatedIssuesFindFunction.trim()!=""))){
						self.allIssues.setRelatedIssueFindFunction(self.config.relatedIssuesFindFunction);
					}

        // change de "fieldValue" method
			if (self.allIssues.isStorable()){
				self.storeManager=new RCGObjectStorageManager("Reports",self.getTaskManager());
			} else {
				self.config.reuseIssues=false;
			}
		});
		// first launch all issue retrieve ...
		self.addStep("Getting All Issues in the Scope.... ",function(){
			//debugger;
			self.allIssues.changeStorableParams(100,0.10,true);
			if (self.isReusingReport()){
				self.addStep("check if report exists in storage",function(){
					return self.existStored(); // load all issues
				})
				self.addStep("Loading report...",function(){
					if (self.isReusingReport()){
						return self.load(); // load all issues
					}
				})
			} 
			self.addStep("Loading the Scope",function(){
				if (self.isReusingReport()&&(self.config.jqlScope.jql!="")){
					return self.jira.processJQLIssues(self.config.jqlScope.jql,
								function(jsonIssue){
									return self.createNewIssueFromJsonSteps(jsonIssue);
								},
								undefined,undefined,undefined,undefined,dontReturnAllIssuesRetrieved);
				}
			});
		});	
		self.addStep("Asigning all Issues in the scope.... ",function(){
			log("All issues in Report:"+ self.allIssues.list.length()+ " issues");
			self.allIssues.logStats();
		});	

	
		// get root elements.... issues and/or projects
		self.addStep("Getting root elements.... ",function(){
			log("Getting root elements");
			if (self.isReusingReport()){
				return;
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
*/			//debugger;
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
					var fncProcessRootIssue=function(jsonIssue){
						var issue=self.allIssues.getById(jsonIssue.key);
						if (issue==""){
							self.createNewIssueFromJsonSteps(jsonIssue);
						} 
						self.addStep("Adding issue to root list",function(newIssue){
							if (issue==""){
								issue=newIssue;
							}
							self.rootIssues.add(jsonIssue.key,issue);
						});
					}
					self.addStep("Processing jql to get root issues:"+theJQL,function(){
						return self.jira.processJQLIssues(
										theJQL,
										fncProcessRootIssue,
										undefined,undefined,undefined,undefined,dontReturnAllIssuesRetrieved);
					});
				}
			}
		});
		var hsKeyWaiting=newHashMap();
		self.addStep("Processing root elements.... ",function(){
			//debugger;
			self.allIssues.logStats();
			if (self.isReusingReport()) return;
			if (self.bFinishReport) return;
			if (self.isReusingIssueList()){
				self.rootIssues.walk(function(issue){
					self.childs.add(issue.getId(),issue);
				});
				return;
			}
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
				if (isDefined(issueKey)&&(issueKey!="")){
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
				} else {
					debugger;
				}
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
			
			var fncExtractPendingKeys=function(inputIssue){
				nProcessedIssues++;
				var key="";
				if (isDefined(inputIssue.key)){
					key=inputIssue.key;
				} else {
					key=inputIssue.getKey();
				}
				if (!hsKeyWaiting.exists(key)){
					hsKeyWaiting.add(key,key);
				}
				log("Issue "+key+"("+nProcessedIssues+") issues:"+nRetrievedIssues+"/" +nPendingIssues+ " Epics :"+nRetrievedEpics+"/"+nPendingEpics);
				var issue=self.allIssues.getById(key);
				if (issue==""){
					debugger;
					issue=self.loadJSONIssue(inputIssue);
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
									return self.workOnIssueSteps(issueParent,function(issueParent){
										if (!issueParent.existsLinkedIssueKey(key)){
											issueParent.addLinkedIssueKey(key,key);
											issueParent.change();
											issue.change();
										}
										if (!issueParent.existsEpicChild(key)){
											issueParent.addEpicChild(issue);
											issueParent.change();
											issue.change();
										}
									});
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
			var fncProcessChildAndExtract=function(jsonIssue,index,resultLength){
				var fncNotExists=function(){
					return self.loadJSONIssue(jsonIssue);
				}
				return self.workOnIssueSteps(jsonIssue.key,fncExtractPendingKeys,undefined,fncNotExists);
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
			self.addStep("Extracting pending keys of ("+self.rootIssues.length()+") root issues",function(){
				//debugger;
				return self.workOnListOfIssueSteps(self.rootIssues,fncExtractPendingKeys);
			});
			self.addStep("Getting root base issues",function(){
				//alert("Extracted pending keys of initial root issues");
				log("Getting root base issues");
				//alert("All issues of jql retrieved");
				//self.allIssues.changeStorableParams(undefined,undefined,false);
				var fncRetrieveGroup=function(group){
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
								return self.jira.processJQLIssues(
										theJQL,
										fncProcessChildAndExtract,
										undefined,undefined,undefined,undefined,dontReturnAllIssuesRetrieved);
							});
							self.addStep("Finish Retrieving issues of Group ["+sIssues+"]",function(){
								nRetrievedIssues+=group.length; // the get epics issues call is finished... increase retrieved each epic called in group
								nStepsPlaned--;
								nCallsEnded++;
							});
						}
					}
				};
				
				var fncRetrieveEpicGroup=function(group){
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
								return self.jira.processJQLIssues(theJQL,fncProcessChildAndExtract
														    ,undefined,undefined,undefined,undefined,dontReturnAllIssuesRetrieved);
							});
							self.addStep("Finish Retrieving issues of Epic Group ["+sIssues+"]",function(){
								nRetrievedEpics+=group.length; // the get epics issues call is finished... increase retrieved each epic called in group
								nStepsPlaned--;
								nCallsEnded++;
							});
						}
					}
				};
				var fncProcessRestOfPending=self.createManagedFunction(function(){
					var bSomethingRetrieving=((arrKeyGroups.length>1)||(arrEpicGroups.length>1));
					self.addStep("Retrieve groups",function(){
						var auxKeyGroups=arrKeyGroups;
						keyGroup=auxKeyGroups.pop();
						arrKeyGroups=[keyGroup];
						if (auxKeyGroups.lenght>0){
							bSomethingRetrieving=true;
							return self.parallelizeProcess(auxKeyGroups,function(group){
								return fncRetrieveGroup(group);
							});
						}
					})
					self.addStep("Retrieve epics",function(){
						var auxEpicGroups=arrEpicGroups;
						epicGroup=auxEpicGroups.pop();
						arrEpicGroups=[epicGroup];
						if (auxEpicGroups.length>0){
							bSomethingRetrieving=true;
							return self.parallelizeProcess(auxEpicGroups,function(group){
								return fncRetrieveEpicGroup(group);
							});
						}
					});
					self.addStep("Rest of issues",function(){
						if (bSomethingRetrieving) return;
						if (nStepsPlaned>0)return;
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
							return fncRetrieveEpicGroup(group);
						} else if ((arrKeyGroups.length==1)&&(arrKeyGroups[0].length>0)){
							log("Testing to retrieve last issue group")
							log("Issue Groups:"+arrKeyGroups.length + " First Issue Group:" + arrKeyGroups[0].length);
							log("Epics Groups:"+arrEpicGroups.length + " First Group Epics:" + arrEpicGroups[0].length);
							var group=arrKeyGroups[0];
							arrKeyGroups=[];
							keyGroup=[];
							arrKeyGroups.push(keyGroup);
							grpLength=0;
							bSomethingRetrieving=true;
							return fncRetrieveGroup(group);
						}
					});
					self.addStep("Partial/final retrieving info",function(){
						log("Calls"+nCallsEnded+"/"+nCallsStarted
								+" Procesed "+ nProcessedIssues +"."
								+" Tot:"+(nDuplicatedIssues+self.allIssues.list.length() )+" Dups:"+nDuplicatedIssues+" + All Stored:"+self.allIssues.list.length() +")" 
								+" in " +nStepsPlaned +"/"+ nTotalStepsPlaned +" steps."
								+" Issues: "+ nRetrievedIssues+"/"+nPendingIssues 
								+" Epics:"+ nRetrievedEpics + "/"+nPendingEpics
								+" Issues left:"+ arrKeyGroups[0].length
								+" Epics left:" + arrEpicGroups[0].length );
					});
					self.addStep("Adding new processPending if necesary",function(){
						if ((arrEpicGroups[0].length>0) || (arrKeyGroups[0].length>0)){
							log("there are issues to retrieve");
							fncProcessRestOfPending();
						}
					});
				});

				nPendingIssues=self.rootIssues.length();
//				self.rootIssues.walk(fncExtractPendingKeys);
				return fncProcessRestOfPending();
			});
			self.addStep("Finish loading Root Issues",function(){
/*				self.rootProjects.walk(function(value,iProf,key){
					log("Root Project: "+key);
				});
				
*/				//debugger;
				self.allIssues.logStats();
				log("Resume Root issues:"+self.rootIssues.length() +
				    "		Root project:"+self.rootProjects.length()+
				    "		Issues in scope:"+ self.allIssues.list.length());
			});
		});
		
		// load comments of issues
		self.addStep("Loading comments of "+ issuesAdded.length()+"issues",function(){
			self.allIssues.logStats();
			if (self.isReusingIssueList()||self.isReusingReport()) return;
			var arrKeyGroups=[];
			var keyGroup=[];
			arrKeyGroups.push(keyGroup);
			var maxItemsInGroup=100;
			var maxLettersInGroup=2000;
			var grpLength=0;
			var sKeyAux;
			var hsListComments=newHashMap();
			self.addStep("Preparing ("+issuesAdded.length()+"/"+self.rootIssues.length()+") issues groups to get comments", function(){
				return self.walkAsync(self.allIssues.list
											,function (jsonIssue,iDeep,issueKey){
												if ((keyGroup.length>=maxItemsInGroup)||(grpLength>=maxLettersInGroup)){
													keyGroup=[];
													grpLength=0;
													arrKeyGroups.push(keyGroup);
												}
												//sKeyAux=element.getKey();
												grpLength+=issueKey.length;
												keyGroup.push(issueKey);
											},function(){
												arrKeyGroups.forEach(function(group){
													if (group.length>0){
														hsListComments.push(group);
													}
												});
											});
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
				var fncProcessEachIssueComments=function(jsonIssue){
					return self.workOnIssueSteps(jsonIssue.key,function(issue){
						comments=jsonIssue.fields.comment.comments;
						htmlComments=jsonIssue.renderedFields.comment.comments;
						for (var i=0;i<comments.length;i++){
							comment=comments[i];
							htmlComment=htmlComments[i];
							objComment={id:comment.created.trim(),body:comment.body.trim(),htmlBody:htmlComment.body.trim()};
							issue.addComment(objComment);
							issue.change();
						}
						// applying "Jira Formal Report Adjusts"
						var sTokenAdjustComment="Jira Formal Report Adjusts";
						var hsReportAdjusts=issue.getCommentsStartsWith(sTokenAdjustComment);
						hsReportAdjusts.walk(function(oAdjustComment){
							issue.change();
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
									//debugger;
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
					});
				}
				return self.parallelizeProcess(arrIssues,fncProcessEachIssueComments,1);
			}
			self.addStep("Getting comments parallelized.", function(){
				var fncCall=function(group){
						self.jira.getComments(group,fncAddComments," and comment ~ formal");
				};
				return self.parallelizeCalls(hsListComments,fncCall);
			});
		});
		
		// load report model and submodels
		// Process Model with The Report
		self.addStep("Parsing Model",function(){
			self.allIssues.logStats();
			return self.objModel.process("parse"); // parse....
		});
			
		// assing childs and advance childs to root elements
		self.addStep("Assign Childs and Advance",function(){
			self.allIssues.logStats();
			log("Assing Childs and Advance");
			//debugger;
			if (self.isReusingIssueList()||self.isReusingReport()) return;
			var tm=self.getTaskManager();
			tm.asyncTimeWasted=0;
			tm.asyncTaskCallsBlock=auxAsyncTaskCallsBlock;
			tm.asyncTaskCallsMaxDeep=auxAsyncTaskCallsMaxDeep;
			tm.setUpdateStatusDelay(2000);
			var arrLinkTypes=self.config.useIssueLinkTypes;
			
			var countAdded=0;
			var nExcludedIssues=0;
			
			self.addStep("Adding retrieved issuest to root list", function(){
				return self.walkAsync(hsKeyWaiting,function(issue,iProf,key){
					if (!self.rootIssues.exists(key)){
						self.rootIssues.add(key,issue);
						countAdded++;
					}
				});
			});
			self.addStep("Walking througth the roots to set to issuesAdded...",function(){
				//debugger;
				logError("Added "+countAdded+" "+ ((100*countAdded)/self.rootIssues.length()) +"% to the seletion JQL");
				return self.workOnListOfIssueSteps(self.rootIssues,function(issue){
					var key=issue.getKey();
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
				});
			});
			self.addStep("Finding Childs",function(){
				//debugger;
				log("Finding Childs");
				if (nExcludedIssues>0){
					log("Excluded "+nExcludedIssues+" root issues after apply project exclude list filter");
				}
				var formulaChild=self.config.billingHierarchy;
				var formulaAdvance=self.config.advanceHierarchy;
				if (formulaChild==""){
					return;
				} else {
					var sFncFormulaChild="var bResult="+formulaChild+"; return bResult;";
					var sFncFormulaAdv="var bResult="+formulaAdvance+"; return bResult;";
					var fncIsChild=Function("child","parent",sFncFormulaChild);
					var fncIsAdvPart=Function("child","parent",sFncFormulaAdv);
					
		//			var treeIssues=issuesAdded.toArray([{doFieldName:"self",resultFieldName:"issue"}]);
					var fncProcessChild=function(issueChild,issueParent){
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
							issueParent.change();
							issueChild.change();
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
							issueParent.change();
							issueChild.change();
						}
					};
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
							//log("Task Manager Status:"+self.getRunningTask().parent.actStep + " " + self.getRunningTask().parent.steps.length);
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
									relatedChilds.add(relatedIssueKey,relatedIssueKey);
								}
							}); 
							return self.workOnListOfIssueSteps(relatedChilds,function(issueChild){
								if (issueParent.getKey()==issueChild.getKey()){
									//debugger;
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
							},1);
						//},0,1,undefined,undefined,undefined,"INNER",undefined
						});
					}
					return self.workOnListOfIssueSteps(self.childs,fncGetIssueChilds);
				}
			});
		});
		
		self.addStep("Final Adjusts to retrieved list of issues",function(){
			//debugger;
			self.allIssues.logStats();
			if (self.isReusingIssueList()||self.isReusingReport()) return;
			self.addStep("Analizing child/parent billing cycles and multiple parents",function(){
				var fncAdjustParents=function(issue,hsIssuePath){
					var issueKey=issue.getKey();
					var hsRemoveParents=newHashMap();
					var sError="";
					var hsIssueParents=issue.getListParentsChild();
					hsIssueParents.walk(function(issueParent){
						var parentKey=issueParent.id; // the parent maybe unload
						if (!issuesAdded.exists(parentKey)){ //using id because the root issue is not fullyloaded
							sError="The "+issueKey+" root issue: "+ parentKey+" does not exists in process issues list. Maybe an error";
							hsRemoveParents.add(parentKey,{issue:issue,parent:issueParent,error:sError});
						} else if (hsIssuePath.exists(parentKey)){
							sError="The Issue:"+issueKey+" has a cycle child/parent relation with "+parentKey+". Removing the relation.";
							hsRemoveParents.add(parentKey,{issue:issue,parent:issueParent,error:sError});
						} 
					});
					hsRemoveParents.walk(function(parentRemove,iDeep,parentKey){
						if (hsIssueParents.exists(parentKey)){
							hsIssueParents.remove(parentKey);
						}
						issue.addError(parentRemove.error);
						issue.change();
					});
					var nParents=hsIssueParents.length();
					while (nParents>1){
						var issueParent=hsIssueParents.getLast().value;
						var parentKey=issueParent.id; // the parent maybe unload
						sError="The Issue:"+issueKey+" has more than one parent. Removing the relation with:"+parentKey;
						hsRemoveParents.add(parentKey,{issue:issue,parent:issueParent,error:sError});
						if (hsIssueParents.exists(parentKey)){
							hsIssueParents.remove(parentKey);
						}
						issue.addError(sError);
						issue.change();
						nParents=hsIssueParents.length();
					}
					if (hsRemoveParents.length()>0){
						self.sequentialProcess(hsRemoveParents,function(parentRemove){
							return self.workOnIssueSteps(parentRemove.parent,function(issueParent){
								if (issueParent.getChilds().exists(issue.id)){
									issueParent.getChilds().remove(issue.id);
								}
								logError(parentRemove.error);
								issueParent.addError(parentRemove.error);
								issueParent.change();
							});
						});
					}
				}
				return self.workOnListOfIssueSteps(issuesAdded,function(issue){
					var issueKey=issue.getKey();
					var hsIssuesPath=newHashMap();
					if (issue.countParentsChild()==0) return;
					hsIssuesPath.add(issue.getKey(),issue);
					issue.processHierarchy(function(issue){
						fncAdjustParents(issue,hsIssuesPath);
					});
				},1);
			});
			self.addStep("Creating child relations by issue custom formulas",function(){
				return self.workOnListOfIssueSteps(issuesAdded,function(issueParent){
					if (issueParent.existsRelationFilter("Child")){
						//debugger;
						var childRelationFilter=issueParent.getRelationFilterById("Child");
						return self.workOnListOfIssueSteps(issuesAdded,function(issueChild){
							if (issueChild.getKey()!=issueParent.getKey()){
								var bResult=childRelationFilter([issueChild]);
								if (bResult){
									if (!issueParent.getChilds().exists(issueChild.getKey())){ // when reusing dynobj the childs are setted
										issueParent.addChild(issueChild);
										issueParent.change();
										issueChild.change();
									}
								}
							}
						});
					}
				},1);
			});
			var removeCounter=0;
			var hsRemoveKeys=newHashMap();
			//debugger;
			var bAdvancedWorks=self.objModel.variables.getVar("withAdvancedWorks");
			var txtIniDate;
			var dtIniDate;
			if (bAdvancedWorks){
	            txtIniDate=self.objModel.variables.getVar("ContractAdvancedDate"+"_text");
	            dtIniDate=self.objModel.variables.getVar("ContractAdvancedDate");
			} else {
	            txtIniDate=self.objModel.variables.getVar("ContractInitDate"+"_text");
	            dtIniDate=self.objModel.variables.getVar("ContractInitDate");
			}
			
			
			self.addStep("Identifying issues to exclude...",function(){
				//debugger;
				return self.workOnListOfIssueSteps(issuesAdded,function(issue){
		            var txtEndDate=self.objModel.variables.getVar("ReportEndDate"+"_text");
		            var rptEndDate=self.objModel.variables.getVar("ReportEndDate");
					var optGetFieldValues=[{key:"ifEmpty",value:0}];
					var faseAtEndReport=issue.fieldValue('Fase', false
				            ,rptEndDate
				            ,optGetFieldValues
				            );
					var faseAtIniReport=issue.fieldValue('Fase', false
				            ,dtIniDate
				            ,optGetFieldValues
				            );
					if (issue.isExcludedByFunction()){
						removeCounter++;
						hsRemoveKeys.add(issue.getKey(),{issue:issue,removeFromParent:true});
					} else if (self.config.removeChildIssuesFromRootList && (issue.countParentsChild()>0)){
						removeCounter++;
						hsRemoveKeys.add(issue.getKey(),{issue:issue});
					} else if (self.config.removeNotCreatedIssues && ((faseAtEndReport<0)||(faseAtEndReport===""))){
						removeCounter++;
						hsRemoveKeys.add(issue.getKey(),{issue:issue,removeFromParent:true});
					} else if (self.config.removeClosedBefore && (faseAtIniReport>=4)){
						removeCounter++;
						hsRemoveKeys.add(issue.getKey(),{issue:issue,removeFromParent:true});
					}
				});
			});

			
			var nRemoves=0;
			var nRootsPrevious=0;
			self.addStep("Removing identified issues",function(){
//				loggerFactory.getLogger().enabled=true;
				log("Items to remove:"+removeCounter);
				log("Items in hsRemoveKeys:"+hsRemoveKeys.length());
				//debugger;
				/*
				hsRemoveKeys.walk(function(issRemove,iDeep,issKey){
					if (isUndefined(issRemove)||(issRemove=="")){
						alert("Undefined Element");
						//debugger;
					};
				});*/
				nRootsPrevious=self.childs.length();
				return self.parallelizeProcess(hsRemoveKeys,function(issRemove){
					var issueBase=issRemove.issue;
					return self.workOnIssueSteps(issueBase,function(issue){
						var issueKey=issue.getKey();
						if (self.childs.exists(issueKey)){
							self.childs.remove(issueKey);
							issuesAdded.remove(issueKey);
							nRemoves++;
						}
						if (isDefined(issRemove.removeFromParent)
								&&issRemove.removeFromParent
								&&(issue.countParentsChild()>0)){
							return self.workOnListOfIssueSteps(issue.getListParentsChild(),function(theParent){
								theParent.getChilds().remove(issueKey);
							});
						}
					});
				});
			});
			self.addStep("Removing identified issues Finished",function(){
//				loggerFactory.getLogger().enabled=false;
				var nRootsFinal=self.childs.length();
				if ((hsRemoveKeys.length()!=nRemoves)
					||((nRootsPrevious-nRemoves)!=nRootsFinal)
					){
					log("The number of keys to remove is different of the effective removed issue count");
				}
//				loggerFactory.getLogger().enabled=false;
			});
		});
		
		self.addStep("Processing Directives",function(){
			//debugger;
			self.allIssues.logStats();
			if (self.isReusingIssueList()||self.isReusingReport()) return;
			var hsVersions=newHashMap();
			var hsAccumulators=newHashMap();
			log("Analizing directives");
			self.addStep("Analizing Directives",function() {
				return self.workOnListOfIssueSteps(issuesAdded,function(issue){
					self.objModel.directives.walk(function(hsDirectives,iProof,sDirectiveKey){
						hsDirectives.walk(function(sValue){
							log(sDirectiveKey + " directive setted:"+sValue);
							if ((sDirectiveKey=="use") && (sValue=="versions")){
								var arrVersions=issue.fieldValue("fixVersions");
								arrVersions.forEach(function(version){
									var name=version.name;
									var released=version.released;
									if (!hsVersions.exists(name)){
										hsVersions.add(name,name);
									};
								});
							} else if ((sDirectiveKey=="accumulators")
										&&(!self.config.DontLoadLeafPrecomputations)){
								// the directive accumulators is processed by the model 
								var accumList=self.objModel.accumulatorList;
								var hmKey;
								accumList.walk(function(hsAccum,iProf,accumKey){
									log("Type of accumulators:"+accumKey);		
									hsAccum.walk(function(theFieldAccum){
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
							}
						});
					});
				});
			});
			self.addStep("Processing acummulators",function(){
				if (hsAccumulators.length()>0){
					self.addStep("Getting the accumulators",function(){
						var fncCall=function(callInfo){
							var issue=callInfo.issue;
							var propKey=callInfo.key;
							self.jira.getProperty(issue.id,propKey); //using id.... the issue is not fully loaded
						};
						var fncProcess=function(callInfo,objProperty){
							return self.workOnIssueSteps(callInfo.issue,function(issue){
								if (objProperty!=""){
									log("Start adding properties "+objProperty.key +" to issue:"+issue.getKey() );
									issue.setPrecomputedPropertyLife(objProperty.key,objProperty.value);
									log("End of adding properties "+objProperty.key +" to issue:"+issue.getKey() );
								}
							});
						};
						return self.parallelizeCalls(hsAccumulators,fncCall,fncProcess);
					});
				}
			});
			self.addStep("Processing versions",function(){
				if (false &&(hsVersions.length()>0)){
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
								return self.jira.processJQLIssues("fixVersion in ("+sVersions+")",
														  fncProcessIssue
														  ,undefined,undefined,undefined,undefined,dontReturnAllIssuesRetrieved);
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
			});
		});
		self.addStep("Saving Report to reuse",function(){
			//debugger;
			self.allIssues.logStats();
			if (self.isReusingIssueList()||self.isReusingReport()) return;
			if (self.allIssues.isStorable()){
				self.addStep("Storing remaining issues in memory...",function(){
					return self.allIssues.saveAllNotStored();
				});
				self.addStep("Checking if exists issues a) not stored b) locked",function(){
					self.allIssues.list.walk(function(issue){
						if (!issue.stored){
							logError("The issue "+issue.id+" is not stored");
						}
						if (issue.isLocked()){
							logError("The issue "+issue.id+" is still locked "+issue.numLocks);
						}
					});
				});
				self.addStep("Storing last report...",function(){
					return self.storeManager.save("LastReport",self);
				});
			}
		});
		// load report model and submodels
		// Process Model with The Report
		self.addStep("Processing Model",function(){
			if (true){
			debugger;
			self.allIssues.logStats();
			self.getTaskManager().logCalls=false;
			loggerFactory.getLogger().enabled=false;
			var tm=self.getTaskManager();
			tm.asyncTimeWasted=0;
			tm.asyncTaskCallsBlock=auxAsyncTaskCallsBlock;
			tm.asyncTaskCallsMaxDeep=auxAsyncTaskCallsMaxDeep;
			tm.setUpdateStatusDelay(5000);
			tm.autoFree=true;
			return self.objModel.process("encode"); // hash inner task....
			} else {
				return [""];
			}
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
						return jira.setProperty(issueUpdate.issueKey,issueUpdate.cacheKey,issueUpdate.precompObj);
					};
					return self.parallelizeCalls(hsUpdateProps,fncCall);
				});
			}
			self.addStep("Returning the model processed result",function(){
				self.allIssues.logStats();
				return sModelProcessedResult;
			});
		});
		self.addStep("Setting the HTML",function(sModelProcessedResult){
			self.allIssues.logStats();
			var tm=self.getTaskManager();
			tm.autoFree=false;
			tm.asyncTaskCallsBlock=auxAsyncTaskCallsBlock;
			tm.asyncTaskCallsMaxDeep=auxAsyncTaskCallsMaxDeep;
			tm.setUpdateStatusDelay(2000);
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
		});
		
		self.addStep("Storing issue info or Removing all Issues in the scope.... ",function(){
/*			self.allIssues.list.clear();
			log("Report uses "+ self.allIssues.list.length()+ " issues");
			self.childs=newHashMap();
			self.advanceChilds=newHashMap();
			//self.treeIssues=newHashMap();
			self.rootElements=newHashMap();
			self.rootIssues=newHashMap();
			self.rootProjects=newHashMap();
*/
/*			} else {
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
*/		});
		
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
			return fncLaunchPages(self.pageResultId);
		});
	}
	openResultInNewTab(){
		var self=this;
		return modelInteractiveFunctions.openNewWindow(self.pageResultId);
	}
	saveResultToFile(){
		var self=this;
		if (isDefined(self.pageResultId)&&(self.pageResultId!="")){
			return modelInteractiveFunctions.saveToFile(self.pageResultId);
		}
	}
	freeObject(name,obj,freeFnc){
		if (isUndefined(obj)||(obj==="")) return;
		var self=this;
		var prevSize=0;
		var postSize=0;
		if (isDefined(self.storeManager)&&(self.storeManager!=="")){
			var json=self.storeManager.generateJson(obj);
			prevSize=json.length;
		}
		if (isHashMap(obj)){
			obj.clear();
		} else if (isDynamicFactory(obj)){
			obj.list.clear();
		} else if (isDefined(freeFnc)) {
			freeFnc(obj);
		}
		if (isDefined(self.storeManager)&&(self.storeManager!=="")){
			var json=self.storeManager.generateJson(obj);
			postSize=json.length;
		}
		log("Freeing "+name+" before size:"+ prevSize+" after size:"+postSize+ " freed bytes:"+(postSize-prevSize));
	}
	freeMemory(){
		var self=this;
		//clean the destination html.... to save memory when run more than one intents
        var jqResult=$("#ReportResult");
        jqResult.html("");
        self.addStep("Freeing all info in report",function(){
        self.addStep("Saving All Unlocked",function(){
        	self.allIssues.storeManager.saveAllUnlocked();
        });
        self.addStep("Freeing all data",function(){
	        self.freeObject("Report",self,function(){
		        self.freeObject("self.allIssues.storeManager",self.allIssues.storeManager,function(){
		            self.allIssues.storeManager.freeMemory();
		        });
		        self.freeObject("self.childs",self.childs);
		        self.freeObject("self.advanceChilds",self.advanceChilds);
		        self.freeObject("self.rootElements",self.rootElements);
		        self.freeObject("self.rootIssues",self.rootIssues);
		        self.freeObject("self.rootProjects",self.rootProjects);
		        self.freeObject("self.treeIssues",self.treeIssues);
		        self.freeObject("self.objModel.functionCache",self.objModel.functionCache);
		        self.freeObject("modelInteractiveFunctions",modelInteractiveFunctions,function(){
		        	modelInteractiveFunctions.freeMemory();
		        });
		        self.freeObject("self.allIssues.list",self.allIssues.list,function(){
		            self.allIssues.list.walk(function(issue){
		            	issue.freeMemory();
		            });
			        self.allIssues.list.clear();
		        });
				self.objModel=undefined;
	        });
        });
	},0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        
	}
}