class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
	}
	run(){
		log("starting ZipWebApp");
		var self=this;
		self.pushCallback(function(sPath,content){
			log("Image Loaded:"+sPath);
/*			var jqContainer=$("#"+self.getHtmlContainerID());
			var jqImage=$("#jrfSplash");*/
			var image=document.getElementById("jrfSplash");
			image.src = content;
			log("Image changed");
			self.popCallback(); // finishing the process.
		});
		log("Requesting Image");
		var arrFiles=["img/reports2.jpg",
						"ts/demo.ts",
						"js/libs/typescript.min.js",
						"js/libs/typescript.compile.min.js"
					 ];
		self.loadRemoteFiles(arrFiles);
		log("Running.... background");
//		alert("Running ZipWebApp "); 
	}
}
