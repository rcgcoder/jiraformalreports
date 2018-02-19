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
			$("#htmlContainerId").html("<hero></hero>");
			self.popCallback(); // finishing the process.
		});
		
		self.addStep("Loading angularjs and typescript inline compiler.... ",function(){
			var arrFiles=[	"ts/demo.ts",
							"js/libs/typescript.min.js",
							"js/libs/typescript.compile.min.js",
							"js/libs/angular.min.js"
						 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		self.continueTask();
	}
}
