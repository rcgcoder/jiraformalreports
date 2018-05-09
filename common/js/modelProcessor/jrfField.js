class jrfField{
	constructor(tag,reportElem,model){
		var self=this;
		self.tag=tag;
		self.reportElem=reportElem;
		self.model=model;
		self.fieldName=self.getAttrVal("field");
		self.inFormat=self.getAttrVal("informat");
		self.pushHtmlBuffer=function(){this.model.pushHtmlBuffer();};
		self.popHtmlBuffer=function(){return this.model.popHtmlBuffer();};
		self.addHtml=function(sHtml){this.model.addHtml(sHtml);};
		self.getAttrVal=this.model.getAttrVal;
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

