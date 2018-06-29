var jrfCondition=class jrfCondition extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.autoAddPostHtml=true;
	}
	apply(){
		var self=this;
		//debugger;
		if (self.ifConditionResult){
			self.addStep("Processing all Childs of NOOP",function(){
				self.processAllChilds();
			});
			self.addStep("Finalizing the Noop process",function(){
				self.addPostHtml();
				var sContent=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
				sContent=self.replaceVars(sContent);
				self.addHtml(sContent);
				self.continueTask();
			});
		}
	}

}

