class RCGConfluence{
	constructor(atlassian){
		var self=this;
		self.manager=atlassian;
		self.subPath="wiki";
		self.tokenNeeded=false;
		self.tokenAccess="";
		self.tokenTime=0;
		self.oauthConnect=function(){
			atlassian.oauthConnect(self);
			};
		self.apiCall=function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders){
			atlassian.apiCallApp(confluence, sTarget, callType, data, sPage, sResponseType,callback,arrHeaders);
			};
		self.getFullList=function(sTarget,resultName,callType,data,callback,arrHeaders){
			atlassian.apiGetFullList(self, sTarget, resultName,callType, data, callback,arrHeaders);
			};
	}
}
