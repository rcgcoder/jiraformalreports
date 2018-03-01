class RCGJira{
	constructor(app){
		var self=this;
		self.repository="https://paega2.atlassian.net";
		self.JiraAPConnection=AP;
		self.app=app;
		self.headerAuth="";
		self.ghStateString="_ungues";
		taskManager.extendObject(self);
	}
	loadError(oError){
	    throw new URIError("The URL " + oError.target.src + " is not accessible.");
	}
	apiCall(sTargetUrl,sPage,sType,callback,arrHeaders){
		var self=this;
		
		// A simple POST request which logs response in the console.
		self.JiraAPConnection.request({
		  url: '/jira/rest/auth/1/session',
		  type: 'POST',
		  authorization:'Basic rcgcoder:jiraRitxar1676',
		  data: {username: 'rcgcoder', description: 'jiraRitxar1676'},
		  success: function(responseText){
		    console.log(responseText);
		  },
		  error: function(xhr, statusText, errorThrown){
		    console.log(arguments);
		  }
		});		
	}
	getAllIssues(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			
		});
		self.apiCall(self.repository+"/rest/api/2/search");
	}
}