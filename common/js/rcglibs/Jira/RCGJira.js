class RCGJira{
	constructor(app){
		var self=this;
		self.proxyPath="";
		self.instance="";
		self.JiraAPConnection=AP;
		self.app=app;
		self.confluence={
				jiraManager:self,
				subPath:"wiki",
				tokenNeeded:false,
				tokenAccess:"",
				tokenTime:0,
				oauthConnect:function(){
					self.oauthConnect(self.confluence);
					}
				,
				apiCall:function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders){
					self.apiCallApp(self.confluence, sTarget, callType, data, sPage, sResponseType,callback,arrHeaders);
				}
			};
		self.jira={
				jiraManager:self,
				subPath:"",
				tokenNeeded:false,
				tokenAccess:"",
				tokenTime:0,
				oauthConnect:function(){
					self.oauthConnect(self.jira);
					},
				apiCall:function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders){
					self.apiCallApp(self.jira, sTarget, callType, data, sPage, sResponseType,callback,arrHeaders);
					}
				};
		taskManager.extendObject(self);
	}
	loadError(oError){
	    throw new URIError("The URL " + oError.target.src + " is not accessible.");
	}
	apiCallOauth(sTargetUrl,data,sPage,sType,callback,arrHeaders){
		var self=this;
		var sUrl=self.proxyPath+"/oauth"+sTargetUrl;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.responseType = 'json';
		xhr.onerror=self.loadError;
		xhr.onload = self.createManagedCallback(function(e) {
		  if (xhr.status == 200) {
			  self.popCallback([xhr.response,xhr,sTargetUrl,arrHeaders]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		});
		xhr.send();	
	}
	apiOauthSecondStep(response,xhr,sUrl,headers){
		var self=this;
		log("Oauth Jira URL:"+response.url);
		var win;
		
		var checkIfToken=self.createManagedCallback(function(){
			self.addStep("Checking for session access token",function(response,xhr,sUrl,headers) {
				if  ((response==null)||
					(typeof response==="undefined")||
					(response.isToken==false)){
					setTimeout(checkIfToken,1000);
				} else {
					log("Oauth Access token:"+response.access);
					self.popCallback([response.access,response.secret]);
				}
			});
			self.apiCallOauth("/sessionToken");
		});
		win = window.open(response.url, '_blank');
		log("Tab Opened");
		checkIfToken();
	}

	oauthConnect(appInfo){
		var self=this;
		var appName="Jira";
		if (appInfo.subPath!=""){
			appName=appInfo.subPath;
		}
		self.addStep("Querying a OAuth Access Token for "+appName,function(){
				self.apiCallOauth("/sessions/connect?jiraInstance="+
						self.instance+
						(appInfo.subPath!=""?"/":"")+appInfo.subPath+
						"&callbackServer="+self.proxyPath);
		});
		self.addStep("Waiting for grant in "+appName,self.apiOauthSecondStep);
		self.addStep("Setting Access Token for "+appName,function(accessToken,secret){
			log("Setting Access Token:"+accessToken+" and Secret:"+secret);
			appInfo.subPath.tokenNeeded=true;
			appInfo.subPath.tokenAccess=accessToken;
			appInfo.subPath.tokenTime=secret;
			self.popCallback();
		});
		self.continueTask();
	}
	
	apiCallApp(appInfo,sTarget,callType,data,sPage,sResponseType,callback,arrHeaders){
		var self=this;
		var sTokenParam="";
		if (appInfo.tokenNeeded){
			sTokenParam="access_token=" + appInfo.tokenAccess;
			if (sTargetUrl.indexOf("?")<0){
				sTokenParam="?"+sTokenParam;
			}
		}
		var newSubPath=appInfo.subPath;
		if (newSubPath!=""){
			newSubPath="/"+newSubPath;
		}
		var sTargetUrl=newSubPath+sTarget+sTokenParam;
		log("Calling api of "+(newSubPath==""?"Jira":appInfo.subPath) + " final url:"+sTargetUrl);
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("Api Call Response:"+response);
			var bTestForb=true;
			if (xhr.status == 403) { // forbidden
				self.pushCallback(function(){
					self.apiCallApp(appInfo,sTarget,callType,data,sPage,sResponseType,callback,arrHeaders);					
				});
				self.oauthConnect(appInfo);
			} else {
				self.popCallback([response,xhr,sUrl,headers]);
			}
		});
		self.apiCallBase(sTargetUrl,callType,data,sPage,sResponseType,callback,arrHeaders);
	}
	apiCallBase(sTargetUrl,callType,data,sPage,sResponseType,callback,arrHeaders){
		var self=this;
		var newType="GET";
		if (typeof callType!=="undefined"){
			newType=callType;
		}
		var newData;
		if (typeof data!=="undefined"){
			newData=JSON.stringify(data);
		}
		var newResponseType='application/json';
		if (typeof sResponseType!=="undefined"){
			newResponseType=sResponseType;
		}
		var newCallback=callback;
		var newErrorCallback=callback;
		if (typeof newCallback==="undefined"){
			newCallback=self.createManagedCallback(function(responseObj){
			    self.popCallback([responseObj,self.JiraAPConnection]);
			  });
			newErrorCallback=self.createManagedCallback(function(xhr, statusText, errorThrown){
			    self.popCallback(["",xhr, statusText, errorThrown]);
			  })
		}
		self.JiraAPConnection.request({
			  url: sTargetUrl,
			  type:newType,
			  data:newData,
			  contentType: sResponseType,
			  success: newCallback,
			  error: newErrorCallback
			});
	}
	getAllProjects(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("getAllProjects:"+response);
			self.popCallback();
		});
		self.jira.apiCall("/rest/api/2/project?expand=issueTypes");
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
		self.jira.apiCall("/rest/api/2/search","POST",data);
		
	}
	getConfluence(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			self.popCallback();
		});
		self.confluence.apiCall("/rest/api/content/38076419");
		
	}
	getAllIssues(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			self.popCallback();
		});
//		self.apiCall("/plugins/servlet/applinks/proxy?appId=d1015b5f-d448-3745-a3d3-3dff12863286&path=https://rcgcoder.atlassian.net/rest/api/2/search");
		self.jira.apiCall("/rest/api/2/search?expand=changelog");
		//expand=changelog&jql=updateddate>'2018/03/01'
	}
}