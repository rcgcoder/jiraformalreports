/*
Class for download a Zip File with a lot of js files.
.... extract files to persistent 
.... load all files to memory
*/

/*
 * First it´s load the other javascript libs.....
 * 
 */



class CallManager{
	constructor(obj){
		var self=this;
		self.stackCallsbacks=[];
		self.object="";
		self.extendObject(obj);
		self.asyncPops=false;
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
			if (self.asyncPops) {
				setTimeout(fncApply);
			} else {
				fncApply();
			}
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

class ZipDeploy{
	constructor(relativePath,zipUrl){
		var self=this;
		self.relativePath=relativePath;
		self.url=zipUrl;
		self.imports=[];
		self.commitId="";
		self.commitDate="";
		self.deployedCommitId="";
		self.deployedDate="";
	}
}


class GitHub{
	constructor(app){
		var self=this;
		self.repository="";
		self.branch="";
		self.app=app;
		self.arrCommits="";
		self.lastCommit="";
		self.lastCommitDate="";
		self.commitId="";
		var cmAux=new CallManager(self);
	}
	loadError(oError){
	    throw new URIError("The file " + oError.target.src + " is not accessible.");
	}
	apiCall(sTargetUrl,sPage,sType,callback,arrHeaders){
		var self=this;
		var sUrl=sTargetUrl;
		if ((sPage!="")&&(typeof sPage!=="undefined")){
			if (sUrl.indexOf("?")>0){
				sUrl+="&page="+sPage
			} else {
				sUrl+="?page="+sPage
			}
		}
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.responseType = 'json';
		if (typeof sType!=="undefined"){
			xhr.responseType=sType;
		}
		if (typeof arrHeaders!=="undefined"){
			for (var i=0;i<arrHeaders.length;i++){
				xhr.setRequestHeader(arrHeaders[i].key, arrHeaders[i].value);
			}
		}
		xhr.onerror=self.loadError;
		xhr.onload = function(e) {
		  var nRemaining=xhr.getResponseHeader("X-RateLimit-Remaining");
		  console.log("Remaining GitHub Pets:"+nRemaining);
		  if (this.status == 302) {
			  var ghLink=xhr.getResponseHeader("Location");
			  self.apiCall(ghLink);
		  } else if (this.status == 200) {
			  self.popCallback([this.response,xhr,sTargetUrl,arrHeaders]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		};
		xhr.send();	
	}
	processCommitsPage(response,xhr,url,arrHeaders){
	   var self=this;
	   var sUrl=url;
	   if (typeof sUrl==="undefined"){
		   sUrl="https://api.github.com/repos/"+self.repository+"/commits";
	   }
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
			  self.apiCall(sUrl,nextPage,undefined,undefined,arrHeaders);
		  } else {
			  self.app.popCallback([self.arrCommits]);
		  }
	   } else {
		  self.app.popCallback([self.arrCommits]);
	   }
	}
	getCommits(fromDate){
		var self=this;
		var iPage=0;
		self.arrCommits=[];
		if (typeof fromDate==="undefined"){
			self.pushCallback(self.processCommitsPage);
			self.apiCall("https://api.github.com/repos/"+self.repository+"/commits");
		} else {
			self.pushCallback(self.processCommitsPage);
			var arrHeaders=[
				{key:"Accept",value:"application/vnd.github.cloak-preview"}
				]
			var sDate = new Date(1331209044000).toISOString();
			self.apiCall("https://api.github.com/search/commits?q=repo:rcgcoder/jiraformalreports+committer-date:>"+sDate,arrHeaders);
		}
	}
	processLastCommit(response){
		var self=this;
		self.lastCommit=response;
		var sCommitLongId=self.lastCommit.sha;
		var sCommitShortId=sCommitLongId.substring(0,8);
		self.commitId=sCommitShortId;
		self.commitDate=(new Date(self.lastCommit.commit.author.date)).getTime();
		self.app.popCallback([self.commitId,self.commitDate]);
	}
	updateLastCommit(){
		var self=this;
		self.pushCallback(self.processLastCommit);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits/master");
	}
	updateAllCommits(deployZips){
		var self=this;
		if (typeof relativePaths!="undefined"){
			self.pushCallback(function(arrCommits){
				self.app.popCallback([self.commitId,arrCommits]);
			});
			self.pushCallback(function(){
				self.getLastCommitOfFiles(relativePaths);
			});
		}
		self.updateLastCommit();
	}
	processLastCommitOfFile(response){
		var self=this;
		var arrCommits=response;
		var lastCommit=arrCommits[0];
		var sCommitLongId=lastCommit.sha;
		var sCommitShortId=sCommitLongId.substring(0,8);
		var sCommitDate=(new Date(lastCommit.commit.author.date)).getTime();
		self.app.popCallback([sCommitShortId,sCommitDate]);
	}
	getLastCommitOfFile(sRelativePath){
		var self=this;
		self.pushCallback(self.processLastCommitOfFile);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits?path="+sRelativePath);
	}
	updateDeployZipCommits(deployZips,iFile){
		var self=this;
		if (iFile>=deployZips.length){
			self.app.popCallback();
		} else {
			self.app.pushCallback(function(sCommitId,sCommitDate){
				deployZips[iFile].commitId=sCommitId;
				deployZips[iFile].commitDate=sCommitDate;
				self.updateDeployZipCommits(deployZips,iFile+1);
			});
			self.getLastCommitOfFile(deployZips[iFile].relativePath);
		}
	}
	getLastCommitOfDeploys(deployZips){
		this.updateDeployZipCommits(deployZips,0);
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
		self.DeployZips=[];
		self.lastDeployInfo="";
		self.localStorageMaxSize=200*1024*1024; // 200 MBytes by default
		var cmAux=new CallManager(self);
		console.log("ZippedApp Created");
		self.requestFileSystem = window.webkitRequestFileSystem 
								|| window.mozRequestFileSystem 
								|| window.requestFileSystem;
		self.storage="";
		self.loadedFiles={"rcglibs/RCGZippedWebApp.js":true};
		
	}
	useGitHub(sRepository,branch){
		var self=this;
		self.github=new GitHub(self);
		self.github.repository=sRepository;
		if (typeof branch!=="undefined"){
			self.github.branch=branch;
		}
	}
	addDeployZip(relativePath,arrImportPaths){
		var objDeploy=new ZipDeploy(relativePath,"");
		if (typeof arrImportPaths!=="undefined"){
			if (!Array.isArray(arrImportPaths)){
				objDeploy.imports.push(arrImportPaths);
			} else {
				objDeploy.imports=arrImportPaths;
			}
		}
		this.DeployZips.push(objDeploy);
	}
	setHtmlContainerID(sHtmlElementId){
		self.htmlContainerId=sHtmlElementId;
	}
	getHtmlContainerID(){
		return self.htmlContainerId;
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

	getContentTypeFromExtension(fileName){
		var result={
			isText:false,
			isJS:false,
			isCSS:false,
			isHTML:false,
			isJSON:false,
			isSVG:false,
			isIMG:false,
			isCacheable:true,
			commitId:""
		}
		var nPos=fileName.lastIndexOf(".");
		var sExt=fileName.substring(nPos+1,fileName.length).toLowerCase();
		if (sExt=="js"){
			result.isText=true;
			result.isJS=true;
			return result;
		} else if (sExt=="html"){
			result.isText=true;
			result.isHTML=true;
			return result;
		} else if (sExt=="css"){
			result.isText=true;
			result.isCSS=true;
			return result;
		} else if (sExt=="json"){
			result.isText=true;
			result.isJSON=true;
			result.isCacheable=false;
			return result;
		} else if (sExt=="svg"){
			result.isText=false;
			result.isSVG=true;
			return result;
		} else if (sExt=="jpg"){
			result.isText=false;
			result.isIMG=true;
			return result;
		} else {
			return result;
		}
		return result;
	}
	
	getContentType(xhr){
		var result={
			isText:false,
			isJS:false,
			isCSS:false,
			isHTML:false,
			isJSON:false,
			isSVG:false,
			isCacheable:true,
			commitId:""
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
			} else if (arrContentTypes[i]=="image/jpeg"){
				result.isText=false;
				result.isIMG=true;
				return result;
			} else if (arrContentTypes[i]=="application/octet-stream"){
				return result;
			}
		}
		return result;
	}
	saveFileToStorage(sRelativePath,content,contentType){
		var self=this;
		var sStringContent="";
		if (contentType.isText){
			sStringContent=content;
		} else {
			var u8Arr = new Uint8Array(content);
			/*for (var xi=0;xi<16;xi++){
				log("u8a["+xi+"]:"+arr[xi]);
			}*/
			var sB64=fromByteArray(u8Arr);
			/*for (var xi=0;xi<16;xi++){
				log("b64["+xi+"]:"+sB64[xi]);
			}*/
			//console.log("B64: " + sB64.length);
			sStringContent=sB64;
		}
		if ((self.storage!="")
			&&(self.github!="")
			&&(contentType.isCacheable)
			){ // only saves if github is configured and storage engine is working and content is cacheable
			/*contentType.commitId=self.github.commitId;
			contentType.commitDate=
			*/
			contentType.saveDate=(new Date()).getTime();
			self.storage.set('#FILEINFO#'+sRelativePath,JSON.stringify(contentType));
			//self.storage.set(sRelativePath,sStringContent);
			self.storage.save();
			filesystem.SaveFile(sRelativePath,sStringContent,
						function(e){
							self.popCallback([sStringContent]);
						},
						function(e){
							self.popCallback([""]);
						});
			return sStringContent;
		}
		self.popCallback([sStringContent]);
		return sStringContent;
	}
	downloadFile(sUrl,sRelativePath){
		var self=this;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.onerror=self.loadError;
		xhr.responseType = 'arraybuffer';
		xhr.onload = function(e) {
		  if (this.status == 200) {
			  console.log("Downloaded "+sRelativePath);
			  var ct=self.getContentType(xhr);
			  var response="";
			  var toSave="";
			  if (ct.isText){
				  var arr=new Uint8Array(this.response);
				  toSave = String.fromCharCode.apply(null,arr);
			  } else {
				  toSave = this.response;
			  }
			  self.pushCallback(function(sContent){
				  self.popCallback([sContent,xhr,ct,sRelativePath]);
			  })
			  ct.commitId=self.github.commitId;
			  ct.commitDate=self.github.commitDate;
			  ct.saveDate=(new Date()).getTime();
			  var sResult=self.saveFileToStorage(sRelativePath,toSave,ct);
		  } else {
			  console.log("Error downloading "+sRelativePath);
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
	processFile(content,xhr,contentType,sRelativePath){
		var self=this;
		var auxContent=content;
	    if (contentType.isJS){ //if filename is a external JavaScript file
	    	self.addJavascriptString(content);
	    } else if (contentType.isCSS){ //if filename is an external CSS file
	    	self.addStyleString(content);
	    } else if (contentType.isIMG){
	    	auxContent='data:image/bmp;base64,'+auxContent;
	    }
	    self.popCallback([sRelativePath,auxContent]);
	}
	loadFileFromNetwork(bLoadedFromStorage,sRelativePath,fileContent){
		var self=this;
		if (bLoadedFromStorage) {
			console.log(sRelativePath+" loaded from persistent storage");
			return self.popCallback([sRelativePath,fileContent]);
			
		}
		console.log(sRelativePath+" loaded from network");
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
		
		var sContentType=self.storage.get('#FILEINFO#'+sRelativePath);
		//var sVersion=self.storage.get('#GITCOMMIT#'+sRelativePath);
/*		if (sContentType==null){ // there is not a file on storage (¿download independent or download whole zip?
			self.popCallback([false]);
			return;
		}*/

		
		if (sContentType!=null) {
			var jsonContentType=JSON.parse(sContentType);
			var sVersion=jsonContentType.commitId;
			if (sCommitId==sVersion){ // if stored file version == github version are the same.... use the storage version
				console.log("Loading from storage the File:"+sRelativePath);

				self.pushCallback(function(sFileContent){
					//var sFileContent=self.storage.get(sRelativePath);
					self.pushCallback(function(sRelativePath,fileContents){
							self.popCallback([true,sRelativePath,fileContents]);
					});
					return self.processFile(sFileContent,undefined,jsonContentType,sRelativePath);
				});
				return filesystem.ReadFile(sRelativePath,
						function(sStringContent){
							self.popCallback([sStringContent]);
						},
						function(e){
							self.popCallback([""]);
						});
			}
		}
		return self.popCallback([false,sRelativePath]);
/*		
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
		
		// status at this point
		// self.zipAppFile!="";
		// self.zipLastCommitId=="";
		
		// now .... get last commit id of the file
		
		var arrGitHubRelativePath=self.zipAppFile;
		if (!Array.isArray(sGitHubRelativePath)){
			arrGitHubRelativePath=[arrGitHubRelativePath];
		}
		
		var fncCallbackLastCommitOfFile=function(sFileCommitId){
			self.zipLastCommitId=sFileCommitId;
			if (self.zipLastCommitId!=sCommitId){ // deploy only the file
				return self.popCallback([false,sRelativePath]);
			} else { // deploy whole zip			
				var arrFiles=["js/libs/jquery-3.3.1.min.js",
							  "js/libs/zip/zip.js"
//							  ,"js/libs/zip/zip-ext.js"
							  ];
				
				self.pushCallback(function(){
					self.loadFileFromStorage(sRelativePath);
				});
				self.pushCallback(self.deploy);
				self.loadRemoteFiles(arrFiles);
			}
			
		}
		
		if (self.prependPath!=""){
			sGitHubRelativePath=self.prependPath+"/"+sGitHubRelativePath;
		}
		self.pushCallback(fncCallbackLastCommitOfFile);
		self.github.getLastCommitsOfFile(arrGitHubRelativePath);
		*/
	}
	
	loadRemoteFile(sRelativePath){
		var self=this;
		self.pushCallback(self.loadFileFromNetwork);
		self.loadFileFromStorage(sRelativePath);
	}
	loadRemoteFileIteration(arrRelativePaths,iFile){
		var self=this;
		var iFileAux=iFile;
		if (iFileAux>=arrRelativePaths.length){
			return self.popCallback([iFileAux-1]);
		}
		self.pushCallback(function(){
			self.loadRemoteFileIteration(arrRelativePaths,(iFileAux+1));
		})
		self.pushCallback(self.loadFileFromNetwork);
		self.loadFileFromStorage(arrRelativePaths[iFileAux]);
	}
	loadRemoteFiles(arrRelativePaths){
		var self=this;
		self.loadRemoteFileIteration(arrRelativePaths,0);
	}
	checkForDeploys(iFile){
		var self=this;
		var tLastDeploy=0;
		if (self.lastDeployInfo!=""){
			tLastDeploy=self.lastDeployInfo.date;
		}
		var iZip=0;
		if (typeof iFile!=="undefined"){
			iZip=iFile;
		}
		if (iZip>=self.DeployZips.length){
			return self.popCallback();
		}
		var bNotUpdate=true;
		var theDeploy=self.DeployZips[iZip];
		if ((theDeploy.deployedDate=="")  // never deployed
			||
		   (theDeploy.commitDate>theDeploy.deployedDate)){ // new release
			// needs to be deployed
			bNotUpdate=false;
			self.pushCallback(function(){
				self.checkForDeploys(iZip+1);
			});
			self.deploy(theDeploy);
		} else {
			console.log("the deploy: "+ theDeploy.relativePath+ " is up to date");
			self.checkForDeploys(iZip+1);
		}
	}
	updateFilesFromCommits(){
		var self=this;
		var minZipCommitDate;
		for (var i=0;i<self.DeployZips.length;i++){
			var theDeploy=self.DeployZips[i];
			if (i==0){
				minZipCommitDate=theDeploy.commitDate;
			} else if (minZipCommitDate>theDeploy.commitDate){
				minZipCommitDate=theDeploy.commitDate;
			}
		}
		self.pushCallback(function(arrCommits){
			console.log("Test");
		});
		self.github.getCommits(minZipCommitDate);

		
	}
	updateDeployZips(){
		var self=this;
		var sTotalDeployInfo=self.storage.get('#FILEINFO#'+"LastDeployInfo");
		var oTotalDeployInfo="";
		if ((sTotalDeployInfo!=null)&&(sTotalDeployInfo!="")&&(typeof sTotalDeployInfo!=="undefined")){
			oTotalDeployInfo=JSON.parse(sTotalDeployInfo);
		} 
		self.lastDeployInfo=oTotalDeployInfo;
		for (var i=0;i<self.DeployZips.length;i++){
			var theDeploy=self.DeployZips[i];
			var zipUrl=self.composeUrl(theDeploy.relativePath);
			theDeploy.url=zipUrl;
			var sDeployInfo=self.storage.get('#FILEINFO#'+theDeploy.relativePath);
			if (sDeployInfo!=null) {
				var deployInfo=JSON.parse(sDeployInfo);
				theDeploy.deployedCommitId=deployInfo.deployedCommitId;
				theDeploy.deployedDate=deployInfo.deployedDate;
			}
		}
		self.pushCallback(self.updateFilesFromCommits);
		self.pushCallback(self.checkForDeploys);
		self.github.getLastCommitOfDeploys(self.DeployZips);
	}
	loadPersistentStorage() {
		var self=this;
		// load persistent store after the DOM has loaded
		Persist.remove('cookie');
		Persist.remove('gears');
		Persist.remove('flash');
		Persist.remove('globalstorage');
		Persist.remove('ie');
		self.storage = new Persist.Store('JiraFormalReports',
							{
							defer:true,
							size:self.localStorageMaxSize
							});
		InitializeFileSystem(function(){self.popCallback();},self.localStorageMaxSize);
	}
	startPersistence(){
		var self=this;
		var arrFiles=["js/libs/persist-all-min.js",
					  "js/rcglibs/RCGPersist.js",
	  		  		  "js/libs/b64.js"
			  		  ];
		self.pushCallback(self.updateDeployZips)
		self.pushCallback(self.loadPersistentStorage);
		self.loadRemoteFiles(arrFiles);
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
	saveZipEntries(arrEntries,iEntry){
		var self=this;
		var iAct=iEntry;
		if (typeof iEntry==="undefined"){
			iAct=0;
		}
		if (iAct>=arrEntries.length){
			return self.popCallback();
		} 
		var params=arrEntries[iAct];
		var model=params.model;
		var entry=params.entry;
		var fncSaveBlob=function (blob){
			var reader = new FileReader();
			reader.onload = function(e) {
				  var content = reader.result;
				  self.pushCallback(function (){
					  self.saveZipEntries(arrEntries,iAct+1);  
				  });
				  self.saveFileToStorage(params.relativePath,content,params.type);
			}		
			if (params.type.isText){
				reader.readAsText(blob);
			} else {
				reader.readAsArrayBuffer(blob);
			}
		}
		var fncProgress=function(current, total) {
//			console.log(current + "/" + total + "   " + Math.round((current/total)*100)+"%");
		}
		model.getEntryFile(entry
				, "Blob"
				, fncSaveBlob
				, fncProgress);
	}
	deploy(deployInfo){ 
		var self=this;
		console.log("Deploying Zip:"+deployInfo.relativePath);
		if (typeof zip==="undefined"){
			console.log("Zip engine is not running.... loading");
			var arrFiles=["js/libs/jquery-3.3.1.min.js",
				  "js/libs/zip/zip.js"
//				  ,"js/libs/zip/zip-ext.js"
				  ];
			self.pushCallback(function(){
				self.deploy(deployInfo);
			});
			self.loadRemoteFiles(arrFiles);
			return;
		}
		zip.useWebWorkers=true;
		zip.workerScriptsPath = 'js/libs/zip/';
		/*zip.workerScripts = {
				  deflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/deflate.js'],
				  inflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/inflate.js']
				};
		*/
		var sZipUrl=deployInfo.url;
		// prepare arrays
		var model=new ZipModel();
		self.pushCallback(function(){
			deployInfo.deployedCommitId=deployInfo.commitId;
			deployInfo.deployedDate=deployInfo.commitDate;
			self.storage.set('#FILEINFO#'+deployInfo.relativePath,JSON.stringify(deployInfo));
			self.popCallback();
		});
		self.pushCallback(self.saveZipEntries);
		console.log("Download Zip File:"+sZipUrl);
		model.downloadAndGetEntries(sZipUrl,function(entries) {
			var arrFilesToSave=[];
			entries.forEach(function(entry) {
				var sFile=entry.filename;
				var sImportPath;
				var bWillNotSave=true;
				var bContinue=true;
				var sRelativePath="";
				for (var i=0;(bContinue)&&(bWillNotSave) && 
							 ((deployInfo.imports.length==0)||(i<deployInfo.imports.length))
							 ;i++){
					var sPrefix="";
					var sLastChar=sFile.substring(sFile.length-1);
					if (sLastChar=="/") {
						bContinue=false;
					} else if (deployInfo.imports.length==0){
						sRelativePath=entry.filename;
//						console.log("Entry "+entry.filename + " will be saved as "+sRelativePath);
						bWillNotSave=false;
					} else {
						sImportPath=deployInfo.imports[i];
						var sPrefix=sFile.substring(0,sImportPath.length);
						sRelativePath=sFile.substring(sPrefix.length);
						if ((sPrefix.length!=sFile.length)
							  &&(sPrefix==sImportPath)){
//							console.log("Entry "+entry.filename + " will be saved as "+sRelativePath);
							bWillNotSave=false;
						}
					}
				}
				if (!bWillNotSave){
					var jsonContent=self.getContentTypeFromExtension(sFile);
					var sContentSaved=self.storage.get('#FILEINFO#'+sRelativePath);
					var oContentSaved="";
					if (sContentSaved!=null){
						oContentSaved=JSON.parse(sContentSaved);
					}
					if ((oContentSaved=="") || 
						(oContentSaved.saveDate<deployInfo.commitDate)){
						console.log("Entry "+entry.filename + " will be saved as "+sRelativePath);
						jsonContent.commitId=deployInfo.commitId;
						jsonContent.commitDate=deployInfo.commitDate;
						arrFilesToSave.push({
											model:model,
											entry:entry,
											type:jsonContent,
											relativePath:sRelativePath
											});
					} else {
						console.log(sRelativePath+" saved is newer");
					}
				}
			});
			self.popCallback([arrFilesToSave]);
		});
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
				var result;
				if (creationMethod == "BlobUrl") {
					result=URL.createObjectURL(blob);
				} else if (creationMethod == "Blob") {
						result=blob;
				} else {
					result=zipFileEntry.toURL();
				}
				onend(result);
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