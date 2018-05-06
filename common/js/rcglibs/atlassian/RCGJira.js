class RCGJira{
	constructor(atlassian){
		var self=this;
		self.manager=atlassian;
		self.subPath="";
		self.tokenNeeded=false;
		self.tokenAccess="";
		self.tokenTime=0;
		taskManager.extendObject(self);
		self.oauthConnect=function(){
			atlassian.oauthConnect(self);
			};
		self.apiCall=function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders){
			atlassian.apiCallApp(self, sTarget, callType, data, sPage, sResponseType,callback,arrHeaders);
			};
		self.getFullList=function(sTarget,resultName,callType,data,callback,arrHeaders){
			atlassian.apiGetFullList(self, sTarget, resultName,callType, data, callback,arrHeaders);
			};

		self.projects=newDynamicObjectFactory([],["InnerId"],[],"Projects");
		self.fields=newDynamicObjectFactory([],["Type"],[],"Fields");
		self.issueTypes=newDynamicObjectFactory([],["Description","SubTask","IconUrl"],[],"IssueTypes");

		self.epics=newDynamicObjectFactory([],[],[],"Epics");
		self.labels=newDynamicObjectFactory([],[],[],"Labels");
		self.filters=[];
		self.issueLinkTypes=[];
		self.issueOtherFields=[];
	}
	getFields(){
		log("Getting fields");
		return this.fields;
	}
	processJsonField(itm){
		// interest info
		// 		key
		//		name
		//		schema.type
		var self=this;
		var doItem;
		var doFactory=self.fields;
		if (!doFactory.exists(itm.key)){
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setType(itm.schema.type);
		}
	}
	processJsonProject(itm){
		// interest info
		// 		key
		//		name
		//		id --> InnerId
		
		var self=this;
		var doItem;
		var doFactory=self.projects;
		if (!doFactory.exists(itm.key)){
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setInnerId(itm.id);
		}
	}
	processJsonIssueType(itm){
		// interest info
		// 		id --> key
		//		name
		//		description --> Description
		//		iconUrl		--> IconUrl
		//		subtask		--> SubTask
		
		var self=this;
		var doItem;
		var doFactory=self.issueTypes;
		if (!doFactory.exists(itm.id)){
			doItem=doFactory.new(itm.name,itm.id);
			doItem.setDescription(itm.description);
			doItem.setIconUrl(itm.iconUrl);
			doItem.setSubTask(itm.subtask);
		}
	}
	processArrayIssues(arrIssues,fncProcessIssue,fncEndCallback,fncCustomBlockCallback){
		var self=this;
		var fncItem=self.createManagedCallback(fncProcessIssue);
		var fncEnd=self.createManagedCallback(fncEndCallback);
		var fncBlock;
		if (isDefined(fncCustomBlockCallback)){
			fncBlock=self.createManagedCallback(fncCustomBlockCallback);
		} else {
			fncBlock=self.createManagedCallback(function(){
				log("A block");
			});
		}
		processOffline(0,arrIssues.length,fncItem,"issues",fncEnd,fncBlock);
	}
	getIssueLinkFullList(scopeJQL){
		var self=this;
		var hsTypes=newHashMap();
		var issueLink;
		var type;
		var inward;
		var outward;
		var fncProcessIssue=function(issue){
			for (var j=0;j<issue.fields.issuelinks.length;j++){
				issueLink=issue.fields.issuelinks[j];
				type=issueLink.type;
				inward=type.inward;
				outward=type.outward;
				if (!hsTypes.exists(inward)){
					hsTypes.add(inward,inward);
				}
				if (!hsTypes.exists(outward)){
					hsTypes.add(outward,outward);
				}
			}
		};
		self.processJQLIssues(scopeJQL,fncProcessIssue,hsTypes);
	}
	getFieldFullList(scopeJQL){
		var self=this;
		var hsFields=newHashMap();
		var hsTypes=newHashMap();
		var issType;
		var fncProcessIssue=function(issue){
			issType=issue.fields.issuetype.name;
			if (!hsTypes.exists(issType)){
				hsTypes.add(issType,issue.fields.issuetype);
				var arrProperties=getAllProperties(issue.fields);
				for (var j=0;j<arrProperties.length;j++){
					var vPropName=arrProperties[j];
					if (!hsFields.exists(vPropName)){
						var vPropType=typeof issue[vPropName];
						hsFields.add(vPropName,{name:vPropName,type:vPropType});
					}
				}
				hsFields.swing();
				hsTypes.swing();
			}
		}
		self.processJQLIssues(scopeJQL,fncProcessIssue,hsFields);
	}
	getProjectsAndMetaInfo(){
		var self=this;
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			//log("getAllProjects:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				for (var i=0;i<response.projects.length;i++){
					var project=response.projects[i];
					self.processJsonProject(project);
					for (var j=0;j<project.issuetypes.length;j++){
						var issuetype=project.issuetypes[j];
						self.processJsonIssueType(issuetype);
						var arrProperties=Object.getOwnPropertyNames(issuetype.fields.__proto__).concat(Object.getOwnPropertyNames(issuetype.fields));
						for (var k=0;k<arrProperties.length;k++){
							var vPropName=arrProperties[k];
							if (vPropName!=="__proto__"){
								var field=issuetype.fields[vPropName];
								if (typeof field==="object"){
									self.processJsonField(field)
								} 
							}
						}
					}
				}
			}
			self.popCallback([self.projects]);
		});
		self.apiCall("/rest/api/latest/issue/createmeta?expand=projects.issuetypes.fields");
	}
	getIssueLinkTypes(){
		var self=this;
		return self.issueLinkTypes;		
	}
	setIssueLinkTypes(issueLinkTypes){
		var self=this;
		self.issueLinkTypes=issueLinkTypes;		
	}
	setIssueOtherFields(issueOtherTypes){
		var self=this; 
		self.issueOtherFields=issueOtherTypes;		
		
	}
	getIssueOtherFields(){
		return this.issueOtherFields;
	}
	
	getAllIssueLinkTypes(){
		
	}
	getAllProjects(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("getAllProjects:"+response);
			self.popCallback();
		});
		self.apiCall("/rest/api/2/project?expand=issueTypes");
	}
	getAllLabels(){
		var self=this;
		var doItem;
		var doFactory=self.labels;
		var fncProcessIssue=function(issue){
			for (var j=0;j<issue.fields.labels.length;j++){
				var issLbl=issue.fields.labels[j];
				if (!doFactory.exists(issLbl)){
					doItem=doFactory.new(issLbl,issLbl);
				}
			}
		}
		self.processJQLIssues("labels is not empty",fncProcessIssue,doFactory);
	}
	getAllEpics(){
		var self=this;
		var doItem;
		var doFactory=self.epics; 
		var fncProcessIssue=function(itm){
			if (!doFactory.exists(itm.key)){
				doItem=doFactory.new(itm.fields.summary,itm.key);
			}
		}
		self.processJQLIssues("issueType=epic",fncProcessIssue,doFactory);
	}
	getAllFilters(){
		var self=this;
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			log("getAllFilters:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				self.filters=response;
			}
			self.popCallback([self.filters]);
		});
		self.apiCall("/rest/api/2/filter");//,"GET",data);
	}
	getAllIssues(cbBlock){
		var self=this;
		self.addStep("Getting All Issues", function(){
			self.getFullList("/rest/api/2/search?expand=changelog","issues",undefined,undefined,cbBlock);
		});
		self.addStep("Processing all Issues", function(response,xhr,sUrl,headers){
			self.popCallback([response]);
		});
		self.continueTask();
//		self.apiCall("/plugins/servlet/applinks/proxy?appId=d1015b5f-d448-3745-a3d3-3dff12863286&path=https://rcgcoder.atlassian.net/rest/api/2/search");
		//expand=changelog&jql=updateddate>'2018/03/01'
	}
	getJQLIssues(jql,cbBlock){
		var self=this;
		self.addStep("Getting All Issues from JQL", function(){
			self.getFullList("/rest/api/2/search?jql="+jql,"issues",undefined,undefined,cbBlock);
		});
		self.addStep("Returning all Issues from JQL", function(response,xhr,sUrl,headers){
			self.popCallback([response]);
		});
		self.continueTask();
	}
	processJQLIssues(jql,fncProcessIssue,returnVariable,cbEndProcess,cbDownloadBlock,cbProcessBlock){
		var self=this;
		var jqlAux="";
		if (isDefined(jql)){
			jqlAux=jql;
		}
		var auxCbDownBlock;
		if (isDefined(cbDownloadBlock)){
			auxCbDownBlock=self.createManagedCallback(cbDownloadBlock);
		}
		var auxCbProcessBlock;
		if (isDefined(cbProcessBlock)){
			auxCbProcessBlock=self.createManagedCallback(cbProcessBlock);
		}
		var fncEndBarrier=self.createManagedCallback(function(){
			self.continueTask();
		});
		var innerBarrier=new RCGBarrier(fncEndBarrier);
		
		var fncProcessDownloadedBlock=self.createManagedCallback(function(jsonBlkIssues){
			var blkIssues=[];
			if (typeof jsonBlkIssues==="string"){
				var objJson=JSON.parse(jsonBlkIssues);
				blkIssues=objJson.issues;
			} else {
				blkIssues=jsonBlkIssues;
			}
			log("Process downloaded block of JQL ["+jqlAux+"]");
			innerBarrier.add(self.getRunningTask());
			self.addStep("Processing Issues block: "+blkIssues.length +" of JQL ["+jqlAux+"]",function(){
				if (isDefined(auxCbDownBlock)) auxCbDownBlock(blkIssues);
				var auxCbProcessIssue=function(issueIndex){
					log("Process Issue "+issueIndex+" of JQL ["+jqlAux+"]");
					var issue=blkIssues[issueIndex];
					fncProcessIssue(issue);
				}
				var fncEndBlock=self.createManagedCallback(function(){
					log("End block of JQL ["+jqlAux+"]");
					self.continueTask();
				});
				log("Process Array Issues of block of JQL ["+jqlAux+"]");
				self.processArrayIssues(blkIssues,auxCbProcessIssue,fncEndBlock,auxCbProcessBlock);
			});
		});
		self.addStep("Fetching Issues"+" of JQL ["+jqlAux+"]",function(){
			innerBarrier.add(self.getRunningTask());
			self.getJQLIssues(jqlAux,fncProcessDownloadedBlock);
		});
		self.addStep("Waiting to process all issues "+" of JQL ["+jqlAux+"]",function(){
		});
		
		self.addStep("Returning Variable"+" of JQL ["+jqlAux+"]",function(){
			var fncEnd;
			if (isDefined(cbEndProcess)){
				fncEnd=cbEndProcess;
			} else {
				fncEnd=function(vReturn){
					if (isDefined(vReturn)){
						self.continueTask([vReturn]);
					} else {
						self.continueTask();
					}
				};
			}
			fncEnd(returnVariable);
		});
		self.continueTask();
	}

}
