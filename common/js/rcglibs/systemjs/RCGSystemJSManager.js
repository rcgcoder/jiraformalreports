class RCGSystemJSManager{
	constructor(app){
		self=this;
		self.app=app;
		taskManager.extendObject(self);
	}
	loadEngine(){
		self.addStep("Loading Systemjs...",function(){
			$("#"+self.app.htmlContainerId).html(
				`<my-app>
				    loading...
				  </my-app>
				`);
			var arrFiles=[
				"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
		        "https://unpkg.com/zone.js/dist/zone.js",
		        "https://unpkg.com/zone.js/dist/long-stack-trace-zone.js",
		        "https://unpkg.com/reflect-metadata@0.1.3/Reflect.js",
		        "https://unpkg.com/systemjs@0.19.31/dist/system.js",
		        "systemjs/config.js"
			 ]; //test
			self.app.loadRemoteFiles(arrFiles);
		});
		self.addStep("Launching systemjs based interface.... it takes a while",function(){
			System.composeUrl=function(sRelativePath){
				var newUrl=self.app.composeUrl(sRelativePath);
				return newUrl;
			};
			System.bootStrapFinish=self.createManagedCallback(
					function(){
						log("Bootstrap is finished");
						self.popCallback();
					});
		    System.import('app')
		      .catch(console.error.bind(console));
		});
		self.continueTask();
	}
}