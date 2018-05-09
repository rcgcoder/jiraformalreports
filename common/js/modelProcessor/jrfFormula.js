class jrfFormula{
	constructor(tag,reportElem,model){
		var self=this;
		self.model=model;
		model.extendObj(self);
		self.tag=tag;
		self.reportElem=reportElem;
	}
	apply(){
		var self=this;
		self.pushHtmlBuffer();
		self.addHtml(self.tag.getPreviousHTML());
		// processing inner childs
		self.pushHtmlBuffer();
		var nChild=0;
		self.tag.getChilds().walk(function(childTag){
			self.addHtml("<!-- START "+childTag.id +" CHILD ("+nChild+") LIST ITEM "+ (nItem) + " IN FORMULA JRF TOKEN -->");
			self.addHtml(self.model.applyTag(childTag,self.reportElem));
			self.addHtml("<!-- END "+childTag.id +" CHILD ("+nChild+") LIST ITEM "+ (nItem) + " IN FORMULA JRF TOKEN -->");
			nChild++;
		});
		self.addHtml("<!-- START POSTHTML IN FORMULA JRF TOKEN -->");
		self.addHtml(self.tag.getPostHTML());
		self.addHtml("<!-- END POSTHTML  IN FORMULA JRF TOKEN -->");
		
		var sContent=self.popHtmlBuffer();
		sContent=self.model.removeInnerTags(sContent);
		var sFncFormula="var result="+sContent+"; return result;";
		var fncFormula=Function("elem","root",sFncFormula);
		var sValue=fncFormula(self.reportElem,self.model.processingRoot);
		if (self.inFormat=="markdown"){
			sValue=self.model.markdownConverter.makeHtml(sValue); 
		}
		self.addHtml(sValue);
		return self.popHtmlBuffer();
	}

}

