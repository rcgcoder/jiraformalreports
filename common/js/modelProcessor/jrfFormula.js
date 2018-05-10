class jrfFormula{
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
	}
	apply(){
		var self=this;
		// processing inner childs in a buffer to get the plain formula
		self.pushHtmlBuffer();
		self.processAllChilds();
		self.addPostHtml();
		var sContent=self.popHtmlBuffer(); // getting the formula with possible html tags inside
		
		sContent=self.model.removeInnerTags(sContent,true); // remove al tags.... there are not allowed
		
		var sFncFormula="var result="+sContent+"; return result;";
		var fncFormula=Function("elem","root",sFncFormula);
		var sValue=fncFormula(self.reportElem,self.model.processingRoot);
		self.addHtml(sValue);
	}

}

