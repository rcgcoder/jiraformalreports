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
			 {name:"Comment", description:"Comments in Issue",type:"object"},
			 {name:"AccumulatorsCache",description:"Cache the values of accumulator calls",type:"object"},
			 {name:"PrecomputedProperty",description:"List of properties with values of hidden childs computed by a user with permissions",type:"object"},
			 {name:"FieldLifeCache",description:"Cache the life of the fields to speed up the reutilization of values",type:"object"},
			 {name:"FieldLifeAdjust",description:"List of manual adjusts to field values usually saved as comment in the issue",type:"object"}
			]
			,
			allFieldDefinitions.concat(["JiraObject"])
			,
			[]
			,
			undefined);
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
		log("Error getting correct id of Field:"+sFieldName);
		return sFieldName;
	});
	dynObj.functions.add("fieldValue",function(theFieldName,bRendered,dateTime,otherParams){
		var self=this;
		var auxFieldName=theFieldName.trim();
		var sFieldName=self.getExistentFieldId(auxFieldName);
		var bGetAttribute=false;
		var arrFieldNames=sFieldName.split(".");
		if (arrFieldNames.length>1){
			bGetAttribute=true;
			sFieldName=arrFieldNames[0].trim();
		}
		var bDefined=false;
		var fieldValue="";
		if (isDefined(dateTime)){
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
	dynObj.functions.add("fieldAccumChilds",function(theFieldName,notAdjust,bSetProperty,fncItemCustomCalc){
		var self=this;
		return self.fieldAccum(theFieldName,"Childs",bSetProperty,notAdjust,fncItemCustomCalc);
	});
	dynObj.functions.add("fieldAccumAdvanceChilds",function(theFieldName,notAdjust,bSetProperty,fncItemCustomCalc){
		var self=this;
		return self.fieldAccum(theFieldName,"AdvanceChilds",bSetProperty,notAdjust,fncItemCustomCalc);
	});
	dynObj.functions.add("appendPrecomputedPropertyValues",function(key,arrValues){
		var self=this;
		var precomps=self.getPrecomputedPropertys();
		var hsValues;
		if (!precomps.exists(key)){
			hsValues=newHashMap();
			precomps.add(key,hsValues);
		} else {
			hsValues=precomps.getValue(key);
		}
		arrValues.forEach(function(elem){
			hsValues.add(elem.date,elem);
		})
	})
	dynObj.functions.add("getLastPrecomputedPropertyValue",function(key){
		var self=this;
		var precomps=self.getPrecomputedPropertyById(key);
		if (precomps=="") return "";
		return precomps.getLast().value;
	})
	dynObj.functions.add("fieldAccum",function(theFieldName,dateTime,listAttribName,bSetProperty,notAdjust,fncItemCustomCalc){
		var self=this;
		var app=System.webapp;
		var accumValue=0;
		var childType="Childs";
		if (isDefined(listAttribName)){
			childType=listAttribName;
		}
		var cacheKey=childType+"."+theFieldName;
		var accumCache=self.getAccumulatorsCaches();
		var keyValuesCache;
		if (accumCache.exists(cacheKey)){
			keyValuesCache=accumCache.getValue(cacheKey);
			if (isUndefined(dateTime)){
				return keyValuesCache.getValue("now");
			}
			if (accumCache.exists(dateTime)){
				return keyValuesCache.getValue(dateTime);
			} 
		} else {
			keyValuesCache=newHashMap();
			accumCache.add(cacheKey,keyValuesCache);
		}
		var allChilds=self["get"+childType]();
		if (allChilds.length()>0){
			allChilds.walk(function(child){
				childValue=child.fieldAccum(theFieldName,childType);
				accumValue+=childValue;
			});
		} else {
			// let´s find if field have a precomputed value
			var childValue="";
			var precompValue=self.getLastPrecomputedPropertyValue(cacheKey);
			if (precompValue!=""){
				childValue=precompValue.value;
			}
			if (childValue==""){ // if precomputed==""..... there is not precomputed value
				var childValue=self.fieldValue(theFieldName);
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
		accumValue=self.getReport().adjustAccumItem(childType,accumValue,self,theFieldName,notAdjust);
//		accumCache.add(cacheKey,accumValue);
		keyValuesCache.add((isUndefined(dateTime)?"now":dateTime),accumValue);
		if ((self.getReport().updatePrecomputedAccumulators)
				&&
			(isUndefined(bSetProperty) || (isDefined(bSetProperty)&&(bSetProperty)))){
			// save to jira property
			if ((allChilds.length()>0)){
				var antValue=0;
				var precompValue=self.getLastPrecomputedPropertyValue(cacheKey);
				if (precompValue!=""){
					antValue=precompValue.value;
				}
				if (antValue==""){
					antValue=0;
				}
				if (accumValue!=antValue){
					self.appendPrecomputedPropertyValues(cacheKey,[{"date":Date.now(),"value":accumValue}]);
					System.webapp.addStep("Saving result:"+accumValue+" to property:"+cacheKey+" of Issue:"+self.getKey(),function(){
						var jira=System.webapp.getJira();
						var arrPropertyToJira=[];
						self.getPrecomputedPropertyById(cacheKey).walk(function(elem,iProf,key){
							arrPropertyToJira.push(elem);
						});
						jira.setProperty(self.getKey(),cacheKey,arrPropertyToJira);
			        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
				}
			} else {
				self.appendPrecomputedPropertyValues(cacheKey,[{"date":Date.now(),"value":0}]);
				System.webapp.addStep("Forcing the save of result:"+ 0 +" to property:"+cacheKey+" of Issue:"+self.getKey(),function(){
					var jira=System.webapp.getJira();
					var arrPropertyToJira=[];
					self.getPrecomputedPropertyById(cacheKey).walk(function(elem,iProf,key){
						arrPropertyToJira.push(elem);
					});
					jira.setProperty(self.getKey(),cacheKey,arrPropertyToJira);
		        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
			}
		}
		return accumValue;
	});
	
	dynObj.functions.add("linkValue",function(sLinkName){
		return this["get"+sLinkName]();
	});
	dynObj.functions.add("getReport",function(){
		return theReport;
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
		if (dateCreated>dateTime) return "";
		var hsFieldLife=self.getFieldLife(sFieldName,dateTime,otherParams);
		if (hsFieldLife.exists(sDateTime)){
			return hsFieldLife.getValue(sDateTime);
		}
		var arrLife=hsFieldLife.getValue("life");
		if (arrLife.length>0){
			log("Debug here");
		}
		var auxVal=	self.fieldValue(sFieldName,false,undefined,otherParams); // getting actual Value
		var history;
		var bLocated=false;
		for (var i=0;(i<arrLife.length) &&(!bLocated);i++){
			history=arrLife[i];
			log(sFieldName+" Life evaluating. Actual Value:" +JSON.stringify(auxVal)+ 
					" Type:"+ history[3] + 
					" Date:"+ history[0] + 
					" From:"+(history[1]!=null?JSON.stringify(history[1]):"null") + 
					" To:"+(history[2]!=null?JSON.stringify(history[2]):"null") );
			if ((i==0)&&(history[3]=="adjust")){
				auxVal=history[2];
			} else if (history[0]<=dateTime){ // if next is < that the date.... finish
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
	
	return dynObj;
}