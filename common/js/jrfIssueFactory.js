function newIssueFactory(report){
	var theReport=report;
	var hsFieldNames=newHashMap();
	//	self.allFieldNames;
	//hsFieldNames.clear();
	
	var allFieldDefinitions=[];
	theReport.config.useFields.forEach(function(element){
		allFieldDefinitions.push({name:element.key,description:element.name});
		hsFieldNames.add(element.name,element.key); // to do a reverse search
	});
	theReport.config.useOtherFields.forEach(function(element){
		allFieldDefinitions.push({name:element.key,description:element.name});
		hsFieldNames.add(element.name,element.key); // to do a reverse search
	});
	var dynObj=newDynamicObjectFactory(
			[{name:"Child",description:"SubIssues for Billing",type:"object"},
			 {name:"AdvanceChild",description:"SubIssues for advance calculation",type:"object"},
			 {name:"LinkType",description:"Relation Types",type:"object"},
			 {name:"LinkedIssueKey",description:"Keys of Issues Relationed With the issue",type:"string"},
			 {name:"Comment", description:"Comments in Issue",type:"object"},
			 {name:"AccumulatorsCache",description:"Cache the values of accumulator calls",type:"object"},
			 {name:"PrecomputedProperty",description:"List of properties with values of hidden childs computed by a user with permissions",type:"object"},
			 {name:"SavePrecomputedProperty",description:"List of precomputed properties that needs to be saved",type:"object"},
			 {name:"FieldLifeCache",description:"Cache the life of the fields to speed up the reutilization of values",type:"object"},
			 {name:"FieldLifeAdjust",description:"List of manual adjusts to field values usually saved as comment in the issue",type:"object"},
			 {name:"EpicChild",description:"List of issues with epic link equals to this issue key",type:"object"}
			]
			,
			allFieldDefinitions.concat(["JiraObject"])
			,
			[]
			,
			undefined);
	dynObj.hsExcludedProjects=newHashMap();	
	dynObj.addExcludedProject=function(prjKey){
		var self=this;
		if (!self.hsExcludedProjects.exists(prjKey)) {
			self.hsExcludedProjects.add(prjKey,prjKey);
		}
	}
	dynObj.isExcludedProject=function(prjKey){
		var self=this;
		return (self.hsExcludedProjects.exists(prjKey));
	}
	dynObj.isExcludedByFunction;
	dynObj.setExcludeFunction=function(fncExclusion){
		var fncFormula;
		if (isMethod(fncExclusion)){
			fncFormula=fncExclusion;
		} else if (isString(fncExclusion)||(isArray(fncExclusion))){
			var sSource=fncExclusion;
			if (isArray(fncExclusion)){
				sSource=fncExclusion.saToString();
			}
			sSource=`'';
					var issue=_arrRefs_[0];
					var report=_arrRefs_[1];
					var model=_arrRefs_[2];
					result=` +sSource;
			fncFormula=createFunction(sSource);
		}
		this.isExcludedByFunction=fncFormula;
	}
	dynObj.extractRelatedIssues;
	dynObj.setRelatedIssueFindFunction=function(fncRelatedIssuesFunction){
		var fncFormula;
		if (isMethod(fncRelatedIssuesFunction)){
			fncFormula=fncRelatedIssuesFunction;
		} else if (isString(fncRelatedIssuesFunction)||(isArray(fncRelatedIssuesFunction))){
			var sSource=fncRelatedIssuesFunction;
			if (isArray(fncRelatedIssuesFunction)){
				sSource=fncRelatedIssuesFunction.saToString();
			}
			sSource=`'';
					var issue=_arrRefs_[0];
					var hsIssuesCache=_arrRefs_[1];
					var arrIssueKeys=[];
					` +sSource+`
					return arrIssueKeys;
					`;
			fncFormula=createFunction(sSource);
		}
		this.extractRelatedIssues=fncFormula;
	}
	
	dynObj.functions.add("isProjectExcluded",function(){
		var self=this;
		var issPrjKey=self.fieldValue("project.key");
		bExcluded=self.factory.isExcludedProject(issPrjKey);
		return bExcluded;
	});
	dynObj.functions.add("isExcludedByFunction",function(){
		var self=this;
		if (isDefined(self.factory.isExcludedByFunction)){
			var theReport=self.getReport();
			var theModel=theReport.objModel;
			return self.factory.isExcludedByFunction([self,theReport,theModel]);
		}
		return false;
	});
	dynObj.functions.add("getRelatedIssuesByFunction",function(issuesCache){
		var self=this;
		if (isDefined(self.factory.extractRelatedIssues)){
			return self.factory.extractRelatedIssues([self,issuesCache]);
		}
		return [];
	});

	dynObj.functions.add("getReport",function(){
		return theReport;
	});
	dynObj.functions.add("getExistentFieldId",function(theFieldName){
		var self=this;
		var sFieldName=theFieldName.trim();
		var fncAux=self["get"+sFieldName];
		var sFieldKey="";
		var bDefined=false;
		var fieldValue="";
		if (isDefined(fncAux)){
			bDefined=true;
			return sFieldName;
		} else if (hsFieldNames.exists(sFieldName)) {
			sFieldKey=hsFieldNames.getValue(sFieldName);
			if (sFieldKey!=""){
				fncAux=self["get"+sFieldKey];
				if (isDefined(fncAux)){
					return sFieldKey;
				}
			}
		}
		var jiraObj=self.getJiraObject();
		var jsonFields=jiraObj.fields;
		var jsonField=jsonFields[sFieldName];
		if (isDefined(jsonField)){
			return sFieldName;
		} else {
			jsonField=jsonFields[sFieldKey];
			if (isDefined(jsonField)){
				return sFieldKey;
			}
		}
//		log("Error getting correct id of Field:"+sFieldName);
		return sFieldName;
	});
	dynObj.functions.add("getChildRoot",function(){
		var self=this;
		var dynAux=self;
		while (dynAux.countParentsChild()>0){
			dynAux=dynAux.getListParentsChild().getFirst().value;
		}
		return dynAux;
	});
	dynObj.functions.add("hasChildCycle",function(){
		var self=this;
		var hsParents=newHashMap();
		hsParents.add(self.getKey(),self.getKey());
		var bReturn=false;
		var dynAux=self;
		while (dynAux.countParentsChild()>0){
			if (dynAux.countParentsChild()>1) {
				logError("The issue:"+ dynAux.getKey()+" has more ("+dynAux.countParentsChild()+") than one parent");
				hsParents=dynAux.getListParentsChild();
				while (hsParents.length()>1){
					hsParents.remove(hsParents.getLast().key);
				}
				bReturn=true;
			}
			dynAux=dynAux.getListParentsChild().getFirst().value;
			if (hsParents.exists(dynAux.getKey())){
				logError("The Issue:"+self.getKey()+" has a cycle child/parent relation");
				bReturn=true;
			}
			if (bReturn) return bReturn;
		}
		return false;
	});
	dynObj.functions.add("fieldExists",function(theFieldName){
		var self=this;
		var auxFieldName=theFieldName.trim();
		var sFieldName=self.getExistentFieldId(auxFieldName);
		var arrFieldNames=sFieldName.split(".");
		if (arrFieldNames.length>1){
			bGetAttribute=true;
			sFieldName=arrFieldNames[0].trim();
		}
		var fncAux=self["get"+sFieldName];
		return (isDefined(fncAux));
	});
	
	dynObj.functions.add("fieldValue",function(theFieldName,bRendered,dateTime,inOtherParams){
		var self=this;
		var auxFieldName=theFieldName.trim();
		var sFieldName=self.getExistentFieldId(auxFieldName);
		var bGetAttribute=false;
		var otherParams;
		if (Array.isArray(inOtherParams)){
			otherParams=newHashMap();
			inOtherParams.forEach(function(param){
				if (isString(param.value)||isArray(param.value))param.value=param.value.saToString().trim();
				otherParams.add(param.key.trim(),param.value);
			});
		} else {
			otherParams=inOtherParams;
		}
		var arrFieldNames=sFieldName.split(".");
		if (arrFieldNames.length>1){
			bGetAttribute=true;
			sFieldName=arrFieldNames[0].trim();
		}
		var bDefined=false;
		var fieldValue="";
		if (isDefined(dateTime)&&(dateTime!="")){
			bDefined=true;
			fieldValue=self.getFieldValueAtDateTime(sFieldName,dateTime,otherParams);
		} else {
			var fncAux=self["get"+sFieldName];
			if (isDefined(fncAux)){
				bDefined=true;
				fieldValue=self["get"+sFieldName](otherParams);
			} else {
				var jiraObj=self.getJiraObject();
				var jsonFields=jiraObj.fields;
				var jsonField=jsonFields[sFieldName];
				if (isDefined(jsonField)&&(jsonField!=null)){
					fieldValue=jsonField;
					bDefined=true;
				}
			}
		}
		if (bDefined){
			if (typeof fieldValue==="object"){
				if (bGetAttribute){
					var auxValue=fieldValue;
					for (var i=1;i<arrFieldNames.length;i++){
						auxValue=auxValue[arrFieldNames[i].trim()];
					}
					return auxValue;
				}
				if (isDefined(fieldValue.value)) return fieldValue.value;
				if (isDefined(fieldValue.name)) return fieldValue.name;
				if (isDefined(fieldValue.key)) return fieldValue.key;
				if (isDefined(fieldValue.id)) return fieldValue.id;
			}
			return fieldValue;
		}
		return "Undefined getter for fieldName:["+sFieldName+"]";
	});
	dynObj.functions.add("fieldAccumChilds",function(theFieldName,datetime,inOtherParams,notAdjust,bSetProperty,fncItemCustomCalc){
		var self=this;
		//debugger;
		return self.fieldAccum(theFieldName,"Childs",datetime,bSetProperty,inOtherParams,notAdjust,fncItemCustomCalc);
	});
	dynObj.functions.add("fieldAccumAdvanceChilds",function(theFieldName,datetime,inOtherParams,notAdjust,bSetProperty,fncItemCustomCalc){
		var self=this;
		return self.fieldAccum(theFieldName,"AdvanceChilds",datetime,inOtherParams,bSetProperty,notAdjust,fncItemCustomCalc);
	});
	dynObj.functions.add("setPrecomputedPropertyLife",function(key,oPrecomputedLife){
		var self=this;
		// prepare object
		var objAux=oPrecomputedLife;
		objAux.lastSave=new Date(objAux.lastSave);
		if (isUndefined(objAux.changes)){
			log("The precomputed info is not valid... discarding");
			return;
		}
		objAux.changes.forEach(function(change){
			change[0]=new Date(change[0]);
		});
		var precomps=self.getPrecomputedPropertys();
		var hsValues;
		if (!precomps.exists(key)){
			precomps.add(key,objAux);
		} else {
			precomps.setValue(key,objAux);
		}
	});
	
	dynObj.functions.add("getPrecomputedPropertyValue",function(key,atDateTime){
		var self=this;
		var precomps=self.getPrecomputedPropertyById(key);
		if (precomps=="") return "";
		var changes=precomps.changes;
		if (isUndefined(changes)||(changes.length==0)){
			return "";
		}
		var auxDate=new Date();
		if (isDefined(atDateTime)){
			auxDate=atDateTime;
		}
		var resultValue=changes[0][2];
		var i=0;
		var bContinue=true;
		var change;
		while ((i<changes.length)&&(bContinue)){
			change=changes[i];
			if (change[0]>=auxDate){
				resultValue=change[1];
			} else {
				bContinue=false;
			}
			i++;
		}
		if ((resultValue=="")||(resultValue==null)||(isUndefined(resultValue))){
			return "";
		}
		if (isString(resultValue)){
			resultValue=parseFloat(resultValue);
		}
		return resultValue;
	})
	dynObj.functions.add("mixIssuesFieldLife",function(hsIssues,fieldName,childType,notAdjust){
		var self=this;
		var hsLife;
		var hsMixLife=newHashMap();
		var arrLife;
		hsIssues.walk(function(issue){
			hsLife=issue.getFieldLife(fieldName);
			arrLife=hsLife.getValue("life");
			arrLife.forEach(function(episode){
				if (!hsMixLife.exists(episode[0])){
					hsMixLife.add(episode[0],0);
				}
			});
		});
		var vAccum=0;
		var vAux=0;
		hsMixLife.walk(function(sDate,iDeep,dateKey){
			vAccum=0;
			hsIssues.walk(function(issue){
				vAux=issue.fieldValue(fieldName,false,dateKey);
				if (isDefined(vAux)&& (vAux!="")&&(vAux!=null)&&(!isObject(vAux))){
					if (isString(vAux)){
						vAux=parseFloat(vAux);
					}
					vAux=self.getReport().adjustAccumItem(childType,vAux,issue,fieldName,notAdjust);
					vAccum+=vAux;
				}
			});
			hsMixLife.setValue(dateKey,vAccum);
		});
		return hsMixLife;
	})
	
	dynObj.functions.add("fieldAccum",function(theFieldName,hierarchyType,dateTime,inOtherParams,bSetProperty,notAdjust,fncItemCustomCalc){
		var self=this;
		var bPrecomputed=false;
		//debugger;
		var app=System.webapp;
		var accumValue=0;
		var childType="Childs";
		if (isDefined(hierarchyType)){
			childType=hierarchyType;
		}
		var cacheKey=childType+"."+theFieldName;
		var cacheTimeKey="now";
		if (isDefined(dateTime)){
			cacheTimeKey=dateTime.getTime()+"";
		}
		var accumCache=self.getAccumulatorsCaches();
		var keyValuesCache;
		var bExistsCacheKey=accumCache.exists(cacheKey);
		if (bExistsCacheKey){
			keyValuesCache=accumCache.getValue(cacheKey);
			//debugger;
			if (keyValuesCache.exists(cacheTimeKey)){
				var vResultFromCache=keyValuesCache.getValue(cacheTimeKey);
				return vResultFromCache; 
			}
		} else {
			keyValuesCache=newHashMap();
			accumCache.add(cacheKey,keyValuesCache);
		}
		var allChilds=self["get"+childType]();
		if (allChilds.length()>0){
			allChilds.walk(function(child){
				childValue=child.fieldAccum(theFieldName,childType,dateTime,inOtherParams,bSetProperty,notAdjust,fncItemCustomCalc);
				if (isString(childValue)||isArray(childValue)){
					accumValue+=parseFloat(childValue.saToString().trim());
				} else {
					accumValue+=childValue;
				}
			});
		} else {
			// let´s find if field have a precomputed value
			var childValue="";
			var precompValue=self.getPrecomputedPropertyValue(cacheKey,dateTime);
			if (precompValue!=""){
				bPrecomputed=true;
				childValue=precompValue;
			}
			if (childValue==""){ // if precomputed==""..... there is not precomputed value
				childValue=self.fieldValue(theFieldName,false,dateTime,inOtherParams);
			}
			if (childValue==""){
				childValue=0;
			}
			accumValue=childValue;
		}
		if (isDefined(fncItemCustomCalc)){
			log("Isssue"+self.getKey()+". Calling item custom calc function with value:"+accumValue);
			accumValue=fncItemCustomCalc(accumValue);
			log("Isssue"+self.getKey()+ " item custom calc function returns value:"+accumValue);
		} else {
			log("Isssue"+self.getKey()+ " returns value:"+accumValue);
		}
		var auxNotAdjust=(isDefined(notAdjust)&&notAdjust); // not adjust uses only if TRUE is received
		if ((!bPrecomputed)&&(!auxNotAdjust)) {
			accumValue=self.getReport().adjustAccumItem(childType,accumValue,self,theFieldName,auxNotAdjust);
		}
//		accumCache.add(cacheKey,accumValue);
		keyValuesCache.add(cacheTimeKey,accumValue);
		if ((allChilds.length()>0)
			&&(!bPrecomputed)
			&&(self.getReport().updatePrecomputedAccumulators)
			&&(isUndefined(bSetProperty) || (isDefined(bSetProperty)&&(bSetProperty)))
			){
			var hsMixedLife=self.mixIssuesFieldLife(allChilds,theFieldName,childType,auxNotAdjust);
			var arrChanges=[];
			var precompObj={lastSave:new Date(),
							numChilds:allChilds.length(),
							childsKeys:[],
							changes:arrChanges};
			hsMixedLife.walk(function(value,iDeep,dateKey){
				arrChanges.push([dateKey,"",value]);
			});
			allChilds.walk(function(theChild){
				precompObj.childsKeys.push(theChild.getKey());
			});
			arrChanges.sort(function(a,b){
				if (a[0]>b[0]) return -1;
				if (a[0]<b[0]) return 1;
				return 0;
			});
			for (var i=0;i<arrChanges.length-1;i++){
				arrChanges[i][1]=arrChanges[i+1][2];
			}
			var antPrecomp=self.getPrecomputedPropertyById(cacheKey);
			var bEqualsPrecomps=true;
			var antChanges=antPrecomp.changes;
			var actChanges=arrChanges;
			if (antPrecomp==""){
				bEqualsPrecomps=false;
			} else if (antChanges.length!=actChanges.length){
				bEqualsPrecomps=false;
			} else {
				var antChange;
				var actChange;
				var antValue;
				var actValue;
				for (var i=0;(bEqualsPrecomps&&(i<antChanges.length));i++){
					antChange=antChanges[i];
					actChange=actChanges[i];
					for (var j=0;(bEqualsPrecomps&&j<antChange.length);j++){
						antValue=antChange[j];
						actValue=actChange[j];
						if (typeof antValue !== typeof actValue){
							bEqualsPrecomps=false;
						} else if (isDate(antValue)){
							bEqualsPrecomps=(antValue.getTime()==actValue.getTime());
						} else {
							bEqualsPrecomps=(antValue==actValue);
						}
					}
				}
			}
			if (!bEqualsPrecomps){
				self.setPrecomputedPropertyLife(cacheKey,precompObj);
				self.setSavePrecomputedProperty(cacheKey,precompObj); //store the need of update the precomputed property
/*
 * The global threads crash when taskmanager does not breaks (settimeout) in each step 
 * 					
  					System.webapp.addStep("Saving life of :"+cacheKey+" of issue "+ self.getKey() +" value:"+JSON.stringify(precompObj) ,function(){
					var jira=System.webapp.getJira();
					jira.setProperty(self.getKey(),cacheKey,precompObj);
		        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
*/			}
		}
		return accumValue;
	});
	
	dynObj.functions.add("linkValue",function(sLinkName){
		return this["get"+sLinkName]();
	});
	dynObj.functions.add("getReport",function(){
		return theReport;
	});
	dynObj.functions.add("getKeyWithUrl",function(){
		var self=this;
		var sKey=self.getKey();
		var sUrl=self.getJiraObject().self;
		var arrUrlParts=sUrl.split('rest');
		sUrl=arrUrlParts[0]+"browse/"+sKey;
		var sHtml='<a target="_blank" href='+sUrl+'>'+sKey+'</a>';
		return sHtml;
	});
	
	dynObj.functions.add("getEpicChildsRelations",function(issuesCache){
		var self=this;
		var hsResult=newHashMap();
		var arrResult=[];
		var eLink=self.fieldValue("Epic Link");
		if (isDefined(eLink)&&(eLink!="")){
			linkedIssue="";
			if (isDefined(issuesCache)) linkedIssue=issuesCache.getById(eLink);
			if (linkedIssue==""){
				if (!hsResult.exists(eLink)){
					hsResult.add(eLink,eLink);
					arrResult.push(eLink);
				}
			}
		}
		self.getEpicChilds().walk(function(epicChild){
			eLink=epicChild.getKey();
			linkedIssue="";
			if (isDefined(issuesCache)) linkedIssue=issuesCache.getById(eLink);
			if (linkedIssue==""){
				if (!hsResult.exists(eLink)){
					hsResult.add(eLink,eLink);
					arrResult.push(eLink);
				}
			}
		});
		return arrResult;
	});
	
	dynObj.functions.add("getPendingLinkedIssueKeys",function(arrLinkTypes,issuesCache){
		var self=this;
		var hsResult=newHashMap();
		var arrResult=[];
		var linkedIssue;
		if (isDefined(arrLinkTypes)){
			arrLinkTypes.forEach(function(linkType){
				var hsLinks=self.getLinkTypeById(linkType.key);
				if (hsLinks!=""){
					hsLinks.issues.walk(function(auxIssue,iDeep,linkedIssueKey){
						if (linkedIssueKey!=""){
							if (!self.getLinkedIssueKeys().exists(linkedIssueKey)){
								self.addLinkedIssueKey(linkedIssueKey,linkedIssueKey);
							}
							linkedIssue="";
							if (isDefined(issuesCache)) linkedIssue=issuesCache.getById(linkedIssueKey);
							if (linkedIssue==""){
								if (!hsResult.exists(linkedIssueKey)){
									hsResult.add(linkedIssueKey,linkedIssueKey);
									arrResult.push(linkedIssueKey);
								}
							}
						} else {
							logError("There is a '' in linked issues of "+self.getKey());
						}
					});
				}
			});
		}
		return arrResult;
	});
	
	dynObj.functions.add("addLinkValue",function(sLinkTypeId,value){
		var self=this;
		var hsLinkTypes=self.getLinkTypes();
		if (!hsLinkTypes.exists(sLinkTypeId)){
			self.addLinkType({id:sLinkTypeId,issues:newHashMap()});
		}
		var hsLinks=self.getLinkTypeById(sLinkTypeId);
		hsLinks.issues.add(value);
	});
	dynObj.functions.add("isLinkedTo",function(issue,linkName){
		var self=this;
		var hsLinks=self.getLinkTypeById(linkName);
		if (hsLinks=="") return false;
		if (!hsLinks.issues.exists(issue.id)) return false;
		return true;
	});

	dynObj.functions.add("setAttributeValueByName",function(attrName,value){
		var self=this;
		if (isNull(value)) return;
		if (isUndefined(value)) return;
		self["set"+attrName](value);
	});
	dynObj.functions.add("getAttributeValueByName",function(attrName){
		var self=this;
		return self["get"+attrName]();
	});
	dynObj.functions.add("removeParagraphOfHTML",function(sHTML){
		htmlText=sHTML;
		var sInitialParagraphTag=htmlText.substring(0,3).toLowerCase();
		var sFinalParagraphTag=htmlText.substring(htmlText.length-4,htmlText.length).toLowerCase();
		if (sInitialParagraphTag=="<p>"){
			htmlText=htmlText.substring(3,htmlText.length);
			if (sFinalParagraphTag=="</p>"){
				htmlText=htmlText.substring(0,htmlText.length-4);
			}
		}
		return htmlText;
	});
	dynObj.functions.add("getHtmlAllComments",function(bRemoveClosureParagraph){
		var self=this;
		var htmlText="";
		var hsComments=self.getComments();
		if (hsComments.length()>0){
			hsComments.walk(function(comment){
				if (htmlText!=""){
					htmlText="<br><br>"+htmlText;
				}
				htmlText=comment.id+"<br>"+comment.htmlBody+htmlText;
			});
			if (isUndefined(bRemoveClosureParagraph) || (isDefined(bRemoveClosureParagraph)&&(bRemoveClosureParagraph))){
				htmlText=self.removeParagraphOfHTML(htmlText);
			}
		} 
		return htmlText;
	});
	dynObj.functions.add("getHtmlLastComment",function(bRemoveClosureParagraph){
		var self=this;
		var htmlText="";
		var hsComments=self.getComments();
		if (hsComments.length()>0){
			var lastComment=hsComments.getLast().value;
			htmlText=lastComment.htmlBody;
			if (isUndefined(bRemoveClosureParagraph) || (isDefined(bRemoveClosureParagraph)&&(bRemoveClosureParagraph))){
				htmlText=self.removeParagraphOfHTML(htmlText);
			}
		} 
		return htmlText;
	});
	dynObj.functions.add("getHtmlLastCommentStartsWith",function(sStart,bRemoveTarget,sPostPendToRemove,bRemoveClosureParagraph){
		var self=this;
		var htmlText="";
		var hsComments=self.getCommentsStartsWith(sStart);
		if (hsComments.length()>0){
			var lastComment=hsComments.getLast().value;
			htmlText=lastComment.htmlBody;
			if (isDefined(bRemoveClosureParagraph)&&(bRemoveClosureParagraph)){
				htmlText=self.removeParagraphOfHTML(htmlText);
			}
			if (isDefined(bRemoveTarget)&&(bRemoveTarget)){
				var sRemove=sStart;
				if (isDefined(sPostPendToRemove)){
					var inHtml=decodeEntities(sPostPendToRemove);
					sRemove+=inHtml;
				}
				htmlText=replaceAll(htmlText,sRemove,"",true);
			}
		}
		return htmlText;
	});
	dynObj.functions.add("getCommentsStartsWith",function(sStart){
		var self=this;
		var comments=self.getComments();
		var hsResults=newHashMap();
		var sStartUpper=sStart.trim().toUpperCase();
		var iLength=sStartUpper.length;
		var sStartAux;
		comments.walk(function(comment){
			sStartAux=comment.body.substring(0,iLength);
			if (sStartAux.toUpperCase()==sStartUpper){
				hsResults.add(comment.id,comment);
			}
		});
		return hsResults;
	});
	dynObj.functions.add("existsCommentsStartsWith",function(sStart){
		var self=this;
		var comments=self.getComments();
		var hsResults=newHashMap();
		var sStartUpper=sStart.trim().toUpperCase();
		var iLength=sStartUpper.length;
		var sStartAux;
		comments.walk(function(comment){
			sStartAux=comment.body.substring(0,iLength);
			if (sStartAux.toUpperCase()==sStartUpper){
				hsResults.add(comment.id,comment);
			}
		});
		return hsResults.length()>0;
	});
	
	dynObj.functions.add("updateInfo",function(){
		var self=this;
		var jiraObject=self.getJiraObject();
		var issueFields=jiraObject.fields;
		var useFields=theReport.config.useFields;
		var useOtherFields=theReport.config.useOtherFields;
		var useLinks=theReport.config.useIssueLinkTypes;
		useFields.forEach(function(element){
			self.setAttributeValueByName(element.key,issueFields[element.key]);
		});
		useOtherFields.forEach(function(element){
			self.setAttributeValueByName(element.key,issueFields[element.key]);
		});
		var issueLinks=issueFields.issuelinks;
		var typeLink;
		var directionName;
		var linkedIssueKey;
		useLinks.forEach(function(element){
			issueLinks.forEach(function(link){
				typeLink=link.type;
				if (typeLink.inward==element.key){
					if (isDefined(link.inwardIssue)){
						linkedIssueKey=link.inwardIssue.key;
						self.addLinkValue(element.key,linkedIssueKey);
					}
				} 
				if (typeLink.outward==element.key){
					if (isDefined(link.outwardIssue)){
						linkedIssueKey=link.outwardIssue.key;
						self.addLinkValue(element.key,linkedIssueKey);
					}
				}
			})
		});
	});
	dynObj.functions.add("getFieldLife",function(theFieldName,atDatetime,otherParams){
		var self=this;
		var sFieldName=theFieldName;
		var sCacheKey=sFieldName;
		if (isDefined(self["get"+sFieldName+"CacheKeyPostText"])){
			sCacheKey+=self["get"+sFieldName+"CacheKeyPostText"](atDatetime,otherParams);
		}
		var hsItemFieldsCache;
		var hsFieldLifesCaches=self.getFieldLifeCaches();
		if (hsFieldLifesCaches.exists(sCacheKey)){
			hsItemFieldsCache=hsFieldLifesCaches.getValue(sCacheKey);
			return hsItemFieldsCache;
		}
		var arrResult=[];
		if (isDefined(self["get"+theFieldName+"Life"])){
			arrResult=self["get"+theFieldName+"Life"](otherParams,atDatetime);
		} else {
			var sChangeDate;
			var issueBase=self.getJiraObject();
			var arrFieldNames=sFieldName.split(".");
			if (arrFieldNames.length>0){
				sFieldName=arrFieldNames[0];
			}
			var hsItemFieldsCache;
			if (isDefined(issueBase.changelog)){
				var arrHistories=issueBase.changelog.histories;
				var arrItems;
				arrHistories.forEach(function(change){
					arrItems=change.items;
					sChangeDate=change.created;
					arrItems.forEach(function(chgField){
						if ((chgField.field==sFieldName)||
							(chgField.fieldId==sFieldName)){
							arrResult.push([(new Date(sChangeDate)),chgField.fromString,chgField.toString,"system"]);
						}
					});
				});
			}
			var hsAdjusts=self.getFieldLifeAdjustById(sFieldName);
			if (hsAdjusts!=""){
				hsAdjusts.walk(function(oAdjust){
					arrResult.push([oAdjust.effectDate,"",oAdjust.newValue,"adjust",oAdjust.fieldPath]);
				});
			}
		}
		arrResult.sort(function(a,b){ " ordered from actual to the past"
			if (a[0]<b[0]) return 1;
			if (a[0]>b[0]) return -1;
			return 0
		});
		for (var i=0;i<arrResult.length-1;i++){
			arrResult[i][1]=arrResult[i+1][2];
		}
		hsItemFieldsCache=newHashMap();
		hsItemFieldsCache.add("life",arrResult);
		hsFieldLifesCaches.add(sCacheKey,hsItemFieldsCache);
		return hsItemFieldsCache;
	});
	dynObj.functions.add("getFieldValueAtDateTime",function(sFieldName,dateTime,otherParams){
		var self=this;
		var dateCreated=new Date(self.fieldValue("created"));
		var sDateTime="unknown";
		if (isDefined(dateTime)) sDateTime=dateTime.getTime()+"";
		var hsFieldLife=self.getFieldLife(sFieldName,dateTime,otherParams);
		if (hsFieldLife.exists(sDateTime)){
			return hsFieldLife.getValue(sDateTime);
		}
		var arrLife=hsFieldLife.getValue("life");
		if (arrLife.length>0){
			var firstChange=arrLife[arrLife.length-1][0];
			if (firstChange<dateCreated){
				dateCreated=firstChange;
			}
		} 
		if (dateCreated>dateTime) {
			if (isDefined(otherParams) && isDefined(otherParams.ifEmpty)){
				return otherParams.ifEmpty;
			}
			return "";
		}
		var auxVal=	self.fieldValue(sFieldName,false,undefined,otherParams); // getting actual Value
		var history;
		var bLocated=false;
		for (var i=0;(i<arrLife.length) &&(!bLocated);i++){
			history=arrLife[i];
/*			log(sFieldName+" Life evaluating. Actual Value:" +JSON.stringify(auxVal)+ 
					" Type:"+ history[3] + 
					" Date:"+ history[0] + 
					" From:"+(history[1]!=null?JSON.stringify(history[1]):"null") + 
					" To:"+(history[2]!=null?JSON.stringify(history[2]):"null") );
*/			if ((i==0)&&(history[3]=="adjust")){
				auxVal=history[2];
			} else if (history[0].getTime()<=dateTime.getTime()){ // if next is <= that the date.... finish
				auxVal=history[2];
				bLocated=true;
			} else {
				auxVal=history[1];
			}
		}
		if ((auxVal==null)||(isUndefined(auxVal))){
			auxVal="";
		}
		hsFieldLife.add(sDateTime,auxVal);
		return auxVal;
	});
	dynObj.functions.add("getVersionsLinks",function(){
		var self=this;
		var arrVersions=self.fieldValue("fixVersions");
		var sResult="";
		var sUrl;
		if (isArray(arrVersions)){
			arrVersions.forEach(function(version){
				sUrl=System.webapp.atlassian.instance+"/issues/?jql=fixVersion="+version.name;
				var sHtml='<a target="_blank" href='+sUrl+'>'+version.name+'</a>';
				sResult+=" "+sHtml;
			});
		}
		return sResult;
	});
	return dynObj;
}