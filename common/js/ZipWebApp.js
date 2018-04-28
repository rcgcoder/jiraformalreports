class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
		self.atlassian="";
		self.systemjs="";
		self.initializationBarrier;
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
	initializing(obj){
		var self=this;
		self.waitForInitializing.push(obj);
	}
	initialize(){
		var self=this;
		log("Initializing engines of ZipWebApp");
		self.addStep("Loading SystemJS engine and Atlassian REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/rcglibs/systemjs/RCGSystemJSManager.js",
							"js/rcglibs/atlassian/RCGAtlassian.js",
							"js/rcglibs/atlassian/RCGConfluence.js",
							"js/rcglibs/atlassian/RCGJira.js",
							"js/rcglibs/RCGBaseUtils.js",
							"js/rcglibs/RCGLogUtils.js",
							"js/rcglibs/RCGHashMapUtils.js"
						 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		self.addStep("Setting <initialized=false> Atlassian Engine.... ",function(){
			var atl=self.getAtlassian();
			atl.initialized=false;
			
			var hsTest=newHashMap();
			for (var i=0;i<1000;i++){
				var sKey="key"+i;
				hsTest.add(sKey,{key:sKey,value:"value for "+sKey});
			}
			hsTest.swing();
			self.continueTask();
		});  
		self.addStep("launching de engines and get atlassian base information.... "
					,function(){

			self.addStep("Launching Systemjs.... ",function(){
				var sjs=self.getSystemjs();
				sjs.loadEngine();
			},0,1,undefined,undefined,undefined,"INNER",undefined
			);
/*
			self.addStep("Getting All Issues.... ",function(){
				var jira=self.getJira();
				jira.getAllIssues();
			},0,1,undefined,undefined,undefined,"GLOBAL",undefined
			);  
*/
			self.addStep("Getting All Project, issuetypes and field info.... ",function(){
				var jira=self.getJira();
				jira.getProjectsAndMetaInfo();
			});
	
			self.addStep("Getting All Epics  to do a list.... ",function(){
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
			self.continueTask();
		});
		self.addStep("Setting <initized> Atlassian Engine.... ",function(){
			var atl=self.getAtlassian();
			atl.initialized=true;
			self.continueTask();
		});  
		
		self.addStep("Import nearley grammar.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
				"js/libs/grammar/lexer.js",
				"js/libs/grammar/nearley.js",
				"js/libs/grammar/grammar.js"
			 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		
		self.continueTask();
	}
	getListIssueTypes(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
	        var arrIssueTypes=[];
	        for (var i=0;i<jira.issueTypes.length;i++){
	            var it=jira.issueTypes[i];
	            arrIssueTypes.push({key:it.key,name:it.name});
	        }
	        return arrIssueTypes;
		}
	}
	getListProjects(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
	        var arrProjects=[];
	        for (var i=0;i<jira.projects.length;i++){
	            var prj=jira.projects[i];
	            arrProjects.push({key:prj.key,name:prj.name});
	        }
	        return arrProjects;
		}
	}
	getListEpics(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
	        var arrEpics=[];
	        for (var i=0;i<jira.epics.length;i++){
	            var epic=jira.epics[i];
	            arrEpics.push({key:epic.key,name:epic.fields.summary,description:epic.fields.summary});
	        }
	        return arrEpics; 
		}
	}
	getListFilters(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
	        var arrFilters=[];
	        for (var i=0;i<jira.filters.length;i++){
	            var filter=jira.filters[i];
	            arrFilters.push({key:filter.id,name:filter.name});
	        }
	        return arrFilters; 
		}
	}
	getListLabels(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
	        var arrLabels=[];
	        for (var i=0;i<jira.labels.length;i++){
	            var lbl=jira.labels[i];
	            arrLabels.push({key:lbl,name:lbl});
	        }
	        return arrLabels;
		}
	}
	getListFields(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
	        var arrFields=[];
	        for (var i=0;i<jira.fields.length;i++){
	            var fld=jira.fields[i];
	            arrFields.push({key:fld.key,name:fld.name});
	        }
	        return arrFields;
		}
	}
	getListRelations(){
        var arrValues=[
            "es implementado por"
            ,"causa"
            ,"está causada por"
            ,"depende de"
            ,"bloquea a"
            ,"detecta"
            ,"es detectado en"
            ,"duplica"
            ,"está duplicado por"
            ,"especifica"
            ,"es especificado en"
            ,"FF-depends on"
            ,"is FF-depended by"
            ,"FS-depends on"
            ,"is FS-depended by"
            ,"implementa"
            ,"tiene relación con"
            ,"est&aacute; relacionado con"
            ,"SF-depends on"
            ,"is SF-depended by"
            ,"SS-depends on"
            ,"is SS-depended by"
            ,"se divide en"
            ,"es subrequisito de"
            ,"valida"
            ,"es validado por"
            ];
		var arrResult=[];
		for (var i=0;i<arrValues.length;i++){
			var vAux=arrValues[i];
			arrResult.push({key:vAux,name:vAux});
		}
	return arrResult;
	}
	getJQLIssues(jql){
		var self=this;
        var jira=self.getJira();
    	jira.getJQLIssues(jql); // it does a popcallback at the end of process....
	}

	
	run(){
		log("starting ZipWebApp");
		var self=this;
		self.initializationBarrier=new RCGBarrier(self.createManagedCallback(function(){
			$("#appMain").css('visibility','visible');
			self.continueTask();
		}));
		self.initializationBarrier.add(self.getRunningTask());
		self.addStep("Initializing engines.... ",self.initialize);
		self.addStep("Default Config.... ",function(){
/*            System.getAngularObject('advSelector[name="selProjects"]').fillOptions(self.getListProjects());
            System.getAngularObject('advSelector[name="selTypes"]').fillOptions(self.getListIssueTypes());
            System.getAngularObject('advSelector[name="selLabels"]').fillOptions(self.getListLabels());
            System.getAngularObject('advSelector[name="selEpics"]').fillOptions(self.getListEpics());
            System.getAngularObject('advSelector[name="selFilters"]').fillOptions(self.getListFilters());
            System.getAngularObject('advSelector[name="selFields"]').fillOptions(self.getListFields());
//            System.getAngularObject('select[name="tabStructure"]').fillBillingFields(self.getListFields());
            var objTestJQL=System.getAngularObject('jqlextendedparser[name="testJQL"]');
            objTestJQL.fillFields(self.getListFields());
*/
/*            System.getAngularObject('advSelector[name="selProjects"]').testNearley();
*/		
			self.initializationBarrier.reach(self.getRunningTask());
		});
		
		self.continueTask();
	}

}
