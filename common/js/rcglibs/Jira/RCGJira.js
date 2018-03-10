class RCGJira{
	constructor(app){
		var self=this;
		self.proxyPath="";
		self.instance="";
		self.JiraAPConnection=AP;
		self.app=app;
		self.headerAuth="";
		self.ghStateString="_ungues";
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
			self.pushCallback(function(response,xhr,sUrl,headers) {
				if  ((response==null)||
					(typeof response==="undefined")||
					(response.isToken==false)){
					setTimeout(checkIfToken,1000);
				} else {
					log("Oauth Access token:"+response.access);
					self.popCallback(response.access,response.secret);
				}
			});
			self.apiCallOauth("/sessionToken");
		});
		function openInNewTab(url) {
			  win = window.open(url, '_blank');
			  if (win){
				  win.focus();
				  win.onclose=function(){
					  alert("Closed");
				  }
			  }
			  return win;
			}
		win=openInNewTab(response.url);
		log("Tab Opened");
		var content=win.content;
		log(content);
		setTimeout(checkIfToken,1000);
	}
	
	oauthConfluenceConnect(){
		var self=this;
		self.pushCallback(function(accessToken,secret){
			log("Setting Access Token:"+accessToken+" and Secret:"+secret);
			self.confluenceOauthAccess=response.access;
			self.confluenceOauthSecret=response.secret;
			self.popCallback();
		});
		self.pushCallback(self.apiOauthSecondStep);
		self.apiCallOauth("/sessions/connect?jiraInstance="+self.instance+"/wiki"+
								"&callbackServer="+self.proxyPath);
	}
	oauthJiraConnect(){
		var self=this;
		self.pushCallback(function(accessToken,secret){
			self.JiraOauthAccess=response.access;
			self.JiraOauthSecret=response.secret;
			self.popCallback();
		});
		self.pushCallback(self.apiOauthSecondStep);
		self.apiCallOauth("/sessions/connect?jiraInstance="+self.instance+
								"&callbackServer="+self.proxyPath);
	}
	
	apiCallConfluence(sTargetUrl,data,sPage,sType,callback,arrHeaders){
		var self=this;
		self.apiCallGET("/wiki"+sTargetUrl+"?access_token=" + self.confluenceOauthAccess,sPage,sType,callback,arrHeaders);
	}
	
	apiCallPOST(sTargetUrl,data,sPage,sType,callback,arrHeaders){
		var self=this;
		log("Calling Jira Api POST:"+sTargetUrl);
		// A simple POST request which logs response in the console.
/*		self.JiraAPConnection.request('/rest/api/2/issue/PDP-12/changelog')
		  .then(data => alert(data.body))
		  .catch(e => alert(e.err));
*/		
		self.JiraAPConnection.request({
			  url: sTargetUrl,
			  type:'POST',
			  data:JSON.stringify(data),
			  contentType: 'application/json',
			  success: self.createManagedCallback(function(responseText){
			    self.popCallback([responseText,self.JiraAPConnection]);
			  }),
			  error: self.createManagedCallback(function(xhr, statusText, errorThrown){
			    self.popCallback(["",xhr, statusText, errorThrown]);
			  })
			});
	}
	apiCall(sTargetUrl,sPage,sType,callback,arrHeaders){
		this.apiCallGET(sTargetUrl,sPage,sType,callback,arrHeaders);
	}
	apiCallGET(sTargetUrl,sPage,sType,callback,arrHeaders){
		var self=this;
		log("Calling Jira Api GET:"+sTargetUrl);
		// A simple POST request which logs response in the console.
/*		self.JiraAPConnection.request('/rest/api/2/issue/PDP-12/changelog')
		  .then(data => alert(data.body))
		  .catch(e => alert(e.err));
*/		
		self.JiraAPConnection.request({
			  url: sTargetUrl,
			  success: self.createManagedCallback(function(responseText){
			    self.popCallback([responseText,self.JiraAPConnection]);
			  }),
			  error: self.createManagedCallback(function(xhr, statusText, errorThrown){
			    self.popCallback(["",xhr, statusText, errorThrown]);
			  })
			});
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
		self.apiCallPOST("/rest/api/2/search",data);
		
	}
	getConfluence(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			
		});
		self.apiCallConfluence("/rest/api/content/38076419");
		
	}
	getAllIssues(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			self.popCallback();
		});
//		self.apiCall("/plugins/servlet/applinks/proxy?appId=d1015b5f-d448-3745-a3d3-3dff12863286&path=https://rcgcoder.atlassian.net/rest/api/2/search");
		self.apiCall("/rest/api/2/search");
	}
}