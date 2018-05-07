class RCGConfluence{
	constructor(atlassian){
		var self=this;
		self.manager=atlassian;
		self.subPath="wiki";
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
	getAllPages(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			self.popCallback();
		});
		self.apiCall("/rest/api/content/search?cql=type=page");
	}
	getContent(contentId){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			self.popCallback([response]);
		});
		self.apiCall("/rest/api/content/"+contentId+"?expand=body.storage");
	}
}
