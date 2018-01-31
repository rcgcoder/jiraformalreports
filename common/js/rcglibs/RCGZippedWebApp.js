/*
Class for download a Zip File with a lot of js files.
.... extract files to persistent 
.... load all files to memory
*/

/*
 * First it´s load the other javascript libs.....
 * 
 */

/*
var workerScriptsPath = 'https://rawgit.com/rcgcoder/jiraformalreports/master/src/libs/zip';
zip.workerScripts = {
		  deflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/deflate.js'],
		  inflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/inflate.js']
		};
*/
class CallManager{
	constructor(obj){
		var self=this;
		self.stackCallsbacks=[];
		self.object="";
		self.extendObject(obj);
	}
	pushCallback(method){
		var self=this;
		self.stackCallsbacks.push(method);
	}
	popCallback(aArgs){
		var self=this;
		if (self.stackCallsbacks.length>0){
			var method=self.stackCallsbacks.pop();
			var obj=self.object;
			if (obj==""){
				obj=self;
			}
			var fncApply=function(){
				method.apply(obj,aArgs);
			}
			setTimeout(fncApply);
		}
	}
	extendObject(obj){
		var self=this;
		self.object=obj;
		obj.callManager=self;
		obj.pushCallback=function(method){obj.callManager.pushCallback(method)}; 
		obj.popCallback=function(aArgs){obj.callManager.popCallback(aArgs)}; 
	}
}

