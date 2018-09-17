var RCGDocxSaver=class RCGDocxSaver{ //this kind of definition allows to hot-reload
	constructor(taskManager,htmlElementId,urlBase,nameBase){
		var self=this;
		taskManager.extendObject(self);
		self.sourceHtmlId=htmlElementId;
		self.urlBase=urlBase;
		self.fileNameBase=nameBase;
	}
	process(){
		var self=this;
		self.addStep("Processing content to save Docx",function(){
			var htmlelement = document.getElementById(self.sourceHtmlId);
			debugger;
	    	self.continueTask();
		    });
	    self.continueTask();
	}

}