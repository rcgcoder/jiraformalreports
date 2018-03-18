class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
		self.jira="";
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
	run(){
		log("starting ZipWebApp");
		var self=this;
		//creating a global function composeurl to be used in the TS files
		self.addStep("Loading Systemjs...",function(){
			$("#"+self.htmlContainerId).html(
				`<my-app>
				    loading...
				  </my-app>
				`);
			var arrFiles=[
				"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
		        "https://unpkg.com/zone.js/dist/zone.js",
		        "https://unpkg.com/zone.js/dist/long-stack-trace-zone.js",
		        "https://unpkg.com/reflect-metadata@0.1.3/Reflect.js",
		        "https://unpkg.com/systemjs@0.19.31/dist/system.js",
		        "systemjs/config.js"
			 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		self.addStep("Launching systemjs based interface.... it takes a while",function(){
			System.composeUrl=function(sRelativePath){
				var newUrl=self.composeUrl(sRelativePath);
				return newUrl;
			};
			System.bootStrapFinish=self.createManagedCallback(
					function(){
						log("Bootstrap is finished");
						self.popCallback();
					});
		    System.import('app')
		      .catch(console.error.bind(console));
		});

		self.addStep("Loading Jira REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/rcglibs/Jira/RCGJira.js"
						 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		
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
*/
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
