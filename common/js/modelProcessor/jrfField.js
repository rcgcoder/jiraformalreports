var jrfField=class jrfField{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.fieldName=self.getAttrVal("field");
	}
	apply(){
		var self=this;
		var sValue=self.reportElem.fieldValue(self.fieldName);
		self.addHtml(sValue);
	}

}

