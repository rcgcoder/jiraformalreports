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
			 {name:"Comment", description:"Comments in Issue",type:"object"}
			]
			,
			allFieldDefinitions.concat(["JiraObject"])
			,
			[]
			,
			undefined);
	dynObj.functions.add("fieldValue",function(theFieldName,bRendered){
		var sFieldName=theFieldName.trim();
		var self=this;
		var fncAux=self["get"+sFieldName];
		var sFieldKey="";
		var bDefined=false;
		var fieldValue="";
		if (isDefined(fncAux)){
			bDefined=true;
			fieldValue=self["get"+sFieldName]();
		} else if (hsFieldNames.exists(sFieldName)) {
			sFieldKey=hsFieldNames.getValue(sFieldName);
			if (sFieldKey!=""){
				fncAux=self["get"+sFieldKey];
				if (isDefined(fncAux)){
					bDefined=true;
					fieldValue=self["get"+sFieldKey]();
				}
			}
		}
		if (!bDefined){
			var jiraObj=self.getJiraObject();
			var jsonFields=jiraObj.fields;
			var jsonField=jsonFields[sFieldName];
			if (isDefined(jsonField)){
				fieldValue=jsonField;
				bDefined=true;
			} else {
				jsonField=jsonFields[sFieldKey];
				if (isDefined(jsonField)){
					fieldValue=jsonField;
					bDefined=true;
				}
			}
		} 
		if ((!bDefined)||(isDefined(bRendered)&&bRendered)){
			var jiraObj=self.getJiraObject();
			var jsonFields=jiraObj.renderedFields;
			var jsonField=jsonFields[sFieldName];
			if (isDefined(jsonField)&&(jsonField!=null)){
				fieldValue=jsonField;
				bDefined=true;
			} else {
				jsonField=jsonFields[sFieldKey];
				if (isDefined(jsonField)&&(jsonField!=null)){
					fieldValue=jsonField;
					bDefined=true;
				}
			}
		} 
		if (bDefined){
			if (typeof fieldValue==="object"){
				return fieldValue.name;
			} else {
				return fieldValue;
			}
		}
		return "Undefined getter for fieldName:["+sFieldName+"]/["+sFieldKey+"]";
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
	dynObj.functions.add("getHtmlLastCommentStartsWith",function(sStart,bRemoveTarget,sPostPendToRemove,bRemoveClosureParagraph){
		var self=this;
		var htmlText="";
		var hsComments=self.getCommentsStartsWith(sStart);
		if (hsComments.length()>0){
			var lastComment=hsComments.getLast().value;
			htmlText=lastComment.htmlBody.trim();
			if (isDefined(bRemoveClosureParagraph)&&(bRemoveClosureParagraph)){
				var sInitialParagraphTag=htmlText.substring(0,3).toLowerCase()
				var sFinalParagraphTag=htmlText.substring(htmlText.length-4,htmlText.length).toLowerCase()
				if (sInitialParagraphTag=="<p>"){
					htmlText=htmlText.substring(4,htmlText.length);
					if (sFinalParagraphTag=="</p>"){
						htmlText=htmlText.substring(0,htmlText.length-4);
					}
				}
			}
			if (isDefined(bRemoveTarget)&&(bRemoveTarget)){
				var sRemove=sStart;
				if (isDefined(sPostPendToRemove)){
					sRemove+=sPostPendToRemove;
				}
				htmlText=replaceAll(htmlText,sStart,sRemove);
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
	

	
	return dynObj;
}