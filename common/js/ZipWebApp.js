class ZipWebApp{
	constructor(){
		var self=this;
		self.atlassian="";
		self.systemjs="";
		self.initializationBarrier;
		self.model="";
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
		console.log("Waiting for initializing...");
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
							"js/libs/he.js",
							"js/libs/ace/src-noconflict/ace.js"
							
/*							"js/rcglibs/RCGLogUtils.js",
							"js/rcglibs/RCGChronoUtils.js",
							"js/rcglibs/RCGHashMapUtils.js"
*/						 ]; //test
			return self.loadRemoteFiles(arrFiles);
		});
/*		self.addStep("Launching Systemjs.... ",function(){
			var sjs=self.getSystemjs();
			return sjs.loadEngine();
		},0,1,undefined,undefined,undefined,"INNER",undefined
		//}
		);
*/		self.addStep("Setting <initialized=false> Atlassian Engine.... ",function(){
			var atl=self.getAtlassian();
			atl.initialized=false;
		});  
		self.addStep("launching the engines and get atlassian base information.... ",function(){
/*			self.addStep("Getting All Issues.... ",function(){
				var jira=self.getJira();
				jira.getAllIssues();
			},0,1,undefined,undefined,undefined,"GLOBAL",undefined
//			}
			);  */
			self.addStep("Getting All Epics  to do a list.... ",function(){
				var jira=self.getJira();
				return jira.getAllEpics();
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
			if (false) {
			self.addStep("Getting All Project and issuetypes .... ",function(){
				var jira=self.getJira();
				return jira.getProjectsAndMetaInfo();
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
			self.addStep("Getting All field info.... ",function(){
				var jira=self.getJira();
				return jira.getFieldsAndSchema();
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
	
			self.addStep("Getting All Users to do a list.... ",function(){
				var jira=self.getJira();
				return jira.getAllUsers();
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
			self.addStep("Getting All Labels.... ",function(){
				var jira=self.getJira();
				return jira.getAllLabels()
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
			self.addStep("Getting Current User Info.... ",function(){
				var atl=self.getJira().manager;
				return atl.getUser();
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);

			self.addStep("Getting All Filters.... ",function(){
				var jira=self.getJira();
				return jira.getAllFilters();
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
			/*
			self.addStep("Getting All Epics.... ",function(){
				var jira=self.getJira();
				jira.getAllEpics();
			});
			*/
			/*
			self.addStep("Testing Confluence Api Integrations.... ",function(){
				var cfc=self.getConfluence();
				//cfc.getAllPages();
				self.addStep("Manipulating Content",function(content){
					log(content);
					var jsonObj=JSON.parse(content);
					var sContent=jsonObj.body.storage.value;
					var sHtml=he.decode(sContent);
					self.model=sHtml;
					self.continueTask();
//					var theHtml=$(sHtml);
				});
//				cfc.getContent("38076419");
				cfc.getContent("388137744");
			},0,1,undefined,undefined,undefined,"INNER",undefined
//			}
			);
			*/
			}
			self.addStep("All initilizing parallel tasks launched",function(){
				log("All initilizing parallel tasks launched");
			});
		});
		self.addStep("Setting <initialized> Atlassian Engine.... ",function(){
			//debugger;
			log("Initialize ends");
			var atl=self.getAtlassian();
			atl.initialized=true;
		});  
/*		self.addStep("Loading Systemjs",function(){
			log("Isolated loading of systemjs");
			self.continueTask();
		});
*/
/*		self.addStep("Trying to render content... needs oauth connect",function(){
			var jira=self.getJira();
			self.addStep("Connecting OAUTH",function(){
				jira.oauthConnect();
			});
			self.addStep("RenderContent",function(){
				jira.renderContent("*test*");
			});
			self.continueTask();
		});
	*/	
		/*
		self.addStep("Import nearley grammar.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
				"js/libs/grammar/lexer.js",
				"js/libs/grammar/nearley.js",
				"js/libs/grammar/grammar.js"
			 ]; //test
			self.loadRemoteFiles(arrFiles);
		});*/		
	}

	getListIssueTypes(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
			var arrResult=jira.issueTypes.toArray([
				 {doFieldName:"Id",resultFieldName:"key"},
				 {doFieldName:"Name",resultFieldName:"name"},
				 {doFieldName:"Description",resultFieldName:"description"}
				 ]);
	        return arrResult;
		}
	}
	getListProjects(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
			var arrResult=jira.projects.toArray([
				 {doFieldName:"Id",resultFieldName:"key"},
				 {doFieldName:"Name",resultFieldName:"name"}
				 ]);
	        return arrResult;
		}
	}
	getListEpics(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
			var arrResult=jira.epics.toArray([
				 {doFieldName:"Id",resultFieldName:"key"},
				 {doFieldName:"Name",resultFieldName:"name"}
				 ]);
	        return arrResult;
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
			var arrResult=jira.issueTypes.toArray([
				 {doFieldName:"Id",resultFieldName:"key"},
				 {doFieldName:"Name",resultFieldName:"name"}
				 ]);
	        return arrResult;
		}
	}
	getListFields(){
		var self=this;
		if (self.getAtlassian().initialized==false){
			
		} else {
	        var jira=self.getJira();
			var arrResult=jira.fields.toArray([
				 {doFieldName:"Id",resultFieldName:"key"},
				 {doFieldName:"Name",resultFieldName:"name"}
				 ]);
	        return arrResult;
		}
	}
	getIssueLinkTypes(){
		var self=this;
        var jira=self.getJira();
        var arrLinkTypes=jira.getIssueLinkTypes(); 
        var arrResult=[];
        for (var i=0;i<arrLinkTypes.length;i++){
        	arrResult.push({key:arrLinkTypes[i],name:arrLinkTypes[i]});
        }
        return arrResult;
    }
	setIssueLinkTypes(newIssueLinkTypes){
		var self=this;
        var jira=self.getJira();
        jira.setIssueLinkTypes(newIssueLinkTypes); 
	}
	setIssueOtherFields(otherFieldNames){
		var self=this;
        var jira=self.getJira();
        jira.setIssueOtherFields(otherFieldNames); 
	}
	getIssueOtherFields(){
		var self=this;
        var jira=self.getJira();
        var arrFields=jira.getIssueOtherFields(); 
        var arrResult=[];
        for (var i=0;i<arrFields.length;i++){
        	arrResult.push({key:arrFields[i][0],name:arrFields[i][1]});
        }
        return arrResult;
    }
	getJQLIssues(jql){
		var self=this;
        var jira=self.getJira();
    	return jira.getJQLIssues(jql); // it does a popcallback at the end of process....
	}

	
	run(){
//		debugger;
		log("starting ZipWebApp");
		var self=this;
		self.initializationBarrier=new RCGBarrier(self.createManagedCallback(function(){
			debugger;
			log("Initialization finished");
			$("#appMain").css('visibility','visible');
		}));
//		self.initializationBarrier.add(self.getRunningTask());
		self.addStep("Initializing engines.... ",self.initialize,
					0,1,undefined,undefined,undefined,"GLOBAL_RUN",self.initializationBarrier);
		self.addStep("Waiting Initialization.... ",function(){
			log("Waiting to reach!.... not continues... it will continue when initialization barrier reachs all");
			return self.waitForEvent();
		});
		self.addStep("Default Config.... ",function(){
			log("Everything is initialized! now Config!");
			//debugger;
			self.addStep("Loading default config from Storage",function(){
				var tbConfig=System.getAngularObject('tabConfig',true);
				return tbConfig.loadDefaultReport();
			});
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
		});
	}

}
