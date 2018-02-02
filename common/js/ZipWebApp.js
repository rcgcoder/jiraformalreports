class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
			
	}
	run(){
		var self=this;
		self.pushCallback(function(sPath,content){
/*			var jqContainer=$("#"+self.getHtmlContainerID());
			var jqImage=$("#jrfSplash");*/
			var image=document.getElementById("jrfSplash");
			image.src = 'data:image/bmp;base64,'+content;
		});
		self.loadRemoteFile("img/reports2.jpg");
		alert("Running ZipWebApp ");
	}
}