var RCGDocxSaver=class RCGDocxSaver{ //this kind of definition allows to hot-reload
	constructor(taskManager){
		var self=this;
		taskManager.extendObject(self);
	}
	process(){
		var self=this;
	    self.addStep("Loading docx templater engine.... ",function(){
	        var arrFiles=[  //"ts/demo.ts",
	        				"js/rcglibs/RCGFileUtils.js",
	                        "js/libs/webodf.js"
	                        ]; //test
	        System.webapp.loadRemoteFiles(arrFiles);
	    });
	    
	    // download the docx template
/*	    self.addStep("Downloading Template",function(){
	       System.webapp.loadRemoteFile("docx/html.docx"); 
	    });
*/	    self.addStep("Processing",function(sRelativePath,templateBase64){
			var odfelement = document.getElementById("ReportResult"),
			odfcanvas = new odf.OdfCanvas(odfelement);
			var sUrl=System.webapp.composeUrl("https://cantabrana.no-ip.org/jfreports/php/test.odt");

			odfcanvas.load(sUrl);
/*	    	log("in processing step:"+templateBase64.length);
	    	var byteArray=toByteArray(templateBase64);
	    	saveDataToFile(byteArray,"testSave.docx","application/vnd.openxmlformats-officedocument.wordprocessingml.document");
*/	    	self.continueTask();
		    });
	    self.continueTask();
	}

}