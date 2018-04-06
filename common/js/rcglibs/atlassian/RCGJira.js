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
		self.issueTypes="";
		self.fields="";
	}
	
	getProjectsAndMetaInfo(){
		var self=this;
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			//log("getAllProjects:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				for (var i=0;i<response.projects.length;i++){
					var project=response.projects[i];
					var prjKey=project.key;
					var prjName=project.name;
					var prjInnerId=project.id;
					self.projects.push({key:prjKey,name:prjName,id:prjInnerId});
					for (var j=0;j<project.issuetypes.length;j++){
						var issuetype=project.issuetypes[j];
						var itKey=issuetype.id;
						var itName=issuetype.name;
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
								} 
							}
						}
					}
				}
			}
			self.popCallback(response);
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
	getAllEpics(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("getAllEpics:"+response);
			self.popCallback();
		});
		var data= {
			      "jql": "issuetype=epic",
			      "startAt": 0,
			      "maxResults": 15,
			      "fields": [
			        "summary",
			        "status",
			        "assignee"
			      ],
			      "fieldsByKeys": false
			    };
		self.apiCall("/rest/api/2/search","POST",data);
	}
	getAllIssues(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			self.popCallback();
		});
//		self.apiCall("/plugins/servlet/applinks/proxy?appId=d1015b5f-d448-3745-a3d3-3dff12863286&path=https://rcgcoder.atlassian.net/rest/api/2/search");
		self.getFullList("/rest/api/2/search?expand=changelog","issues");
		//expand=changelog&jql=updateddate>'2018/03/01'
	}
}
