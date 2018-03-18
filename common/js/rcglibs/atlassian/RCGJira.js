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
