var systemjsComposeUrl;
class RCGSystemJSManager{
	constructor(app){
		var self=this;
		self.app=app;
		taskManager.extendObject(self);
	}
	loadEngine(){
		var self=this;
		self.addStep("Loading Systemjs...",function(){
			systemjsComposeUrl=function(sRelativePath){
				var sResult=self.app.composeUrl(sRelativePath);
				log(sResult);
				return sResult;
			}
			$("#"+self.app.htmlContainerId).html(
				`<my-app>
				    loading Systemjs engine... it takes a little time
				  </my-app>
				`);
			var arrFiles=[
				"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
		        "https://unpkg.com/zone.js/dist/zone.js",
		        "https://unpkg.com/zone.js/dist/long-stack-trace-zone.js",
		        "https://unpkg.com/reflect-metadata@0.1.3/Reflect.js",
		        "https://unpkg.com/systemjs@0.19.31/dist/system.js",
//		        "https://cdn.jsdelivr.net/npm/reflect-metadata@0.1.3/Reflect.js",
//		        "https://cdn.jsdelivr.net/npm/systemjs@0.19.31/dist/system.js",
				"systemjs/config.js"
			 ]; //test
			self.app.loadRemoteFiles(arrFiles);
		});
		var systemJSTask;
		systemJSTask=self.addStep("Launching systemjs based interface.... it takes a while",function(){
			System.webapp=self.app;
			System.systemJSTask=systemJSTask;
			System.composeUrl=function(sRelativePath){
				var sResult=self.app.composeUrl(sRelativePath);
				log(sResult);
				return sResult;
			}
/*			System.bindObj=function(angObj){
				if (typeof angObj.name!=="undefined"){
					var theName=angObj.name;
					var sClassName=(angObj.constructor.name).toLowerCase();
					var sFinder=sClassName+'[name="'+theName+'"]';
					var objHtml=$(sFinder);
					objHtml[0].angObject=angObj;
				}
			}
			System.getAngularObject=function(selector){
		        var arrElements=AJS.$(selector);
		        var arrResults=[];
		        for (var i=0;i<arrElements.length;i++){
		        	var obj=arrElements[i];
		        	if (typeof obj.angObject!=="undefined"){
		        		arrResults.push(obj.angObject);
		        	}
		        }
		        if (arrResults.length==1){
		        	return arrResults[0];
		        }
		        return arrResults;
			}
*/			System.postProcess=[];
			System.addPostProcess=function(fnc){
				System.postProcess.push(fnc);
			}
		    System.import('app')
		      .catch(console.error.bind(console));
		});
		self.continueTask();
	}
}