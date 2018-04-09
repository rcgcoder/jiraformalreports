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

		self.addStep("Getting All Epics.... ",function(){
			var jira=self.getJira();
			jira.getAllEpics();
		});
		
		self.addStep("Getting All Labels.... ",function(){
			var jira=self.getJira();
			jira.getAllLabels()
		});
		self.addStep("Getting All Filters.... ",function(){
			var jira=self.getJira();
			jira.getAllFilters();
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
		
		self.addStep("Import nearley grammar.... ",function(){
			this.loadRemoteFile("js/grammar/grammar.js");
		});

		
		self.continueTask();
	}
	getListIssueTypes(){
		var self=this;
        var jira=self.getJira();
        var arrIssueTypes=[];
        for (var i=0;i<jira.issueTypes.length;i++){
            var it=jira.issueTypes[i];
            arrIssueTypes.push({key:it.key,name:it.name});
        }
        return arrIssueTypes;
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
	getListEpics(){
		var self=this;
        var jira=self.getJira();
        var arrEpics=[];
        for (var i=0;i<jira.epics.length;i++){
            var epic=jira.epics[i];
            arrEpics.push({key:epic.key,name:epic.key,description:epic.fields.summary});
        }
        return arrEpics; 
	}
	getListFilters(){
		var self=this;
        var jira=self.getJira();
        var arrFilters=[];
        for (var i=0;i<jira.filters.length;i++){
            var filter=jira.filters[i];
            arrFilters.push({key:filter.id,name:filter.name});
        }
        return arrFilters; 
	}
	getListLabels(){
		var self=this;
        var jira=self.getJira();
        var arrLabels=[];
        for (var i=0;i<jira.labels.length;i++){
            var lbl=jira.labels[i];
            arrLabels.push({key:lbl,name:lbl});
        }
        return arrLabels;
	}
	run(){
		log("starting ZipWebApp");
		var self=this;
		self.addStep("Initializing engines.... ",self.initialize);
		self.addStep("Populating components.... ",function(){
            System.getAngularObject('advSelector[name="selProjects"]').fillOptions(self.getListProjects());
            System.getAngularObject('advSelector[name="selTypes"]').fillOptions(self.getListIssueTypes());
            System.getAngularObject('advSelector[name="selLabels"]').fillOptions(self.getListLabels());
            System.getAngularObject('advSelector[name="selEpics"]').fillOptions(self.getListEpics());
            System.getAngularObject('advSelector[name="selFilters"]').fillOptions(self.getListFilters());
			$("#appMain").css('visibility','visible');
			self.continueTask();
		});
		
		self.continueTask();
	}

}