class GitHub{
	constructor(){
		var self=this;
		self.repository="";
		self.app="";
		self.arrCommits="";
		self.lastCommit="";
		self.commitId="";
		var cmAux=new CallManager(self);
	}
	loadError(oError){
	    throw new URIError("The file " + oError.target.src + " is not accessible.");
	}
	apiCall(sTargetUrl,sPage,sType,callback){
		var self=this;
		var sUrl=sTargetUrl;
		if ((sPage!="")&&(typeof sPage!=="undefined")){
			sUrl+="?page="+sPage
		}
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.responseType = 'json';
		if (typeof sType!=="undefined"){
			xhr.responseType=sType;
		}
		xhr.onerror=self.loadError;
		xhr.onload = function(e) {
		  var nRemaining=xhr.getResponseHeader("X-RateLimit-Remaining");
		  console.log("Remaining GitHub Pets:"+nRemaining);
		  if (this.status == 302) {
			  var ghLink=xhr.getResponseHeader("Location");
			  self.apiCall(ghLink);
		  } else if (this.status == 200) {
			  self.popCallback([this.response,xhr]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		};
		xhr.send();	
	}
	processCommitsPage(response,xhr){
	   var self=this;
	   self.arrCommits = self.arrCommits.concat(response);
	   ghLink=xhr.getResponseHeader("Links");
	   if ((ghLink!="")&&(ghLink!=null)){
		  var arrLinks=ghLink.split(",");
		  var nextLink=arrLinks[0];
		  arrLinks=nextLink.split(";");
		  if (arrLinks[1]==' rel="next"'){
			  arrLinks=arrLinks[0].split('>');
			  arrLinks=arrLinks[0].split('=');
			  var nextPage=arrLinks[1];
			  self.pushCallback(self.processCommitsPage);
			  self.apiCall("https://api.github.com/repos/"+self.repository+"/commits",nextPage);
		  } else {
			  self.app.popCallback([self.arrCommits]);
		  }
	   } else {
		  self.app.popCallback([self.arrCommits]);
	   }
	}
	getCommits(){
		var self=this;
		var iPage=0;
		self.arrCommits=[];
		self.pushCallback(self.processCommitsPage);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits");
	}
	processLastCommit(response){
		var self=this;
		self.lastCommit=response;
		var sCommitLongId=self.lastCommit.sha;
		var sCommitShortId=sCommitLongId.substring(0,8);
		self.commitId=sCommitShortId;
		self.app.popCallback([self.commitId]);
	}
	updateLastCommit(){
		var self=this;
		self.pushCallback(self.processLastCommit);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits/master");
	}
	processZipBall(){
		
	}
	getZipApp(){
		var self=this;
		self.pushCallback(self.processZipBall);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/zipball/master");
	}
}

class RCGZippedApp{
	constructor(){
		var self=this;
		self.rootPath="https://cdn.rawgit.com";
		self.github="";
		self.htmlContainerId="";
		self.urlBase="";
		var cmAux=new CallManager(self);
		console.log("ZippedApp Created");
		self.requestFileSystem = window.webkitRequestFileSystem 
								|| window.mozRequestFileSystem 
								|| window.requestFileSystem;
		self.storage="";
		self.loadedFiles={"common/rcglibs/RCGZippedWebApp.js":true};
		
	}
	useGitHub(sRepository){
		var self=this;
		self.github=new GitHub();
		self.github.app=this;
		self.github.repository=sRepository;
	}
	setHtmlContainerID(sHtmlElementId){
		self.htmlContainerId=sHtmlElementId;
	}
	
	
	composeUrl(sRelativePath){
		var self=this;
		var sUrl=self.rootPath;
		if (self.github!=""){
			if (self.github!=""){
				sUrl+="/"+self.github.repository;
			}
			if (self.commitId!=""){
				sUrl+="/"+self.github.commitId;
			}
		}
		if (sRelativePath!=""){
			sUrl+="/"+sRelativePath;
		}
		return sUrl;
	}

	downloadScript(sUrl){
		var self=this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.onerror=self.loadError;
		xhr.onload = function(e) {
		  if (this.status == 200) {
			  var sResponseText=this.responseText;
			  self.popCallback([sResponseText,xhr]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		};
		xhr.send();	

	}
	importScript(sJS) {
		var self=this;
		var oHead=(document.head || document.getElementsByTagName("head")[0]);
	    var oScript = document.createElement("script");
	    oScript.type = "text\/javascript";
	    oScript.onerror = self.loadError;
/*	    oScript.onload = function(){
	    	self.popCallback();
	    }
*/	    oHead.appendChild(oScript);
	    oScript.innerHTML = sJS;
    	self.popCallback([sJS]);
	    
	};	
	
	loadFileFromStorage(sRelativePath){
		var self=this;
		if (self.storage!=""){
			var sVersion=self.storage.get(sRelativePath+'-version');
			if (sVersion==self.commitId){
				var jsSRC=self.storage.get(sRelativePath);
				self.importScript(jsSRC);
				return true;
			}
		}
		return false;
	}
	saveFileToStorage(sRelativePath,sContent){
		var self=this;
		if (self.storage!=""){
			self.storage.set(sRelativePath+'-version',self.commitId);
			self.storage.set(sRelativePath,sContent);
			self.storage.save();
		}
	}
	
	loadRemoteFile(sRelativePath){
		var self=this;
		if (self.loadFileFromStorage(sRelativePath)){
			return;
		}
		var nPos=sRelativePath.lastIndexOf(".");
		var sExt=sRelativePath.substring(nPos+1,sRelativePath.length).toLowerCase();
		var sUrl=self.composeUrl(sRelativePath);
		
	    if (sExt=="js"){ //if filename is a external JavaScript file
	    	self.pushCallback(function(sContent){
	    		self.saveFileToStorage(sRelativePath,sContent);
	    		self.popCallback();
	    	})
	    	self.pushCallback(self.importScript);
	    	self.downloadScript(sUrl);
	    } else if (sExt=="css"){ //if filename is an external CSS file
	        var fileref=document.createElement("link");
	        fileref.setAttribute("rel", "stylesheet");
	        fileref.setAttribute("type", "text/css");
	        fileref.setAttribute("href", sUrl);
	        document.getElementsByTagName("head")[0].appendChild(fileref);
	    }
	}
	loadPersistentStorage() {
		var self=this;
		// load persistent store after the DOM has loaded
		Persist.remove('cookie');
		Persist.remove('gears');
		Persist.remove('flash');
		Persist.remove('globalstorage');
		Persist.remove('ie');
		self.storage = new Persist.Store('JiraFormalReports');
		self.popCallback();
	}
	
	startPersistence(){
		var self=this;
		self.pushCallback(self.loadPersistentStorage);
		self.loadRemoteFile("common/js/libs/persist-all-min.js");
	}
	startApplication(){
		var self=this;
		self.pushCallback(function(){
			var urlAux=urlObject();
		});
		self.loadRemoteFile("common/js/libs/urlobject.js");
	}
	run(){
		var self=this;
		self.pushCallback(self.startApplication);
		self.pushCallback(self.startPersistence);
		if (self.github!=""){
			self.github.updateLastCommit();
		}
	}
	onerror(message) {
		alert(message);
	}
	createTempFile(callback) {
		var self=this;
		var tmpFilename = "tmp.dat";
		self.requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, 
			function(filesystem) {
				function create() {
					filesystem.root.getFile(tmpFilename, {
						create : true
					}, function(zipFile) {
						callback(zipFile);
					});
				}
				filesystem.root.getFile(tmpFilename, null, function(entry) {
					entry.remove(create, create);
				}, create);
			});
	}
	deploy(theZips,callback,storage){
		log("Deploying WebApp");
		var arrZips;
		if (!isArray(theZips)){
			arrZips=[theZips];
		} else {
			arrZips=theZips;
		}
		var model=new ZipModel();
		model.storage=storage;
/*		function download(entry, li, a) {
			model.getEntryFile(entry
								, creationMethodInput.value
								, function(blobURL) {
				var clickEvent = document.createEvent("MouseEvent");
				if (unzipProgress.parentNode)
					unzipProgress.parentNode.removeChild(unzipProgress);
				unzipProgress.value = 0;
				unzipProgress.max = 0;
				clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				a.href = blobURL;
				a.download = entry.filename;
				a.dispatchEvent(clickEvent);
			}, function(current, total) {
				unzipProgress.value = current;
				unzipProgress.max = total;
				li.appendChild(unzipProgress);
			});
		}
*/		var fncLoadZip=function(iZip){
			if (iZip>=arrZips.length){
				callback();
			} else {
				var sZipUrl=arrZips[iZip];
				log("Download Zip File:"+sZipUrl);
				model.downloadAndGetEntries(sZipUrl, function(entries) {
					entries.forEach(function(entry) {
						log("Entry read:"+entry.filename);
/*						var li = document.createElement("li");
						var a = document.createElement("a");
						a.textContent = entry.filename;
						a.href = "#";
						a.addEventListener("click", function(event) {
							if (!a.download) {
								download(entry, li, a);
								event.preventDefault();
								return false;
							}
						}, false);
						li.appendChild(a);
						fileList.appendChild(li);*/
					});
					fncLoadZip(iZip+1);
				});
			}
		}
		fncLoadZip(0);
	}
}

class ZipModel{
	//zip.useWebWorkers=false;
	constructor(){
		this.URL = window.webkitURL || window.mozURL || window.URL;
		this.md5="";
		this.ZipFile="";
		this.ZipData="";
	}
	
	downloadAndGetEntries(urlZipFile,onend){
		var self=this;
		self.ZipFile=urlZipFile;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', urlZipFile, true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
		  if (this.status == 200) {
		    var myBlob = this.response;
		    self.ZipData=myBlob;
		    var md5=SparkMD5.ArrayBuffer.hash(myBlob);
		    self.md5=md5;
		    // myBlob is now the blob that the object URL pointed to.
		    self.getEntries(myBlob,onend);
		  }
		};
		xhr.send();	
	}
		
	getEntries(file, onend) {
		zip.createReader(new zip.BlobReader(file), function(zipReader) {
			zipReader.getEntries(onend);
		}, onerror);
	}
	getEntryFile(entry, creationMethod, onend, onprogress) {
		var writer, zipFileEntry;

		function getData() {
			entry.getData(writer, function(blob) {
				var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
				onend(blobURL);
			}, onprogress);
		}

		if (creationMethod == "Blob") {
			writer = new zip.BlobWriter();
			getData();
		} else {
			createTempFile(function(fileEntry) {
				zipFileEntry = fileEntry;
				writer = new zip.FileWriter(zipFileEntry);
				getData();
			});
		}
	}
}

/*
 * 

	 <script type="text/javascript" src="https://cdn.rawgit.com/rcgcoder/jiraformalreports/2f01650a/src/libs/jquery-3.3.1.min.js"></script>
	 <script type="text/javascript" src="js/libs/zip/zip.js"></script>
	 <script type="text/javascript" src="js/libs/zip/zip-ext.js"></script>
	 <script type="text/javascript" src="js/libs/zip/zip-fs.js"></script>
	 <script type="text/javascript" src="js/libs/spark-md5.min.js"></script>
	 <script type="text/javascript" src="js/libs/persist-all-min.js"></script>
<!--  	 <script type="text/javascript" src="https://rawgit.com/rcgcoder/jiraformalreports/master/src/libs/zip/inflate.js"></script>
	 <script type="text/javascript" src="https://rawgit.com/rcgcoder/jiraformalreports/master/src/libs/zip/deflate.js"></script>
-->
<!--  	 <script type="text/javascript" src="https://cdn.rawgit.com/rcgcoder/jiraformalreports/6f5cb157/src/rcglibs/RCGutils.js"></script>
-->	 
	 <script type="text/javascript" src="js/RCGBaseUtils.js"></script>
	 <script type="text/javascript" src="js/RCGLogUtil.js"></script>
	 <script type="text/javascript" src="js/RCGGitHub.js"></script>


run(theZips,bFileSystem){
}


(function(obj) {



	(function() {
		var fileInput = document.getElementById("file-input");
		var unzipProgress = document.createElement("progress");
		var fileList = document.getElementById("file-list");
		var creationMethodInput = document.getElementById("creation-method-input");


		if (typeof requestFileSystem == "undefined")
			creationMethodInput.options.length = 1;
		fileInput.addEventListener('change', function() {
			fileInput.disabled = true;
			model.getEntries(fileInput.files[0], function(entries) {
				fileList.innerHTML = "";
				entries.forEach(function(entry) {
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.textContent = entry.filename;
					a.href = "#";
					a.addEventListener("click", function(event) {
						if (!a.download) {
							download(entry, li, a);
							event.preventDefault();
							return false;
						}
					}, false);
					li.appendChild(a);
					fileList.appendChild(li);
				});
			});
		}, false);
	})();




})(this);


		var xhr = new XMLHttpRequest();
		xhr.open('GET', "https://api.github.com/repos/rcgcoder/jiraformalreports/commits/master", true);
		xhr.responseType = 'json';
		xhr.onload = function(e) {
		  if (this.status == 200) {
		    var myBlob = this.response;
		    self.ZipData=myBlob;
		    var md5=SparkMD5.ArrayBuffer.hash(myBlob);
		    self.md5=md5;
		    // myBlob is now the blob that the object URL pointed to.
		    self.getEntries(myBlob,onend);
		  }
		};
		xhr.send();	

	 
	 
	 
	 
	 	var storage;
	
		function loadPersistentStorage() {
		   // load persistent store after the DOM has loaded
		   Persist.remove('cookie');
		   Persist.remove('gears');
		   Persist.remove('flash');
		   Persist.remove('globalstorage');
		   Persist.remove('ie');
		   storage = new Persist.Store('JiraFormalReports');
		}



*/

