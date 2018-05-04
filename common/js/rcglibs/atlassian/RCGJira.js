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
	processJsonLabel(lbl){
		// itm is String
		
		var self=this;
		var doItem;
		var doFactory=self.labels;
		if (!doFactory.exists(lbl)){
			doItem=doFactory.new(lbl,lbl);
		}
	}
	processJsonEpic(itm){
		// interest info
		// key --> id
		// fields.summary --> name
		
		var self=this;
		var doItem;
		var doFactory=self.epics;
		if (!doFactory.exists(itm.key)){
			doItem=doFactory.new(itm.fields.summary,itm.key);
		}
	}
	getFieldFullList(scopeJQL){
		var self=this;
		self.addStep("Getting all Issues on JQL:"+scopeJQL,function(){
			var theJQL="";
			if (isDefined(scopeJQL)){
				theJQL=scopeJQL;
			}
			self.getJQLIssues(scopeJQL);
		});
		self.addStep("Extracting all Field Keys",function(arrIssues){
			var hsFields=newHashMap();
			var hsTypes=newHashMap();
			var issue;
			var issType;
			for (var i=0;i<arrIssues.length;i++){
				issue=arrIssues[i];
				issType=issue.fields.issuetype.name;
				if (!hsTypes.exists(issType)){
					hsTypes.add(issType,issue.fields.issuetype);
					var arrProperties=getAllProperties(issue);
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
			self.continueTask([hsFields]);
		});
		self.continueTask();
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
		self.addStep("Getting All Labels", function(){
			self.getFullList("/rest/api/2/search?jql=labels is not empty","issues");//,"GET",data);
		});
		self.addStep("Processing all Labels", function(response,xhr,sUrl,headers){
			
			for (var i=0;i<response.length;i++){
				var issue=response[i];
				for (var j=0;j<issue.fields.labels.length;j++){
					var issLbl=issue.fields.labels[j];
					self.processJsonLabel(issLbl);
				}
			}
			self.popCallback([self.labels]);
		});
		self.continueTask();
	}
	getAllEpics(){
		var self=this;
		self.addStep("Getting All Epics", function(){
			self.getFullList("/rest/api/2/search?jql=issueType=epic","issues");//,"GET",data);
		});
		self.addStep("Processing all Epics", function(response,xhr,sUrl,headers){
			log("getAllEpics:"+response);
			for (var i=0;i<response.length;i++){
				self.processJsonEpic(response[i]);
			}
			self.popCallback([self.epics]);
		});
		self.continueTask();
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
		self.addStep("Processing all Issues from JQL", function(response,xhr,sUrl,headers){
			self.popCallback([response]);
		});
		self.continueTask();
	}
}
