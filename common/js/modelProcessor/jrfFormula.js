var jrfFormula=class jrfFormula{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
	}

	apply(){
		var self=this;
		debugger;
		// processing inner childs in a buffer to get the plain formula
		var frmIndHtmlBuffer=self.pushHtmlBuffer();
		self.addStep("Process all Childs",function(){
			self.processAllChilds();
		});
		self.addStep("Process the rest of the formula",function(){
			self.addPostHtml();
			var sContent=self.popHtmlBuffer(frmIndHtmlBuffer); // getting the formula with possible html tags inside
			self.pushHtmlBuffer();
			//var dbgContent=sContent;
			sContent=sContent.saRemoveInnerTags(); // remove al tags.... there are not allowed
			log("Formula Content previous of replace returns and Vars:"+sContent);
			sContent=replaceAll(sContent,"\n"," ");
			sContent=self.replaceVars(sContent);
			var sFncFormula=`
							""; // to close the var result= instruction inserted by executefunction
							var elem=_arrRefs_[0];
							var root=_arrRefs_[1];
							var result=`+sContent+`;
							return result;
							log("Parse done... the rest is not executed")
							// execute function inserts the las ";" automatically
							`;
			var sValue=executeFunction([self.reportElem,self.model.processingRoot],sFncFormula);
/*			if (isNaN(sValue)||(!isFinite(sValue))){
				sValue="";
			}
*/			self.addHtml(sValue);
			self.continueTask();
		});
	}

}

