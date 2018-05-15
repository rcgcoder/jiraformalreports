var jrfNoop=class jrfNoop{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
	}
	apply(){
		var self=this;
		var noopIndHtmlBuffer=self.pushHtmlBuffer();
		self.addStep("Processing all Childs of NOOP",function(){
			self.processAllChilds();
		});
		self.addStep("Finalizing the Noop process",function(){
			self.addPostHtml();
			var sContent=self.popHtmlBuffer(noopIndHtmlBuffer);
			sContent=self.replaceVars(sContent);
			self.addHtml(sContent);
			self.continueTask();
		});
	}

}

