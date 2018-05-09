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
		nChild=0;
		self.tag.getChilds().walk(function(childTag){
			self.addHtml("<!-- START "+childTag.id +" CHILD ("+nChild+") LIST ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			self.addHtml(self.model.applyTag(childTag,self.reportElem));
			self.addHtml("<!-- END "+childTag.id +" CHILD ("+nChild+") LIST ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			nChild++;
		});
		self.addHtml("<!-- START POSTHTML ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
		self.addHtml(self.tag.getPostHTML());
		self.addHtml("<!-- END POSTHTML ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
		
		var sContent=self.popHtmlBuffer();
		sContent=self.model.removeInnerTags(sContent);
		var sFncFormula="var result="+sContent+"; return result;";
		var fncFormula=Function("elem","root",sFncFormulaChild);
		var sValue=fncFormula(self.reportElem,self.model.processingRoot);
		if (self.inFormat=="markdown"){
			sValue=self.model.markdownConverter.makeHtml(sValue); 
		}
		self.addHtml(sValue);
		return self.popHtmlBuffer();
	}

}

