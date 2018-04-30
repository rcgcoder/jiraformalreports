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
		self.projects=[];
		self.epics=[];
		self.issueTypes=[];
		self.labels=[];
		self.fields=[];
		self.filters=[];
	}
	getFields(){
		log("Getting fields");
		return this.fields;
	}
	processFields(arrItems){
		// interest info
		// 		key
		//		name
		//		schema.type
		var self=this;
		var doItem;
		var doFactory=newDynamicObjectFactory([],["Type"],[]);
		self.fields=doFactory;
		for (var i=0;i<arrItems.length;i++){
			var itm=arrItems[i];
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setType(itm.jsonObj.schema.type);
		}
	}
	processProjects(arrItems){
		// interest info
		// 		key
		//		name
		//		InnerId
		var self=this;
		var doItem;
		var doFactory=newDynamicObjectFactory([],["InnerId"],[]);
		self.projects=doFactory;
		for (var i=0;i<arrItems.length;i++){
			var itm=arrItems[i];
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setInnerId(itm.id);
		}
	}
	processIssueTypes(arrItems){
		// interest info
		// 		key
		//		name
		//		InnerId
		var self=this;
		var doItem;
		var doFactory=newDynamicObjectFactory([],["Description","SubTask","IconUrl"],[]);
		self.issueTypes=doFactory;
		for (var i=0;i<arrItems.length;i++){
			var itm=arrItems[i];
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setDescription(itm.jsonObj.description);
			doItem.setIconUrl(itm.jsonObj.iconUrl);
			doItem.setSubTask(itm.jsonObj.subtask);
		}
	}
	getProjectsAndMetaInfo(){
		var self=this;
		var inner_Projects=[];
		var inner_Fields=[];
		var inner_IssueTypes=[];
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			self.processFields(inner_Fields);
			self.processProjects(inner_Projects);
			self.processIssueTypes(inner_IssueTypes);
			self.popCallback([self.projects]);
		});
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			//log("getAllProjects:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				for (var i=0;i<response.projects.length;i++){
					var project=response.projects[i];
					var prjKey=project.key;
					var prjName=project.name;
					var prjInnerId=project.id;
					inner_Projects.push({key:prjKey,name:prjName,id:prjInnerId,jsonObj:project});
					for (var j=0;j<project.issuetypes.length;j++){
						var issuetype=project.issuetypes[j];
						var itKey=issuetype.id;
						var itName=issuetype.name;
						if (!isInArray(inner_IssueTypes,itKey,"key")){
							inner_IssueTypes.push({key:itKey,name:itName,jsonObj:issuetype});
						}
						var itSubtask=issuetype.subtask;
						// the fields are not an array...
						
						var arrProperties=Object.getOwnPropertyNames(issuetype.fields.__proto__).concat(Object.getOwnPropertyNames(issuetype.fields));
						for (var k=0;k<arrProperties.length;k++){
							var vPropName=arrProperties[k];
							if (vPropName!=="__proto__"){
								var field=issuetype.fields[vPropName];
								if (typeof field==="object"){
									var fldName=field.name;
									var fldKey=field.key;
									if (!isInArray(inner_Fields,fldKey,"key")){
										inner_Fields.push({key:fldKey,name:fldName,jsonObj:field});
									}
								} 
							}
						}
					}
				}
			}
			self.popCallback();
		});
		self.apiCall("/rest/api/latest/issue/createmeta?expand=projects.issuetypes.fields");
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
					var bExists=false;
					for (var k=0;(!bExists)&&(k<self.labels.length);k++){
						var lbl=self.labels[k];
						if (lbl==issLbl){
							bExists=true;
						}
					}
					if (!bExists){
						self.labels.push(issLbl);
					}
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
			self.epics=response;
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
	getAllIssues(){
		var self=this;
		self.addStep("Getting All Issues", function(){
			self.getFullList("/rest/api/2/search?expand=changelog","issues");
		});
		self.addStep("Processing all Issues", function(response,xhr,sUrl,headers){
			self.popCallback();
		});
		self.continueTask();
//		self.apiCall("/plugins/servlet/applinks/proxy?appId=d1015b5f-d448-3745-a3d3-3dff12863286&path=https://rcgcoder.atlassian.net/rest/api/2/search");
		//expand=changelog&jql=updateddate>'2018/03/01'
	}
	getJQLIssues(jql){
		var self=this;
		self.addStep("Getting All Issues from JQL", function(){
			self.getFullList("/rest/api/2/search?jql="+jql,"issues");
		});
		self.addStep("Processing all Issues from JQL", function(response,xhr,sUrl,headers){
			self.popCallback([response]);
		});
		self.continueTask();
	}
}
