class RCGJira{
	constructor(atlassian){
		var self=this;
		self.manager=atlassian;
		self.subPath="";
		self.tokenAccess="";
		self.tokenTime=0;
		self.withCache=false;
		self.issuesCache=newHashMap();
		self.jqlCache=newHashMap();
		taskManager.extendObject(self);
		self.renderContent=function(sContent){
			atlassian.renderContent(self,sContent);
			};
		self.oauthConnect=function(){
			atlassian.oauthConnect(self);
			};
		self.apiCall=function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders,callSecurity,aditionalOptions){
			atlassian.apiCallApp(self, sTarget, callType, data, sPage,undefined, sResponseType,callback,arrHeaders,callSecurity,aditionalOptions);
			};
		self.getFullList=function(sTarget,resultName,callType,data,callback,arrHeaders){
			atlassian.apiGetFullList(self, sTarget, resultName,callType, data, callback,arrHeaders);
			};

		self.projects=newDynamicObjectFactory([],["InnerId"],[],"Projects");
		self.fields=newDynamicObjectFactory([],["Type"],[],"Fields");
		self.issueTypes=newDynamicObjectFactory([],["Description","SubTask","IconUrl"],[],"IssueTypes");

		self.epics=newDynamicObjectFactory([],[],[],"Epics");
		self.labels=newDynamicObjectFactory([],[],[],"Labels");
		self.users=[];
		self.filters=[];
		self.issueLinkTypes=[];
		self.issueOtherFields=[];
	}
	getFields(){
		log("Getting fields");
		return this.fields;
	}
	processJsonField(itm){
		// interest info
		// 		key
		//		name
		//		schema.type
		var self=this;
		var doItem;
		var doFactory=self.fields;
		if (!doFactory.exists(itm.key)){
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setType(itm.schema.type);
		}
	}
	processJsonProject(itm){
		// interest info
		// 		key
		//		name
		//		id --> InnerId
		
		var self=this;
		var doItem;
		var doFactory=self.projects;
		if (!doFactory.exists(itm.key)){
			doItem=doFactory.new(itm.name,itm.key);
			doItem.setInnerId(itm.id);
		}
	}
	processJsonIssueType(itm){
		// interest info
		// 		id --> key
		//		name
		//		description --> Description
		//		iconUrl		--> IconUrl
		//		subtask		--> SubTask
		
		var self=this;
		var doItem;
		var doFactory=self.issueTypes;
		if (!doFactory.exists(itm.id)){
			doItem=doFactory.new(itm.name,itm.id);
			doItem.setDescription(itm.description);
			doItem.setIconUrl(itm.iconUrl);
			doItem.setSubTask(itm.subtask);
		}
	}
	processArrayIssues(arrIssues,fncProcessIssue,fncEndCallback,fncCustomBlockCallback){
		var self=this;
		var auxCbProcessIssue=function(issueIndex){
			if ((issueIndex<0)||(issueIndex>=arrIssues.length)) return true;
			var issue=arrIssues[issueIndex];
			return fncProcessIssue(issue,issueIndex,arrIssues.length);
		}

		var fncItem=self.createManagedCallback(auxCbProcessIssue);
		var fncEnd=self.createManagedCallback(fncEndCallback);
		var fncBlock;
		if (isDefined(fncCustomBlockCallback)){
			fncBlock=self.createManagedCallback(fncCustomBlockCallback);
		} else {
			fncBlock=self.createManagedCallback(function(){
				log("A block");
			});
		}
		//from 0 to end.....
		processOffline(0,undefined,fncItem,"issues",fncEnd,fncBlock);
	}
	getIssueLinkFullList(scopeJQL){
		var self=this;
		var hsTypes=newHashMap();
		var issueLink;
		var type;
		var inward;
		var outward;
		var fncProcessIssue=function(issue){
			for (var j=0;j<issue.fields.issuelinks.length;j++){
				issueLink=issue.fields.issuelinks[j];
				type=issueLink.type;
				inward=type.inward;
				outward=type.outward;
				if (!hsTypes.exists(inward)){
					hsTypes.add(inward,inward);
				}
				if (!hsTypes.exists(outward)){
					hsTypes.add(outward,outward);
				}
			}
		};
		self.processJQLIssues(scopeJQL,fncProcessIssue,hsTypes);
	}
	getFieldFullList(scopeJQL){
		var self=this;
		var hsFields=newHashMap();
		var hsTypes=newHashMap();
		var issType;
		var fncProcessIssue=function(issue){
			issType=issue.fields.issuetype.name;
			if (!hsTypes.exists(issType)){
				hsTypes.add(issType,issue.fields.issuetype);
				var arrProperties=getAllProperties(issue.fields);
				for (var j=0;j<arrProperties.length;j++){
					var vPropName=arrProperties[j];
					if (!hsFields.exists(vPropName)){
						var vPropType=typeof issue[vPropName];
						hsFields.add(vPropName,{name:vPropName,type:vPropType});
					}
				}
				hsFields.swing();
				hsTypes.swing();
			}
		}
		self.processJQLIssues(scopeJQL,fncProcessIssue,hsFields);
	}
	getProjectsAndMetaInfo(){
		var self=this;
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			//log("getAllProjects:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				for (var i=0;i<response.projects.length;i++){
					var project=response.projects[i];
					self.processJsonProject(project);
					for (var j=0;j<project.issuetypes.length;j++){
						var issuetype=project.issuetypes[j];
						self.processJsonIssueType(issuetype);
					}
				}
			}
			self.popCallback([self.projects]);
		});
		self.apiCall("/rest/api/latest/issue/createmeta?expand=projects.issuetypes.fields");
	}
	getFieldsAndSchema(){
		var self=this;
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			//log("getAllProjects:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				var arrProperties=Object.getOwnPropertyNames(
									response.names.__proto__
									).concat(Object.getOwnPropertyNames(
									response.names
									));
				for (var k=0;k<arrProperties.length;k++){
					var vFieldId=arrProperties[k];
					if ((vFieldId!=="__proto__")&&(vFieldId!=="constructor")){
						var sDesc=response.names[vFieldId];
						if (typeof response.schema[vFieldId]!=="undefined"){
							var sType=response.schema[vFieldId].type;
							if (typeof sType!=="undefined"){
								var objField={name:sDesc,key:vFieldId,schema:response.schema[vFieldId]};
								self.processJsonField(objField);
							}
						} 
					}
				}
			}
			self.popCallback([self.projects]);
		});
		self.apiCall("/rest/api/2/search?jql=&expand=names,schema");
	}
	getIssueLinkTypes(){
		var self=this;
		return self.issueLinkTypes;		
	}
	setIssueLinkTypes(issueLinkTypes){
		var self=this;
		self.issueLinkTypes=issueLinkTypes;		
	}
	setIssueOtherFields(issueOtherTypes){
		var self=this; 
		self.issueOtherFields=issueOtherTypes;		
		
	}
	getIssueOtherFields(){
		return this.issueOtherFields;
	}
	
	getAllIssueLinkTypes(){
		
	}
	getUser(){
		return this.manager.userId;
	}
	getUsers(){
		var self=this;
		var arrResult=[];
		if (self.users!=""){
			self.users.forEach(function(user){
				arrResult.push({key:user.key,name:user.displayName});
			});
		}
		arrResult.sort(function(a,b){
			if (a.name<b.name) return -1;
			if (a.name>b.name) return 1;
			return 0;
			
		});
		return arrResult;
	}
	getAllUsers(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("getAllUsers:"+response);
			if (response!=""){
				self.users=JSON.parse(response);
			}
			self.popCallback();
		});
		self.apiCall(   "/rest/api/2/user/search?startAt=0&maxResults=1000&username=_");
	}

	
	getAllProjects(){
		var self=this;
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("getAllProjects:"+response);
			self.popCallback();
		});
		self.apiCall("/rest/api/2/project?expand=issueTypes");
	}
	getAllLabels(){
		var self=this;
		var doItem;
		var doFactory=self.labels;
		var fncProcessIssue=function(issue){
			for (var j=0;j<issue.fields.labels.length;j++){
				var issLbl=issue.fields.labels[j];
				if (!doFactory.exists(issLbl)){
					doItem=doFactory.new(issLbl,issLbl);
				}
			}
		}
		self.processJQLIssues("labels is not empty",fncProcessIssue,doFactory);
	}
	getAllEpics(){
		var self=this;
		var doItem;
		var doFactory=self.epics; 
		var fncProcessIssue=function(itm){
			if (!doFactory.exists(itm.key)){
				doItem=doFactory.new(itm.fields.summary,itm.key);
			}
		}
		self.processJQLIssues("issueType=epic",fncProcessIssue,doFactory);
	}
	getAllFilters(){
		var self=this;
		self.pushCallback(function(sResponse,xhr,sUrl,headers){
			log("getAllFilters:"+response);
			if (sResponse!=""){
				var response=JSON.parse(sResponse);
				self.filters=response;
			}
			self.popCallback([self.filters]);
		});
		self.apiCall("/rest/api/2/filter");//,"GET",data);
	}
	getAllIssues(cbBlock){
		var self=this;
		self.addStep("Getting All Issues", function(){
			self.getFullList("/rest/api/2/search?expand=changelog","issues",undefined,undefined,cbBlock);
		});
		self.addStep("Processing all Issues", function(response,xhr,sUrl,headers){
			self.popCallback([response]);
		});
		self.continueTask();
//		self.apiCall("/plugins/servlet/applinks/proxy?appId=d1015b5f-d448-3745-a3d3-3dff12863286&path=https://rcgcoder.atlassian.net/rest/api/2/search");
		//expand=changelog&jql=updateddate>'2018/03/01'
	}
	getFromCache(sCacheKey){
		if (self.withCache){
			if (self.jqlCache.exists(sCacheKey)){
				return self.jqlCache.getValue(sCacheKey);
			}
		}
		return "";
	}
	addToCache(sCacheKey,value){
		if (self.withCache){
			if (!self.jqlCache.exists(sCacheKey)){
				return self.jqlCache.add(sCacheKey,value);
			}
		}
	}
	getComments(arrIssues,cbBlock,postJQL){
		var self=this;
		var sJQL="";
		arrIssues.forEach(function(issueKey){
			sJQL+=((sJQL!=""?",":"")+issueKey);
		});
		sJQL="issue in ("+sJQL+")";
		if (isDefined(postJQL))sJQL+=" "+postJQL;
		var sCacheKey="Comments_"+sJQL;
		var vCache=self.getFromCache(sCacheKey);
		if (vCache!="") return self.continueTask([vCache]);

		self.addStep("Getting All Issues from JQL:["+sJQL+"]", function(){
			self.getFullList("/rest/api/2/search?fields=comment&expand=renderedFields&jql="+sJQL,"issues",undefined,undefined,cbBlock);
		});
		self.addStep("Returning all Issues from JQL:["+sJQL+"]", function(response,xhr,sUrl,headers){
			self.addToCache(sCacheKey,response);
			self.continueTask([response]);
		});
		self.continueTask();
	}
	getJQLIssues(jql,cbBlock){
		var self=this;
		var sCacheKey="issues_"+jql;
		var vCache=self.getFromCache(sCacheKey);
		if (vCache!="") return self.continueTask([vCache]);
		self.addStep("Getting All Issues from JQL", function(){
			self.getFullList("/rest/api/2/search?jql="+jql+"&expand=renderedFields,changelog","issues",undefined,undefined,cbBlock);
		});
		self.addStep("Returning all Issues from JQL", function(response,xhr,sUrl,headers){
			self.addToCache(sCacheKey,response);
			self.continueTask([response]);
		});
		self.continueTask();
	}
	processJQLIssues(jql,fncProcessIssue,returnVariable,cbEndProcess,cbDownloadBlock,cbProcessBlock){
		var self=this;
		var jqlAux="";
		if (isDefined(jql)){
			jqlAux=jql;
		}
		var auxCbDownBlock=function(blkIssues){
			var bExists=isDefined(cbDownloadBlock);
			log("Callback Download Block exists:"+bExists +" number of issues:" +blkIssues.length);
			if (bExists){
				cbDownloadBlock(blkIssues);
			}
		};
		var auxCbProcessBlock=function(objStep){
			var bExists=isDefined(cbProcessBlock);
			log("Callback process Block exists:"+bExists);
			log("Block for jql ["+jqlAux+"] ->"+objStep.getTrace());
			if (bExists){
				cbProcessBlock(objStep);
			}
		};
		
		var fncProcessDownloadedBlock=function(jsonBlkIssues){
			var blkIssues=[];
			if (typeof jsonBlkIssues==="string"){
				var objJson=JSON.parse(jsonBlkIssues);
				blkIssues=objJson.issues;
			} else {
				blkIssues=jsonBlkIssues;
			}
			log("Process downloaded block of JQL ["+jqlAux+"]");
			var innerFork=self.addStep("Processing Issues block: "+blkIssues.length +" of JQL ["+jqlAux+"]",function(){
				var cbManaged=self.createManagedCallback(auxCbDownBlock);
				cbManaged(blkIssues);
				var fncEndBlock=function(){
					log("End block of JQL ["+jqlAux+"]");
					self.continueTask();
				};
				log("Process Array Issues of block of JQL ["+jqlAux+"] ..."+blkIssues.length);
				self.processArrayIssues(blkIssues
										,fncProcessIssue
										,fncEndBlock
										,auxCbProcessBlock);
				
			},0,1,undefined,undefined,undefined,"INNER",undefined
	//		}
			);
			log("Step Process downloaded block of JQL ["+jqlAux+"] added to "+self.getRunningTask().forkId);
			innerFork.callMethod(); 
			log("Running InnerFork "+innerFork.forkId+ "of JQL ["+jqlAux+"]");
		};

		self.addStep("Fetching And Process Issues"+" of JQL ["+jqlAux+"]",function(){
			self.addStep("Fetching Issues"+" of JQL ["+jqlAux+"]",function(){
				self.getJQLIssues(jqlAux,self.createManagedCallback(fncProcessDownloadedBlock));
			});
			self.continueTask();
		});
		self.addStep("Returning Variable"+" of JQL ["+jqlAux+"]",function(){
			var fncEnd;
			if (isDefined(cbEndProcess)){
				fncEnd=cbEndProcess;
			} else {
				fncEnd=function(vReturn){
					if (isDefined(vReturn)){
						self.continueTask([vReturn]);
					} else {
						self.continueTask();
					}
				};
			}
			fncEnd(returnVariable);
		});
		self.continueTask();
	}
	getIssueDetails(issueId){
		var self=this;
		self.pushCallback(function(objResponse,xhr, statusText, errorThrown){
			log("Issue Detail for issue:"+issueId);
			self.continueTask([JSON.parse(objResponse)]);
		});
		self.apiCall(   "/rest/api/2/issue/"+issueId,
						"GET",
						undefined,
						undefined,
						"application/json");
	}
	setProperty(issueId,propertyName,propertyValue){
		var self=this;
		self.pushCallback(function(objResponse,xhr, statusText, errorThrown){
			log("Property:"+propertyName+" = "+propertyValue+" setted in issue:"+issueId);
			self.continueTask();
		});
		self.apiCall(   "/rest/api/2/issue/"+issueId+"/properties/"+propertyName,
						"PUT",
						propertyValue,
						undefined,
						"application/json");
	}
	
	getProperty(issueId,propertyName){
		var self=this;
		self.pushCallback(function(sResponse,xhr, statusText, errorThrown){
			log("Property:"+propertyName+" = "+sResponse+" getted for issue:"+issueId);
			if (sResponse!=""){
				self.continueTask([JSON.parse(sResponse)]);
			} else {
				self.continueTask([sResponse,xhr, statusText, errorThrown]);
			}
		});
		self.apiCall(   "/rest/api/2/issue/"+issueId+"/properties/"+propertyName,
						"GET",
						undefined,
						undefined,
						"application/json");
	}
	
	addComment(issueId,theComment){
		var self=this;
		self.pushCallback(function(objResponse,xhr, statusText, errorThrown){
			log("Comment:"+theComment+" setted in issue:"+issueId);
			self.continueTask();
		});
		
		self.apiCall("/rest/api/2/issue/"+issueId+"/comment",
					"POST",
					{"body":theComment},
					undefined,
					"application/json");
	}
	addAttachmentObject(issueId,jsObject,sFileName,sComment){
		var self=this;
        var theBlob = new Blob([JSON.stringify(jsObject)], { 
            type: 'text/plain'
        });
        var auxComment=sComment;
        if (isUndefined(sComment)){
        	auxComment="Attached file:"+sFileName;
        }
        var fileOfBlob = new File([theBlob], sFileName);
        var data={comment: auxComment, file: fileOfBlob  };
        var aditionalOptions={
        		data:data,
        		contentType: 'multipart/form-data'
        }
//		self.apiCall=function(sTarget,callType,data,sPage,sResponseType,callback,arrHeaders,useProxy,aditionalOptions){
		self.apiCall("/rest/api/2/issue/"+issueId+"/attachments",
				"POST",
				data,
				undefined,
				'multipart/form-data',
				undefined,
				undefined,
				undefined,
				aditionalOptions
				);
	}
	getAttachments(issueId,fileFilterFunction,contentFilterFunction,contentProcessFunction){
		var self=this;
		var reportIssue;
		var arrFiles=[];
        self.addStep("Processing jql to get report issue detail:"+issueId,function(){
            self.getIssueDetails(issueId);
        });
        self.addStep("setting issue detail:"+issueId,function(issueDetail){
            reportIssue=issueDetail;
            self.continueTask();
        });
        self.addStep("Authorization Call",function(issueDetail){
        	self.oauthConnect();
        });
        self.addStep("Getting all the attachments of the report issue:"+issueId,function(){
            log("Adding... process attachment steps");
            var inspectAttachment=self.createManagedCallback(function(contentUrl){
                log("Adding steps for inspect:"+contentUrl);
                self.addStep("Getting Content as Inner Fork:"+contentUrl,function(){
	                self.addStep("Getting Content of Attachment:"+contentUrl,function(){
	                   self.apiCall(contentUrl,"GET",undefined,undefined,
	                                   "application/json",undefined,undefined,{token:true});
	                });
	                self.addStep("Evaluating the loaded content for :"+contentUrl,function(response){
	                   log(response.substring(0,50));
	                   var bAddAttachment=true;
	                   if (isDefined(contentFilterFunction)){
	                	   bAddAttachment=contentFilterFunction(response);
	                   }
	                   if (bAddAttachment){
	                	   var vResult=response;
	                	   if (isDefined(contentProcessFunction)){
	                		   vResult=contentProcessFunction(vResult);
	                	   }
	                	   arrFiles.push(vResult);
	                   }
	                   self.continueTask();
	                });
	                self.continueTask();
    			},0,1,undefined,undefined,undefined,"INNER",undefined
                //}
                );
                
            });
            reportIssue.fields.attachment.forEach(function(elem){
                log(elem.content+" --> mimeType:"+elem.mimeType);
                var bDoInspect=true;
                if (isDefined(fileFilterFunction)){
                	bDoInspect=fileFilterFunction(elem);
                }
                if (bDoInspect){
                    var contentUrl=elem.content;
                    var arrElem=contentUrl.split("secure");
                    var relativeUrl="/secure"+arrElem[1];
                    inspectAttachment(relativeUrl);
                }
            });
            self.continueTask();
        });
        self.addStep("Returning selected attachments",function(){
        	self.continueTask([{issue:reportIssue,attachments:arrFiles}]);
        });
        self.continueTask();
	}

}
