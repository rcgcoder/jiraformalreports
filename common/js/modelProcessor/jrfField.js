var jrfField=class jrfField{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.fieldName=self.getAttrVal("field");
		self.format=self.getAttrVal("inFormat");
	}
	apply(){
		var self=this;
		var bRendered=(self.format=="jiramarkup");
		var sValue=self.reportElem.fieldValue(self.fieldName,true);
		self.addHtml(sValue);
	}

}

