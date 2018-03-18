class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
		self.atlassian="";
		self.systemjs="";
	}
	getAtlassian(){
		var self=this;
		if (self.atlassian==""){
			self.atlassian=new RCGAtlassian(self);
			self.atlassian.proxyPath=self.proxyPath;
			self.atlassian.instance=self.urlBase;
		}
		return self.atlassian;
	}
	getJira(){
		return this.getAtlassian.getJira();
	}
	getConfluence(){
		return this.getAtlassian.getConfluence();
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

		self.addStep("Loading SystemJS engine and Atlassian REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/rcglibs/systemjs/RCGSystemJSManager.js",
							"js/rcglibs/atlassian/RCGAtlassian.js",
							"js/rcglibs/atlassian/RCGConfluence.js",
							"js/rcglibs/atlassian/RCGJira.js"
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
/*		self.addStep("Getting All Issues.... ",function(){
			var jira=self.getJira();
			jira.getAllIssues();
		});
*/
		self.addStep("Getting All Projects.... ",function(){
			var jira=self.getJira();
			jira.getAllProjects();
		});
		self.addStep("Testing Confluence Api Integrations.... ",function(){
			var cfc=self.getConfluence();
			cfc.getAllPages();
		});
		
		self.continueTask();
	}

}
