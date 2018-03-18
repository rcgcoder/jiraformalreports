class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
		self.jira="";
		self.systemjs="";
	}
	getJira(){
		var self=this;
		if (self.jira==""){
			self.jira=new RCGJira(self);
			self.jira.proxyPath=self.proxyPath;
			self.jira.instance=self.urlBase;
		}
		return self.jira;
	}
	getSystemjs(){
		var self=this;
		if (self.systemjs==""){
			self.systemjs=new RCGSystemJSManager(self);
		}
		return self.systemjs;
	}
	run(){
		log("starting ZipWebApp");
		var self=this;
		//creating a global function composeurl to be used in the TS files

		self.addStep("Loading SystemJS engine and Jira REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/rcglibs/systemjs/RCGSystemJSManager.js",
							"js/rcglibs/Jira/RCGJira.js"
						 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		self.addStep("Launching Systemjs.... ",function(){
			var sjs=self.getSystemjs();
			sjs.loadEngine();
		},0,1,undefined,undefined,undefined,"INNER",undefined
		);
		
/*		self.addStep("Getting Confluence Oauth Token", function(){
			var jira=self.getJira();
			jira.proxyPath=self.proxyPath;
			jira.instance=self.urlBase;
			jira.oauthConfluenceConnect();
		});
*/		
		self.addStep("Getting All Issues.... ",function(){
			var jira=self.getJira();
			jira.getAllIssues();
		});

		self.addStep("Getting All Projects.... ",function(){
			var jira=self.getJira();
			jira.getAllProjects();
		});
		self.addStep("Testing Api Integrations.... ",function(){
			var jira=self.getJira();
			jira.getConfluence();
		});
		
		self.continueTask();
	}

}
