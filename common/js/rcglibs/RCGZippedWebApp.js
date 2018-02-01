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
		if (typeof method==="undefined"){
			console.log("you are pushing an undefined callback... be carefull");
		}
		self.stackCallsbacks.push(method);
	}
	popCallback(aArgs){
		var self=this;
		if (self.stackCallsbacks.length>0){
			var theMethod=self.stackCallsbacks.pop();
			var obj=self.object;
			if (obj==""){
				obj=self;
			}
			if (typeof theMethod==="undefined"){
				console.log("¿undefined?");
			}
			var fncApply=function(){
				theMethod.apply(obj,aArgs);
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
	processLastCommitsOfFile(response){
		var self=this;
		var arrCommits=response;
		var lastCommit=arrCommits[0];
		var sCommitLongId=lastCommit.sha;
		var sCommitShortId=sCommitLongId.substring(0,8);
		self.app.popCallback([sCommitShortId]);
	}
	getLastCommitsOfFile(sRelativePath){
		var self=this;
		self.pushCallback(self.processLastCommitsOfFile);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits?path="+sRelativePath);
	}
}

class RCGZippedApp{
	constructor(){
		var self=this;
		self.rootPath="";
		self.prependPath="";
		self.github="";
		self.htmlContainerId="";
		self.urlBase="";
		self.zipAppFile="";
		self.zipLastCommitId="";
		var cmAux=new CallManager(self);
		console.log("ZippedApp Created");
		self.requestFileSystem = window.webkitRequestFileSystem 
								|| window.mozRequestFileSystem 
								|| window.requestFileSystem;
		self.storage="";
		self.loadedFiles={"rcglibs/RCGZippedWebApp.js":true};
		
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
		if (self.prependPath){
			sUrl+="/"+self.prependPath;
		}
		if (sRelativePath!=""){
			sUrl+="/"+sRelativePath;
		}
		return sUrl;
	}
	getContentType(xhr){
		var result={
			isText:false,
			isJS:false,
			isCSS:false,
			isHTML:false,
			isJSON:false,
			isSVG:false,
			isCacheable:true
		}
		var arrContentTypes=xhr.getResponseHeader("content-type").split(";");
		for (var i=0;i<arrContentTypes.length;i++){
			if (arrContentTypes[i]=="application/javascript"){
				result.isText=true;
				result.isJS=true;
				return result;
			} else if (arrContentTypes[i]=="text/html"){
				result.isText=true;
				result.isHTML=true;
				return result;
			} else if (arrContentTypes[i]=="text/css"){
				result.isText=true;
				result.isCSS=true;
				return result;
			} else if (arrContentTypes[i]=="application/json"){
				result.isText=true;
				result.isJSON=true;
				result.isCacheable=false;
				return result;
			} else if (arrContentTypes[i]=="image/svg+xml"){
				result.isText=false;
				result.isSVG=true;
				return result;
			} else if (arrContentTypes[i]=="application/octet-stream"){
				return result;
			}
		}
		return result;
	}
	saveFileToStorage(sRelativePath,sContent,contentType){
		var self=this;
		if ((self.storage!="")
			&&(self.github!="")
			&&(contentType.isCacheable)
			){ // only saves if github is configured and storage engine is working and content is cacheable
			self.storage.set('#GITCOMMIT#'+sRelativePath,self.github.commitId);
			self.storage.set('#GITFORMAT#'+sRelativePath,JSON.stringify(contentType));
			var sStringContent="";
			if (contentType.isText){
				sStringContent=sContent;
			} else {
				sStringContent="stringyfied content";
			}
			self.storage.set(sRelativePath,sStringContent);
			self.storage.save();
		}
	}
	downloadFile(sUrl,sRelativePath){
		var self=this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.onerror=self.loadError;
		xhr.onload = function(e) {
		  if (this.status == 200) {
			  var ct=self.getContentType(xhr);
			  var response="";
			  if (ct.isText){
				  response=this.responseText;
			  } else {
				  response=this.response;
			  }
			  self.saveFileToStorage(sRelativePath,response,ct);
			  self.popCallback([response,xhr,ct,sRelativePath]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		};
		xhr.send();	

	}
	
	addStyleString(cssContent) {
	    var node = document.createElement('style');
	    node.innerHTML = cssContent;
	    document.body.appendChild(node);
	}
	addJavascriptString(jsContent){
		var self=this;
		var oHead=(document.head || document.getElementsByTagName("head")[0]);
	    var oScript = document.createElement("script");
	    oScript.type = "text\/javascript";
	    oScript.onerror = self.loadError;
/*	    oScript.onload = function(){
	    	self.popCallback();
	    }
*/	    oHead.appendChild(oScript);
	    oScript.innerHTML = jsContent;
	}
	processFile(sFileContent,xhr,contentType,sRelativePath){
		var self=this;
	    if (contentType.isJS){ //if filename is a external JavaScript file
	    	self.addJavascriptString(sFileContent);
	    } else if (contentType.isCSS){ //if filename is an external CSS file
	    	self.addStyleString(sFileContent);
	    }
	    self.popCallback([sRelativePath,sFileContent]);
	}
	loadFileFromNetwork(bLoadedFromStorage,sRelativePath,fileContent){
		var self=this;
		if (bLoadedFromStorage) {
			console.log(sRelativePath+" loaded from persistent storage");
			self.popCallback([sRelativePath,fileContent]);
		}
		console.log(sRelativePath+" loaded from network");
		var nPos=sRelativePath.lastIndexOf(".");
		var sExt=sRelativePath.substring(nPos+1,sRelativePath.length).toLowerCase();
		var sUrl=self.composeUrl(sRelativePath);
		self.pushCallback(self.processFile);
    	self.downloadFile(sUrl,sRelativePath);
	}
	
		
	loadFileFromStorage(sRelativePath){
		var self=this;
		if ((self.storage=="")||(self.github=="")){ // if there is not storage initialized or github is not used
			return self.popCallback([false,sRelativePath]);
		}
		// now there is storage and github
		
		// get the last commit id
		var sCommitId=self.github.commitId;
		if (sCommitId==""){ // imposible case.... all the repositories has one or more commits
			return self.popCallback([false,sRelativePath]);
		}
		
		var sVersion=self.storage.get('#GITCOMMIT#'+sRelativePath);
/*		if (sVersion==null){ // there is not a file on storage (¿download independent or download whole zip?
			self.popCallback([false]);
			return;
		}*/
		
		if ((sVersion!=null)&&(sCommitId==sVersion)){ // if stored file version == github version are the same.... use the storage version
			console.log("Loading from storage the File:"+sRelativePath);
			var sFileContent=self.storage.get(sRelativePath);
			var sContentType=self.storage.get('#GITFORMAT#'+sRelativePath);
			var jsonContentType=JSON.parse(sContentType);
			self.pushCallback(function(sRelativePath,fileContents){
					self.popCallback([true,sRelativePath,fileContents]);
			});
			return self.processFileDownload(sFileContent,undefined,jsonContentType,sRelativePath);
		}
		
		// now, it's necesary to download the file.... but ¿it´s posible to download a whole zip?
		if (self.zipAppFile=="") { // there is not zip file configured.... not possible to download zip
			return self.popCallback([false,sRelativePath]);
		}
		
		if ((self.zipLastCommitId!="")&&(self.zipLastCommitId!=sCommitId)) {
			// the last commitId of the zip file differs over the last commit in the repository..
			// the zip file is unusuable
			return self.popCallback([false,sRelativePath]);
		} else if (self.zipLastCommitId!=""){ // then lastCommit of Zip is not the repository lastCommit.. 
			return self.popCallback([false,sRelativePath]);
		}
		
		/* status at this point
		self.zipAppFile!="";
		self.zipLastCommitId=="";
		*/
		// now .... get last commit id of the file
		
		var sGitHubRelativePath=self.zipAppFile;
		if (self.prependPath!=""){
			sGitHubRelativePath=self.prependPath+"/"+sGitHubRelativePath;
		}
		self.pushCallback(function(sFileCommitId){
			self.zipLastCommitId=sFileCommitId;
			if (self.zipLastCommitId==sCommitId){ // deploy whole zip
				return self.popCallback([false,sRelativePath]);
			} else { // deploy only the file
				return self.popCallback([false,sRelativePath]);
			}
		});
		self.github.getLastCommitsOfFile(sGitHubRelativePath);
	}
	
	loadRemoteFile(sRelativePath){
		var self=this;
		self.pushCallback(self.loadFileFromNetwork);
		self.loadFileFromStorage(sRelativePath);
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
		self.loadRemoteFile("js/libs/persist-all-min.js");
	}
	extendFromObject(srcObj){
		var result=this;
		var arrProperties=Object.getOwnPropertyNames(srcObj.__proto__).concat(Object.getOwnPropertyNames(srcObj));
		for (var i=0;i<arrProperties.length;i++){
			var vPropName=arrProperties[i];
			if (vPropName!=="constructor"){
				var vPropValue=srcObj[vPropName];
				//if (isMethod(vPropValue)){
					//if (typeof (result[vPropName])==="undefined"){
						result[vPropName]=vPropValue;
					//}
				//}
			}
		}
	}
	startApplication(){
		var self=this;
		self.pushCallback(function(){
			var webapp=new ZipWebApp();
			self.extendFromObject(webapp);
			self.run();
		});
		self.loadRemoteFile("js/ZipWebApp.js");
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

