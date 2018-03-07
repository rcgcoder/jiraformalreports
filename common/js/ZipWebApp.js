class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
	}
	run(){
		log("starting ZipWebApp");
		var self=this;
		self.addStep("Download Image...",function(){
			log("Requesting Image");
			self.loadRemoteFile("img/reports2.jpg");
		});
		self.addStep("changing image...",function(sPath,content){
			log("Image Loaded:"+sPath);
			var image=document.getElementById("jrfSplash");
			image.src = content;
			log("Image changed");
//			$('body').attr('ng-app', 'mySuperAwesomeApp');
			$("#"+self.htmlContainerId).html("<heros></heros>");
			self.popCallback(); // finishing the process.
		});
		
		self.addStep("Loading angularjs and typescript inline compiler and Jira REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/libs/angular.min.js",
							"js/angular/angScript.ts",
							"js/libs/typescript.min.js",
							"js/libs/typescript.compile.min.js",
							"js/rcglibs/Jira/RCGJira.js"
						 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		self.addStep("Getting All Issues.... ",function(){
			var jira=new RCGJira(self);
			jira.getAllIssues();
			jira.getConfluence();
		});
		
		self.continueTask();
	}
}
