var RCGDocxSaver=class RCGDocxSaver{ //this kind of definition allows to hot-reload
	constructor(taskManager){
		var self=this;
		taskManager.extendObject(self);
	}
	process(){
		var self=this;
	    self.addStep("Loading docx templater engine.... ",function(){
	        var arrFiles=[  //"ts/demo.ts",
	                        "js/libs/docxtemplater.v3.6.3.js"
	                        ]; //test
	        System.webapp.loadRemoteFiles(arrFiles);
	    });
	    
	    // download the docx template
	    self.addStep("Downloading Template",function(){
	       System.webapp.loadRemoteFile("docx/html.docx"); 
	    });
	    self.addStep("Processing",function(template){
	    	log("in processing step:"+template.length);
	    	self.continueTask();
		    });
	    self.continueTask();
	}

}