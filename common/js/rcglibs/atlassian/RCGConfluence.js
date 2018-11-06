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
		self.apiCall=function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders,useProxy){
			atlassian.apiCallApp(self, sTarget, callType, data, sPage, sResponseType,callback,arrHeaders,useProxy);
			};
		self.getFullList=function(sTarget,resultName,callType,data,callback,arrHeaders){
			atlassian.apiGetFullList(self, sTarget, resultName,callType, data, callback,arrHeaders);
			};
	}
	getUser(){
		return this.manager.userId;
	}
	getAllPages(){
		var self=this;
		self.addStep("Getting all confluence pages",function(){
			return self.apiCall("/rest/api/content/search?cql=type=page");
		});
		self.addStep("Processing result of get all confluence pages",function(response,xhr,sUrl,headers){
			return response;
		});
	}
	getContent(contentId){
		var self=this;
		self.addStep("Getting content:"+contentId,function(){
			return self.apiCall("/rest/api/content/"+contentId+"?expand=body.storage");
		});
		self.addStep("Processing result of get content",function(response,xhr,sUrl,headers){
			return response;
		});
	}
	getContentByTitle(contentTitle){
		var self=this;
		self.addStep("Stepping Get Content By Title call",function(){
			return self.apiCall("/rest/api/content?title="+contentTitle+"&expand=body.storage");
		});
		self.addStep("Processing result of get content by title",function(response,xhr,sUrl,headers){
			return response;
		});
	}
}
