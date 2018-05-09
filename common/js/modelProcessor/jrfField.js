class jrfField{
	constructor(tag,reportElem,model){
		var self=this;
		self.tag=tag;
		self.reportElem=reportElem;
		self.model=model;
		self.fieldName=tag.getAttributeById("field").value;
	}
	apply(){
		var self=this;
		var sHTML="";
		sHTML+=self.tag.getPreviousHTML();
		sHTML+=self.reportElem.fieldValue(self.fieldName);
		sHTML+=self.tag.getPostHTML();
		return sHTML;
	}

}

