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
	getAllIssues(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			
		});
		self.apiCall(self.repository+"/rest/api/2/search");
	}
}