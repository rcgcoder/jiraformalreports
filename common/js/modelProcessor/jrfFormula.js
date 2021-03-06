var jrfFormula=class jrfFormula extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
//		debugger;
		self.autoAddPostHtml=false;
		self.postProcess="notMe";
	}

	apply(){
		var self=this;
		//debugger;
		// processing inner childs in a buffer to get the plain formula
//		var frmIndHtmlBuffer=self.pushHtmlBuffer();
//		log("Top Buffer("+(frmIndHtmlBuffer)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer).saToString());
//		log("Top Buffer -1("+(frmIndHtmlBuffer-1)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-1).saToString());
//		log("Top Buffer -2("+(frmIndHtmlBuffer-2)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-2).saToString());
		self.addStep("Process all Childs",function(){
//			log("Top Buffer("+(frmIndHtmlBuffer)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer).saToString());
//			log("Top Buffer -1("+(frmIndHtmlBuffer-1)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-1).saToString());
//			log("Top Buffer -2("+(frmIndHtmlBuffer-2)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-2).saToString());
			self.processAllChilds();
//			log("Top Buffer("+(frmIndHtmlBuffer)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer).saToString());
//			log("Top Buffer -1("+(frmIndHtmlBuffer-1)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-1).saToString());
//			log("Top Buffer -2("+(frmIndHtmlBuffer-2)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-2).saToString());
		});
		self.addStep("Process the rest of the formula",function(){
//			log("Top Buffer("+(frmIndHtmlBuffer)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer).saToString());
//			log("Top Buffer -1("+(frmIndHtmlBuffer-1)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-1).saToString());
//			log("Top Buffer -2("+(frmIndHtmlBuffer-2)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-2).saToString());
			self.indPostContentHtmlBuffer=self.pushHtmlBuffer();
			self.addPostHtml();
//			log("Top Buffer("+(frmIndHtmlBuffer)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer).saToString());
//			log("Top Buffer -1("+(frmIndHtmlBuffer-1)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-1).saToString());
//			log("Top Buffer -2("+(frmIndHtmlBuffer-2)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-2).saToString());
			var sContent=self.popHtmlBuffer(self.indInnerContentHtmlBuffer); // getting the formula with possible html tags inside
			self.pushHtmlBuffer();
//			log("Top Buffer("+(frmIndHtmlBuffer)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer).saToString());
//			log("Top Buffer -1("+(frmIndHtmlBuffer-1)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-1).saToString());
//			log("Top Buffer -2("+(frmIndHtmlBuffer-2)+"):"+self.topHtmlBuffer(frmIndHtmlBuffer-2).saToString());
			//var dbgContent=sContent;
			sContent=sContent.saRemoveInnerHtmlTags(); // remove al tags.... there are not allowed
			log("Formula Content previous of replace returns and Vars:"+sContent);
            sContent=replaceAll(sContent,"\n"," ");
            sContent=self.adjustSyntax(sContent);
			var otherParams=self.newReplaceParams();
/*			otherParams.hsValues.add("elem",0);
			otherParams.hsValues.add("root",1);
			otherParams.hsValues.add("model",2);
			otherParams.vValues.push(self.reportElem);
			otherParams.vValues.push(self.model.processingRoot);
			otherParams.vValues.push(self.model);
*/			
			self.variables.pushVar("elem",self.reportElem);
			self.variables.pushVar("root",self.model.processingRoot);
			self.variables.pushVar("model",self.model);
			var sValue=self.getStringReplacedScript(sContent,otherParams);
			self.variables.popVar("elem");
			self.variables.popVar("root");
			self.variables.popVar("model");
/*
			sContent=self.replaceVarsAndExecute(sContent,otherParams);
			if (isArray(sContent)) sContent=sContent.saToString();
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
*/
/*			if (isNaN(sValue)||(!isFinite(sValue))){
				sValue="";
			}
*/			self.addHtml(sValue);
		});
	}

}

