var jrfFormula=class jrfFormula{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
	}

	apply(){
		var self=this;
		// processing inner childs in a buffer to get the plain formula
		self.pushHtmlBuffer();
		self.processAllChilds();
		self.addPostHtml();
		var sContent=self.popHtmlBuffer(); // getting the formula with possible html tags inside
		var dbgContent=sContent;
		sContent=self.model.removeInnerTags(sContent,true); // remove al tags.... there are not allowed
		sContent=replaceAll(sContent,"\n"," ");
		var sFncFormula=`
						var elem=_arrRefs_[0];
						var root=_arrRefs_[1];
						var result=`+sContent+`;
						return result;
						`;
		var sValue=executeFunction([self.reportElem,self.model.processingRoot],sFncFormula);
		self.addHtml(sValue);
	}

}

