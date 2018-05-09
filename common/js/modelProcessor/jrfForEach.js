class jrfForEach{
	constructor(tag,reportElem,model){
		var self=this;
		self.tag=tag;
		self.reportElem=reportElem;
		self.model=model;
		self.type=self.getAttribute("type");
		self.subType=self.getAttribute("subtype");
		self.where=self.getAttribute("where");
		self.elemsInForEach;
		if (self.type="root"){
			self.elemsInForEach=self.model.report.childs;
		} else if (self.type="child"){
			self.elemsInForEach=self.reportElem.getChilds();
		} else if (self.type="advchild"){
			self.elemsInForEach=self.reportElem.getAdvanceChilds();
		}
	}
	apply(){
		var sHTML="";
		sHTML+=self.tag.getPreviousHTML();
		self.elemsInForEach.walk(function(newParent){
			self.tag.childs.walk(function(childTag){
				sHTML+=self.model.applyTag(childTag,newParent);
			});
			sHTML+=self.tag.getPostHTML();
		});
		return sHTML;
	}

}

