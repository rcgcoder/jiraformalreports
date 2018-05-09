class jrfForEach{
	getAttrVal(idAttr){
		var self=this;
		var attr=self.tag.getAttributeById(idAttr);
		if (isDefined(attr)){
			return attr.value;
		}
		return "";
	}
	constructor(tag,reportElem,model){
		var self=this;
		self.tag=tag;
		self.reportElem=reportElem;
		self.model=model;
		self.type=self.getAttrVal("type");
		self.subType=self.getAttrVal("subtype");
		self.where=self.getAttrVal("where");
		if (self.type=="root"){
			self.elemsInForEach=self.model.report.childs;
		} else if (self.type=="child"){
			self.elemsInForEach=self.reportElem.getChilds();
		} else if (self.type=="advchild"){
			self.elemsInForEach=self.reportElem.getAdvanceChilds();
		} else {
			self.elemsInForEach=newHashMap();
		}
	}
	apply(){
		var self=this;
		var sHTML="";
		sHTML+="<!-- START PREVIOUSHTML IN FOREACH JRF TOKEN -->";
		sHTML+=self.tag.getPreviousHTML();
		sHTML+="<!-- END PREVIOUSHTML IN FOREACH JRF TOKEN -->";
		var nItem=0;
		self.elemsInForEach.walk(function(newParent){
			self.tag.getChilds().walk(function(childTag){
				sHTML+="<!-- START CHILD LIST ITEM "+ (nItem++) + " IN FOREACH JRF TOKEN -->";
				sHTML+=self.model.applyTag(childTag,newParent);
				sHTML+="<!-- END CHILD LIST ITEM "+ (nItem++) + " IN FOREACH JRF TOKEN -->";
			});
			sHTML+="<!-- START POSTHTML IN FOREACH JRF TOKEN -->";
			sHTML+=self.tag.getPostHTML();
			sHTML+="<!-- END POSTHTML IN FOREACH JRF TOKEN -->";
		});
		return sHTML;
	}

}

