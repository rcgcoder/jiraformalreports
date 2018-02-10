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
		});
		log("Requesting Image");
		self.loadRemoteFile("img/reports2.jpg");
		log("Running.... background");
//		alert("Running ZipWebApp "); 
	}
}
