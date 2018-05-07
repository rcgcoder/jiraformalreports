function newIssueFactory(report){
	var theReport=report;
	var allFieldDefinitions=theReport.config.useFields.concat(theReport.config.useOtherFields);
	var dynObj=newDynamicObjectFactory(
			[{name:"Child",description:"SubIssues for Billing",type:"object"},
			 {name:"AdvanceChild",description:"SubIssues for advance calculation",type:"object"},
			 {name:"LinkType",description:"Relation Types",type:"object"}
			]
			,
			allFieldDefinitions.concat(["JiraObject"])
			,
			[]
			,
			undefined);
	dynObj.functions.add("fieldValue",function(sFieldName){
		return this["get"+sFieldName]();
	});
	dynObj.functions.add("linkValue",function(sLinkName){
		return this["get"+sLinkName]();
	});
	dynObj.functions.add("getReport",function(){
		return theReport;
	});
	var useLinks=theReport.config.useIssueLinkTypes;
	useLinks.forEach(function(element){
		dynObj.addLinkType(element.key,newHashMap());
	});
	dynObj.functions.add("addLinkValue",function(sLinkTypeId,value){
		var self=this;
		var hsLinks=self.getLinkType(sLinkTypeId);
		hsLinks.add(value);
	});
	dynObj.functions.add("setAttributeValueByName",function(attrName,value){
		var self=this;
		self["set"+attrName](value);
	});
	dynObj.functions.add("getAttributeValueByName",function(attrName){
		var self=this;
		return self["get"+attrName]();
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
				if (typeLink.inward==element){
					linkedIssueKey=link.inwardIssue.key;
					self.addLinkValue(element,linkedIssueKey);
				} else if (typeLink.outward==element){
					linkedIssueKey=link.outwardIssue.key;
					self.addLinkValue(element,linkedIssueKey);
				}
			})
		});
	});
	

	
	return dynObj;
}