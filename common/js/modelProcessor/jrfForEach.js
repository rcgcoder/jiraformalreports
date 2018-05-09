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
		var bAllRoots=false;
		if (typeof self.reportElem==="jrfReport"){
			bAllRoots=true;
		}
		self.addHtml("<!-- START PREVIOUSHTML IN FOREACH JRF TOKEN -->");
		self.addHtml(self.tag.getPreviousHTML());
		self.addHtml("<!-- END PREVIOUSHTML IN FOREACH JRF TOKEN -->");
		var nItem=0;
		var nChild=0;
		var rootBackUp=self.model.processingRoot;
		self.elemsInForEach.walk(function(newParent){
			self.addHtml("<!-- START INNER LOOP OF ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			nChild=0;
			self.tag.getChilds().walk(function(childTag){
				self.addHtml("<!-- START "+childTag.id +" CHILD ("+nChild+") LIST ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
				if (bAllRoots) self.model.processingRoot=newParent;
				self.addHtml(self.model.applyTag(childTag,newParent));
				self.addHtml("<!-- END "+childTag.id +" CHILD ("+nChild+") LIST ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
				if (bAllRoots) self.model.processingRoot=rootBackUp;
				nChild++;
			});
			
			self.addHtml("<!-- START POSTHTML ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			self.addHtml(self.tag.getPostHTML());
			self.addHtml("<!-- END POSTHTML ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			if ((self.subType=="row")&&(self.elemsInForEach.getLast().value.getKey()
										!=newParent.getKey())){
				self.addHtml("</td></tr><tr><td>");
			}
			self.addHtml("<!-- END INNER LOOP OF ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			nItem++;
		});
		return self.popHtmlBuffer();
	}

}

