class ZipWebApp{
	constructor(){
		var self=this;
		self.oneParam="Casa";
		self.twoParam="Coche";
		self.jira="";
	}
	getJira(){
		var self=this;
		if (self.jira==""){
			self.jira=new RCGJira(self);
			self.jira.proxyPath=self.proxyPath;
			self.jira.instance=self.urlBase;
		}
		return self.jira;
	}
	run(){
		log("starting ZipWebApp");
		var self=this;
		self.addStep("Starting Systemjs...",function(){
			$("#"+self.htmlContainerId).html(
				`<my-app>
  	<script src="https://unpkg.com/zone.js/dist/zone.js"></script>
    <script src="https://unpkg.com/zone.js/dist/long-stack-trace-zone.js"></script>
    <script src="https://unpkg.com/reflect-metadata@0.1.3/Reflect.js"></script>
    <script src="https://unpkg.com/systemjs@0.19.31/dist/system.js"></script>
    <script src="config.js"></script>

				    loading...
				  </my-app>
				`);
/*			var arrFiles=[
				"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css",
		        "https://unpkg.com/zone.js/dist/zone.js",
		        "https://unpkg.com/zone.js/dist/long-stack-trace-zone.js",
		        "https://unpkg.com/reflect-metadata@0.1.3/Reflect.js",
		        "https://unpkg.com/systemjs@0.19.31/dist/system.js",
		        "html/config.js"
			 ]; //test
			self.loadRemoteFiles(arrFiles);
*/
		});
/*		self.addStep("Loading angularjs and typescript files and Jira REST Client.... ",function(){
			var arrFiles=[	//"ts/demo.ts",
							"js/angular/angScript.ts",
							"js/rcglibs/Jira/RCGJira.js"
						 ]; //test
			self.loadRemoteFiles(arrFiles);
		});
		
		self.addStep("changing image...",function(sPath,content){
			log("Image Loaded:"+sPath);
			var image=document.getElementById("jrfSplash");
			image.src = content;
			log("Image changed");
//			$('body').attr('ng-app', 'mySuperAwesomeApp');
*/			
/*		    angular
		    	.module("mySuperAwesomeApp", [])
		    	.component("heros", new HerosComponent());
	*/	    /*
		   	var html = '<div class="row dataPane"> Chunk of html elements </div>';
			var trustedHtml = $sce.trustAsHtml(html);
		    var compiledHtml = $compile(trustedHtml)($scope);
		    angular.element(document).append(compiledHtml);
		    */
/*			$("#"+self.htmlContainerId).html(
				'<div ng-controller="Tabs" class="panel panel-default" id="tabs-panel">'+ 
				'  <tabset  class="panel-body">'+
				'    <tab heading="Tab 1"> </tab>'+
				'    <tab heading="Tab 2"> </tab>'+
				'    <tab heading="Tab 3"> </tab>'+
				'  </tabset>'+
				'</div>'
				);
			angular.bootstrap(document, ["mySuperAwesomeApp"]);
		
			self.popCallback(); // finishing the process.
		});
*//*		self.addStep("Getting Confluence Oauth Token", function(){
			var jira=self.getJira();
			jira.proxyPath=self.proxyPath;
			jira.instance=self.urlBase;
			jira.oauthConfluenceConnect();
		});
*/		
/*		self.addStep("Getting All Issues.... ",function(){
			var jira=self.getJira();
			jira.getAllIssues();
		});
*/
/*		self.addStep("Getting All Projects.... ",function(){
			var jira=self.getJira();
			jira.getAllProjects();
		});
		self.addStep("Testing Api Integrations.... ",function(){
			var jira=self.getJira();
			jira.getConfluence();
		});
*/		
		self.continueTask();
	}

}
