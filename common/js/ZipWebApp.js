class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
	}
	run(){
		console.log("starting ZipWebApp");
		var self=this;
		self.pushCallback(function(sPath,content){
			console.log("Image Loaded:"+sPath);
/*			var jqContainer=$("#"+self.getHtmlContainerID());
			var jqImage=$("#jrfSplash");*/
			var image=document.getElementById("jrfSplash");
			image.src = content;
			console.log("Image changed");
		});
		console.log("Requesting Image");
		self.loadRemoteFile("img/reports2.jpg");
		console.log("Runnin.... background");
//		alert("Running ZipWebApp "); 
	}
}
