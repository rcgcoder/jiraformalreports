class jrfField{
	constructor(tag,reportElem,model){
		var self=this;
		self.model=model;
		model.extendObj(self);
		self.tag=tag;
		self.reportElem=reportElem;
		self.fieldName=self.getAttrVal("field");
		self.inFormat=self.getAttrVal("informat");
	}
	apply(){
		var self=this;
		self.pushHtmlBuffer();
		self.addHtml(self.tag.getPreviousHTML());
		var sValue=self.reportElem.fieldValue(self.fieldName);
		if (self.inFormat=="markdown"){
			sValue=self.model.markdownConverter.makeHtml(sValue); 
		}
		self.addHtml(sValue);
		self.addHtml(self.tag.getPostHTML());
		return self.popHtmlBuffer();
	}

}

