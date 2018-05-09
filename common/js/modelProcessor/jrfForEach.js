class jrfForEach{
	constructor(tag,reportElem,model){
		var self=this;
		self.model=model;
		model.extendObj(self);
		self.tag=tag;
		self.reportElem=reportElem;
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
		self.pushHtmlBuffer();
		self.addHtml("<!-- START PREVIOUSHTML IN FOREACH JRF TOKEN -->");
		self.addHtml(self.tag.getPreviousHTML());
		self.addHtml("<!-- END PREVIOUSHTML IN FOREACH JRF TOKEN -->");
		var nItem=0;
		self.elemsInForEach.walk(function(newParent){
			self.tag.getChilds().walk(function(childTag){
				self.addHtml("<!-- START CHILD LIST ITEM "+ (nItem++) + " IN FOREACH JRF TOKEN -->");
				self.addHtml(self.model.applyTag(childTag,newParent));
				self.addHtml("<!-- END CHILD LIST ITEM "+ (nItem++) + " IN FOREACH JRF TOKEN -->");
				self.addHtml("<!-- START POSTHTML IN FOREACH JRF TOKEN -->");
				self.addHtml(self.tag.getPostHTML());
				self.addHtml("<!-- END POSTHTML IN FOREACH JRF TOKEN -->");
				if ((self.subType=="row")&&(self.elemsInForEach.getLast().value.getKey()
											!=newParent.getKey())){
					self.addHtml("</td></tr><tr><td>");
				}
			});
		});
		return self.popHtmlBuffer();
	}

}

