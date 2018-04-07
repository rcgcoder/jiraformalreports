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
		return this.getAtlassian().getJira();
	}
	getConfluence(){
		return this.getAtlassian().getConfluence();
	}
	getSystemjs(){
		var self=this;
		if (self.systemjs==""){
			self.systemjs=new RCGSystemJSManager(self);
		}
		return self.systemjs;
	}
	initialize(){
		var self=this;
		log("Initializing engines of ZipWebApp");
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

		
/*		
		self.addStep("Getting All Issues.... ",function(){
			var jira=self.getJira();
			jira.getAllIssues();
		});
*/
		self.addStep("Getting All Project, issuetypes and field info.... ",function(){
			var jira=self.getJira();
			jira.getProjectsAndMetaInfo();
		});
		/*
		self.addStep("Getting All Epics.... ",function(){
			var jira=self.getJira();
			jira.getAllEpics();
		});
		*/
		self.addStep("Testing Confluence Api Integrations.... ",function(){
			var cfc=self.getConfluence();
			cfc.getAllPages();
		});
		
		self.continueTask();
	}
	getListProjects(){
		var self=this;
        var jira=self.getJira();
        var arrProjects=[];
        for (var i=0;i<jira.projects.length;i++){
            var prj=jira.projects[i];
            arrProjects.push({key:prj.key,name:prj.name});
        }
        return arrProjects;
	}
	run(){
		log("starting ZipWebApp");
		var self=this;
		self.addStep("Initializing engines.... ",self.initialize);
		self.addStep("Populating components.... ",function(){
			$("#appMain").css('visibility','visible');
			self.continueTask();
		});
		
		self.continueTask();
	}

}
