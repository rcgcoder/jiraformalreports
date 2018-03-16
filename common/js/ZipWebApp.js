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
		self.addStep("Download Image...",function(){
			log("Requesting Image");
			self.loadRemoteFile("img/reports2.jpg");
		});
		self.addStep("changing image...",function(sPath,content){
			log("Image Loaded:"+sPath);
			var image=document.getElementById("jrfSplash");
			image.src = content;
			log("Image changed");
//			$('body').attr('ng-app', 'mySuperAwesomeApp');
			$("#"+self.htmlContainerId).html("<heros></heros>");
			self.popCallback(); // finishing the process.
		});
		
		self.addStep("Loading angularjs and typescript inline compiler and Jira REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/angular/angScript.ts",
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
/*		self.addStep("Getting All Issues.... ",function(){
			var jira=self.getJira();
			jira.getAllIssues();
		});
*/		self.addStep("Getting All Projects.... ",function(){
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
