class jrfField{
	getAttrVal(idAttr){
		var self=this;
		var attr=self.tag.getAttributeById(idAttr);
		if (isDefined(attr)){
			var vAux=attr.value;
			if (isUndefined(vAux)){
				vAux="";
			}
			return vAux;
		}
		return "";
	}
	constructor(tag,reportElem,model){
		var self=this;
		self.tag=tag;
		self.reportElem=reportElem;
		self.model=model;
		self.fieldName=self.getAttrVal("field");
		self.inFormat=self.getAttrVal("inFormat");
	}
	apply(){
		var self=this;
		var sHTML="";
		sHTML+=self.tag.getPreviousHTML();
		var sValue=self.reportElem.fieldValue(self.fieldName);
		if (self.inFormat=="markdown"){
			sValue=self.model.markdownConverter.makeHtml(sValue); 
		}
		sHTML+=sValue;
		sHTML+=self.tag.getPostHTML();
		return sHTML;
	}

}

