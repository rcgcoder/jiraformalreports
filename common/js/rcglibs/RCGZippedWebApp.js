/*
Class for download a Zip File with a lot of js files.
.... extract files to persistent 
.... load all files to memory
*/

/*
 * First it´s load the other javascript libs.....
 * 
 */
function log(sText){
	var tm=taskManager;
	if ((typeof tm!=="undefined")&&(tm!=null)&&(tm!="")){
		console.log(tm.getRunningForkId()+" - "+sText);
	} else {
		console.log("Error in getrootforkid");
	}
}
function isChrome() {
  var isChromium = window.chrome,
    winNav = window.navigator,
    vendorName = winNav.vendor,
    isOpera = winNav.userAgent.indexOf("OPR") > -1,
    isIEedge = winNav.userAgent.indexOf("Edge") > -1,
    isIOSChrome = winNav.userAgent.match("CriOS");

  if (isIOSChrome) {
    return true;
  } else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
  ) {
    return true;
  } else { 
    return false;
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
		self.ghCode="";
		self.headerAuth="";
		self.ghStateString="_ungues";
		taskManager.extendObject(self);
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
		xhr.onload = self.createManagedCallback(function(e) {
		  var nRemaining=xhr.getResponseHeader("X-RateLimit-Remaining");
		  log("Remaining GitHub Pets:"+nRemaining);
		  if (xhr.status == 302) {
			  var ghLink=xhr.getResponseHeader("Location");
			  self.apiCall(ghLink);
		  } else if (xhr.status == 200) {
			  self.popCallback([xhr.response,xhr,sTargetUrl,arrHeaders]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		});
		xhr.send();	
	}
	processCommitsPage(response,xhr,url,arrHeaders){
	   var self=this;
	   var sUrl=url;
	   if (typeof sUrl==="undefined"){
		   sUrl="https://api.github.com/repos/"+self.repository+"/commits";
	   }
	   self.arrCommits = self.arrCommits.concat(response.items);
	   var ghLink=xhr.getResponseHeader("Links");
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
			  self.popCallback([self.arrCommits],1);
		  }
	   } else {
		  self.popCallback([self.arrCommits],1);
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
				];
			var sDate = new Date(fromDate).toISOString();
			sDate=sDate.substring(0,sDate.length-5);
			self.apiCall("https://api.github.com/search/commits?q=repo:rcgcoder/jiraformalreports+committer-date:>"+sDate,undefined,undefined,undefined,arrHeaders);
		}
	}
	processLastCommit(response){
		var self=this;
		self.lastCommit=response;
		var sCommitLongId=self.lastCommit.sha;
		var sCommitShortId=sCommitLongId.substring(0,8);
		self.commitId=sCommitShortId;
		self.commitDate=(new Date(self.lastCommit.commit.author.date)).getTime();
		self.popCallback(self.commitId,self.commitDate,1);
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
				self.popCallback([self.commitId,arrCommits],1);
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
		self.popCallback(sCommitShortId,sCommitDate);
	}
	getLastCommitOfFile(sRelativePath){
		var self=this;
		self.pushCallback(self.processLastCommitOfFile);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits?path="+sRelativePath);
	}
	updateDeployZipCommits(deployZips,iFile){
		var self=this;
		if (iFile>=deployZips.length){
			self.popCallback();
		} else {
			self.pushCallback(function(sCommitId,sCommitDate){
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
		self.proxyPath=""; // url of the callback/connect proxy
		self.rootPath="";
		self.prependPath="";
		self.github="";
		self.htmlContainerId="";
		self.isCloud=false;
		self.urlBase="";
		self.urlFull="";
		self.DeployZips=[];
		self.lastDeployInfo="";
		self.mainJs="";
		self.mainClass="";
		self.tsCompiler="";
		self.bWithPersistentStorage=isChrome();
		self.localStorageMaxSize=200*1024*1024; // 200 MBytes by default
		taskManager.extendObject(self);
		log("ZippedApp Created");
		self.requestFileSystem = window.webkitRequestFileSystem 
								|| window.mozRequestFileSystem 
								|| window.requestFileSystem;
		self.storage="";
		self.loadedFiles={"rcglibs/RCGZippedWebApp.js":true};
		var fncShowStatus=function(){
			var status=self.getTaskManagerStatus();
			log("Total Advance:"+status.desc+":"+Math.round(status.perc*100)+"%");
			var child=status.child;
			while (typeof child!=="undefined"){
				log("   child Advance:"+child.desc+":"+Math.round(child.perc*100)+"%" + "["+child.min+"--> "+child.adv +" -->"+child.max+"]");
				child=child.child;
			}
			if (status.perc<1){
				setTimeout(fncShowStatus,500);
			}
		}
		fncShowStatus();

		
	}
	useGitHub(sRepository,branch,code){
		var self=this;
		self.github=new GitHub(self);
		self.github.repository=sRepository;
		if (typeof branch!=="undefined"){
			self.github.branch=branch;
		}
		if (typeof code!=="undefined"){
			self.github.ghCode=code;
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
		this.htmlContainerId=sHtmlElementId;
	}
	getHtmlContainerID(){
		return this.htmlContainerId;
	}
	
	
	composeUrl(sRelativePath){
		var self=this;
		if (sRelativePath.substr(0,4).toLowerCase()=="http"){
			return sRelativePath;
		}
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
			isTS:false,
			isCSS:false,
			isHTML:false,
			isJSON:false,
			isSVG:false,
			isIMG:false,
			isCacheable:true,
			commitId:"",
			isUndefined:false
		}
		var nPos=fileName.lastIndexOf(".");
		var sExt=fileName.substring(nPos+1,fileName.length).toLowerCase();
		if (sExt=="js"){
			result.isText=true;
			result.isJS=true;
			return result;
		} else if (sExt=="ts"){
				result.isText=true;
				result.isTS=true;
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
		result.isUndefined=true;
		return result;
	}
	getContentType(xhr){
		var result={
			isText:false,
			isJS:false,
			isTS:false,
			isCSS:false,
			isHTML:false,
			isJSON:false,
			isSVG:false,
			isCacheable:true,
			isUndefined:false,
			commitId:""
		}
		var arrContentTypes=xhr.getResponseHeader("content-type").split(";");
		for (var i=0;i<arrContentTypes.length;i++){
			if (arrContentTypes[i]=="application/javascript"){
				result.isText=true;
				result.isJS=true;
				return result;
			} else if (arrContentTypes[i]=="application/typescript"){
					result.isText=true;
					result.isTS=true;
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
		result.isUndefined=true;
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
			//log("B64: " + sB64.length);
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
				self.createManagedCallback(
						function(e){
							self.popCallback([sStringContent]);
						}),
				self.createManagedCallback(
						function(e){
							self.popCallback([""]);
						})
				);
			
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
		xhr.onload = self.createManagedCallback(function(e) {
		  if (xhr.status == 200) {
			  log("Downloaded "+sRelativePath);
			  var ct=self.getContentType(xhr);
			  if (ct.isUndefined){
				  ct=self.getContentTypeFromExtension(sRelativePath);
			  }
			  var response="";
			  var toSave="";
			  self.pushCallback(function(sContent){
				  self.popCallback([sContent,xhr,ct,sRelativePath]);
			  });
			  self.pushCallback(function(sContent){
				  ct.commitId=self.github.commitId;
				  ct.commitDate=self.github.commitDate;
				  ct.saveDate=(new Date()).getTime();
				  if (self.bWithPersistentStorage){
					  var sResult=self.saveFileToStorage(sRelativePath,sContent,ct);
				  } else {
					  if (!ct.isText) {
					      var u8Arr = new Uint8Array(toSave);
						  toSave=fromByteArray(u8Arr);
					  }
					  self.popCallback(sContent);
				  }
			  });
			  if (ct.isText){
				  var uint8arr=new Uint8Array(xhr.response);
				  //toSave = String.fromCharCode.apply(null,arr);
				  var bb = new Blob([uint8arr]);
				  var f = new FileReader();
				  f.onload = self.createManagedCallback(function(e) {
				     self.popCallback(e.target.result);
				  });
				  f.readAsText(bb);
			  } else {
				  toSave = xhr.response;
				  self.popCallback(toSave);
			  }
		  } else {
			  log("Error downloading "+sRelativePath);
			  self.loadError({target:{src:sUrl}});			  
		  }
		});
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
	    oHead.appendChild(oScript);
	    oScript.innerHTML = jsContent;
	}
/*	addTypescriptString(tsContent){
		var self=this;
		if (self.tsCompiler==""){
			log("TypeScript Engine is not running... loading");
			self.tsCompiler=new tsCompiler();
		}
		var jsCompiled=self.tsCompiler.compile(tsContent);
		self.addJavascriptString(jsCompiled);
	}*/
	processFile(content,xhr,contentType,sRelativePath){
		log("Processing file:"+sRelativePath);
		var self=this;
		var auxContent=content;
	    if (contentType.isJS){ //if filename is a external JavaScript file
	    	self.addJavascriptString(content);
/*	    } else if (contentType.isTS){ //if filename is a external TypeScript file
		    	self.addTypescriptString(content);
*/	    } else if (contentType.isCSS){ //if filename is an external CSS file
	    	self.addStyleString(content);
	    } else if (contentType.isIMG){
	    	auxContent='data:image/bmp;base64,'+auxContent;
	    }
	    self.popCallback([sRelativePath,auxContent]);
	}
	loadFileFromNetwork(bLoadedFromStorage,sRelativePath,fileContent){
		var self=this;
		if (bLoadedFromStorage) {
			log(sRelativePath+" loaded from persistent storage");
			return self.popCallback([sRelativePath,fileContent]);
			
		}
		log(sRelativePath+" loaded from network");
		var sUrl=self.composeUrl(sRelativePath);
		self.pushCallback(self.processFile);
    	self.downloadFile(sUrl,sRelativePath);
	}
	loadFileFromStorage(sRelativePath){
		log("Loading "+ sRelativePath + " from storage");
		var self=this;
		if ((!self.bWithPersistentStorage)||(self.storage=="")||(self.github=="")){ // if there is not storage initialized or github is not used
			log("There is not storage engine loaded");
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
				log("Loading from storage the File:"+sRelativePath);

				self.pushCallback(function(sFileContent){
					//var sFileContent=self.storage.get(sRelativePath);
					self.pushCallback(function(sRelativePath,fileContents){
							log("file "+sRelativePath+" Processed");
							self.popCallback([true,sRelativePath,fileContents]);
					});
					return self.processFile(sFileContent,undefined,jsonContentType,sRelativePath);
				});
				return filesystem.ReadFile(sRelativePath,
						self.createManagedCallback(function(sStringContent){
							log("file "+sRelativePath +" readed from storage");
							self.popCallback([sStringContent]);
						}),
						self.createManagedCallback(function(e){
							log("file "+sRelativePath +" Error reading from storage");
							self.popCallback([""]);
						})
						);
			}
		}
		return self.popCallback([false,sRelativePath]);
	}
	
	loadRemoteFile(sRelativePath){
		var self=this;
		if (self.bWithPersistentStorage){
			self.pushCallback(self.loadFileFromNetwork);
			self.loadFileFromStorage(sRelativePath);
		} else {
			self.loadFileFromNetwork(false,sRelativePath);
		}
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
	loadRemoteFileNewFork(sRelativePath,barrier){
		var self=this;
		var fncLoadFile=function(){
			self.pushCallback(self.loadFileFromNetwork);
			self.loadFileFromStorage(sRelativePath);
		}
		var cm=self.pushCallback(fncLoadFile,undefined,true,barrier);
		cm.callMethod(); // start
	}
	loadRemoteFileForks(arrRelativePaths){
		var self=this;
		var actTask=taskManager.getRunningTask();
		var fncBarrierFinish=function(){
			log("Barrier Finished:" + actTask.forkId);
			self.setRunningTask(actTask);
			self.popCallback();
		}
		var barrier=new RCGBarrier(fncBarrierFinish,arrRelativePaths.length);
		for (var i=0;i<arrRelativePaths.length;i++){
			self.loadRemoteFileNewFork(arrRelativePaths[i],barrier);
		}
	}
	loadRemoteFiles(arrRelativePaths){
		var self=this;
		self.loadRemoteFileIteration(arrRelativePaths,0);
		//self.loadRemoteFileForks(arrRelativePaths);
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
		   (theDeploy.commitDate>theDeploy.deployedDate)
		   ){ // new release
			// needs to be deployed
			bNotUpdate=false;
			self.addStep("Deploying Zip:"+ theDeploy.relativePath,function(){
				self.deploy(theDeploy);
			});
			self.addStep("Checking for other Deploying Zip:"+ iZip,function(){
				self.checkForDeploys(iZip+1);
			});
			self.taskManager.runSteps();
		} else {
			log("the deploy: "+ theDeploy.relativePath+ " is up to date");
			self.checkForDeploys(iZip+1);
		}
	}
	loadJSBaseEngine(){
		var self=this;
		if (typeof zip==="undefined"){
			log("Zip engine is not running.... loading");
			var arrFiles=["css/RCGTaskManager.css",
				          "js/libs/zip/zip.js"
					//	,
					//	  "js/libs/angular.min.js",
					//	  "js/libs/typescript.min.js",
					//	  "js/libs/typescript.compile.js"
	//			  ,"js/libs/zip/zip-ext.js"
				  ];
			return self.loadRemoteFiles(arrFiles);
		} else {
			return self.popCallback();
		}
	}
	addDeployFork(theDeploy){
		var self=this;
		var fncDeploy=function(){
			var runningTask=self.getRunningTask();
			log("Deploying Zip:"+ theDeploy.relativePath + "(Task "+runningTask.forkId+"name:"+runningTask.description+")");
			self.deploy(theDeploy);
		}
		self.addStep("Fork Deploy zip:"+theDeploy.relativePath
					,fncDeploy,undefined,undefined,"",undefined,undefined,"inner",undefined);
	}
	checkForDeploysForked(){
		var self=this;
		
		var tLastDeploy=0;
		if (self.lastDeployInfo!=""){
			tLastDeploy=self.lastDeployInfo.date;
		}
		var runningTask=self.getRunningTask();
		var arrDeploysToUpdate=[];
		for (var i=0;i<self.DeployZips.length;i++){
			var theDeploy=self.DeployZips[i];
			if ((theDeploy.deployedDate=="")  // never deployed
				||
			   (theDeploy.commitDate>theDeploy.deployedDate)){ // new release
				// needs to be deployed
				arrDeploysToUpdate.push(theDeploy);
				self.addDeployFork(theDeploy);				
			} else {
				log("the deploy: "+ theDeploy.relativePath+ " is up to date");
			}
		}
		if (arrDeploysToUpdate.length>0){
			self.addStep("Finished launching inner FORKS...",function(aArgs){
				self.setRunningTask(runningTask);
				log("Finished launching inner FORKS...");
				self.continueTask(aArgs);
			});
			self.addStep("Waiting inner Forks Finish...",function(aArgs){
				self.setRunningTask(runningTask);
				log("...");
				self.getRunningTask().barrier.reach(self);
			});
			self.addStep("All inner Forks Finished...",function(aArgs){
				self.setRunningTask(runningTask);
				log("Finish all inner Forks.... it´s necesary to increment the number of items in barrier");
				runningTask.barrier.add(runningTask);
				self.continueTask(aArgs);
			});
		}
		self.continueTask();
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
			log("Test");
		});
		log("GetCommits");
		self.github.getCommits(minZipCommitDate);

		
	}
	updateDeployZips(){
		var self=this;
		if (!self.bWithPersistentStorage){
			return self.popCallback();
		}
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
//		self.pushCallback(self.updateFilesFromCommits);
		self.pushCallback(self.checkForDeploysForked);
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
		InitializeFileSystem(self.createManagedCallback(function(){
								self.popCallback();
							 }),
							 self.localStorageMaxSize);
	}
	startPersistence(){
		var self=this;
		var arrFiles=["js/libs/persist-all-min.js",
					  "js/rcglibs/RCGPersist.js",
	  		  		  "js/libs/b64.js",
			  		  ];
		if (self.bWithPersistentStorage){
			self.pushCallback(self.loadPersistentStorage);
		}
		self.loadRemoteFiles(arrFiles);
	}
	loadMemoryMonitor(){
		var self=this;
		var arrFiles=["js/libs/memory-stats.js"];
		self.pushCallback(self.startMemoryMonitor);
		self.loadRemoteFiles(arrFiles);
	}
	startMemoryMonitor(){
		// add the monitor into our page and update it on a rAF loop
		var stats = new MemoryStats();
		stats.domElement.style.position	= 'fixed';
		stats.domElement.style.right		= '0px';
		stats.domElement.style.bottom		= '0px';
		document.body.appendChild( stats.domElement );
		requestAnimationFrame(function rAFloop(){
			stats.update();
			requestAnimationFrame(rAFloop);
		});
		// generate plenty of objects
		// from in generational GC demo from firefox
		// https://people.mozilla.org/~wmccloskey/incremental-blog/example-pause.html
		var garbage 	= [];
		var garbageSize	= 1024 * 1024 * 6;
		var garbageIdx	= 0;
		// call GC() from console to test a GC
		function GC(){
			garbage 	= [];
			garbageIdx	= 0;
		}
		function makeGarbage(amount){
			for(var i = 0; i < amount; i++){
				garbage[garbageIdx]	= {};
				garbageIdx	= (garbageIdx+1) % garbageSize;
			}
		}
		requestAnimationFrame(function rAFloop(){
			makeGarbage(1024);
			requestAnimationFrame(rAFloop);
		});
		//# sourceURL=generateGarbage.js
		this.popCallback();
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
//			var webapp = new window[self.mainClass]();
			var webapp=new ZipWebApp();
			self.extendFromObject(webapp);
			self.run();
//			self.popCallback();
		});
		self.loadRemoteFile(self.mainJs);
	}
	updateStatus(){
		var self=this;
		if (window.jQuery){
			var tm=self.getTaskManager();
			var progressDiv=$("#JFR_Progress_DIV");
			var pDiv; 
			if (progressDiv.length==0){
				log("minimice img");
				$("#jrfSplash").width(100);
				$("#jrfSplash").height(100);
				log("adding progress div");
				pDiv= $("<div id='JFR_Progress_DIV'></div>").appendTo('body');
			} else {
				pDiv=progressDiv;
			}
			pDiv.empty();
			var allTasksInfo=self.getTaskManagerStatus();
			var fncAddProgressItem=function(item){
				if (item.done) return "";
				if (!item.running) return "";
				var perc100=(Math.round(item.perc*1000))/10;
				var nChildsDone=0;
				var nChildsTotal=item.detail.length;
				var nInnerMin=0;
				var nInnerMax=0;
				var nInnerAdv=0;
				for (var i=0;i<nChildsTotal;i++){
					var child=item.detail[i];
					if (child.done){
						nChildsDone++;
					}
					nInnerMax+=child.max;
					nInnerMin+=child.min;
					nInnerAdv+=child.adv;
				}
				var sChildsInfo="";
				if (nChildsTotal>0){
					sChildsInfo=" ("+nChildsDone+"/"+nChildsTotal+")";
				}
				if ((nInnerAdv>0)&&(nInnerMax!=nChildsTotal)){
					sChildsInfo+=" ["+nInnerMin+" => "+ nInnerAdv +" => "+nInnerMax+"]";
					
				}
				
				var tTotal=0;
				var tETA=0;
				if (item.perc>0){
					tTotal=(1/item.perc)*item.timeSpent;
					tETA=tTotal-item.timeSpent;
					tETA=Math.round((tETA/1000)*100)/100;
				}
				if (item.detail.length>0) { 
					for (var i=0;i<item.detail.length;i++){
						var detail=item.detail[i];
					}
				}
				

				var sItem='<div id="statusBox" class="tm-inline">'+
				  '	  <span id="sbTitle"> ' + (item.desc==""?"Running...":item.desc) + sChildsInfo + ' '+perc100+'% '+
				  '   </span>'+
				  '   <progress class="tm-progress" id="sbProgress" value="'+(Math.round(perc100))+'" max="100">Progress Text</progress>'+
				  '   '+(Math.round((item.timeSpent/1000)*100)/100)+' segs'+(tTotal>0?(' (ETA: '+tETA+' segs)'):'')+
				  '</div>';
				var sSubItems="";
				if (item.detail.length>0) { 
					for (var i=0;i<item.detail.length;i++){
						var sSubItem=fncAddProgressItem(item.detail[i]);
						sSubItems+=sSubItem;
					}
					sSubItems="<ul>"+sSubItems+"</ul>";
				}
				sItem='<li class="progress">'+sItem+' '+sSubItems+'</li>';
				return sItem;
			}
			var sHtml="";
			for (var i=0;i<allTasksInfo.length;i++){
				sHtml+=fncAddProgressItem(allTasksInfo[0]);
			}
			var list= $("<ul id='ProgressList'>"+
						sHtml+
						"</ul>"
						).appendTo(pDiv);
		}
	}
	run(){
		var self=this;
		self.getTaskManager().setOnChangeStatus(self.createManagedCallback(function(){
				self.updateStatus();}));
		if ((self.github!="")&&((self.github.commitId=="")||(self.github.commitDate==""))){
			self.addStep(self.github.updateLastCommit,undefined,self.github);
		}
//		self.addStep("Starting Memory Monitor...",self.loadMemoryMonitor);
		self.addStep("Starting Persistence...",self.startPersistence);
		self.addStep("Loading Base Files...",self.loadJSBaseEngine);
		self.addStep("Updating Deploy Zips...",self.updateDeployZips);
		self.addStep("Starting Application...",self.startApplication);
		self.continueTask();
		 
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
	addSaveZipEntryStep(entry){
		var self=this;
		var params=entry;
		var model=params.model;
		var entry=params.entry;
		var fncProgress=function(current, total) {
//			log(current + "/" + total + "   " + Math.round((current/total)*100)+"%");
		}
		var fncSaveBlob=self.createManagedCallback(function (blob){
//			log("save blob");
			var reader = new FileReader();
			reader.onload = 
				self.createManagedCallback(function(e) {
				  var content = reader.result;
				  self.saveFileToStorage(params.relativePath,content,params.type);
				});
			if (params.type.isText){
				reader.readAsText(blob);
			} else {
				reader.readAsArrayBuffer(blob);
			}
		});
		var fncGetEntry=function(){
			model.getEntryFile(entry
					, "Blob"
					, fncSaveBlob
					, fncProgress);
		}
		self.addStep("Saving file "+ params.relativePath+" from deploy zip ...",fncGetEntry);
	}
	saveZipEntries(arrEntries,iEntry){
		var self=this;
		self.setTaskProgressMinMax(0,arrEntries.length);
		for (var i=0;i<arrEntries.length;i++){
			self.addSaveZipEntryStep(arrEntries[i]);
		}
		self.continueTask();
	}
	deploy(deployInfo){ 
		var self=this;
		log("Deploying Zip:"+deployInfo.relativePath);
		var runningTask=self.getRunningTask();
		zip.useWebWorkers=true;
		zip.workerScriptsPath = 'js/libs/zip/';
		/*zip.workerScripts = {
				  deflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/deflate.js'],
				  inflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/inflate.js']
				};
		*/
		self.addStep("Saving Zip Entries...",self.saveZipEntries);
		self.addStep("Updating Deploy Info...",
				function(){
					deployInfo.deployedCommitId=deployInfo.commitId;
					deployInfo.deployedDate=deployInfo.commitDate;
					self.storage.set('#FILEINFO#'+deployInfo.relativePath,JSON.stringify(deployInfo));
					self.popCallback();
			});
		var sZipUrl=deployInfo.url;
		// prepare arrays
		var model=new ZipModel();
		var fncDownOnProgress=function (evt) {
			log("Download Progress");
	        if(evt.lengthComputable) {
	            var percentComplete = evt.loaded / evt.total;
	            console.log("Download progress:"+percentComplete);
	        }
	        self.setTaskProgressMinMax(0,evt.total);
	        self.setTaskProgress(evt.loaded);
	    };
	    var fncOnDone=function(entries) {
				log("Processing Zip File:"+sZipUrl);
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
	//						log("Entry "+entry.filename + " will be saved as "+sRelativePath);
							bWillNotSave=false;
						} else {
							sImportPath=deployInfo.imports[i];
							var sPrefix=sFile.substring(0,sImportPath.length);
							sRelativePath=sFile.substring(sPrefix.length);
							if ((sPrefix.length!=sFile.length)
								  &&(sPrefix==sImportPath)){
	//							log("Entry "+entry.filename + " will be saved as "+sRelativePath);
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
	//						log("Entry "+entry.filename + " will be saved as "+sRelativePath);
							jsonContent.commitId=deployInfo.commitId;
							jsonContent.commitDate=deployInfo.commitDate;
							arrFilesToSave.push({
												model:model,
												entry:entry,
												type:jsonContent,
												relativePath:sRelativePath
												});
						} else {
//							log(sRelativePath+" saved is newer");
						}
					}
				});
				self.popCallback([arrFilesToSave]);
			};

		log("Download Zip File:"+sZipUrl);
		model.downloadAndGetEntries(sZipUrl,
			self.createManagedCallback(fncOnDone),
			self.createManagedCallback(fncDownOnProgress)
		);
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
	
	downloadAndGetEntries(urlZipFile,onend,down_onprogress){
		var self=this;
		self.ZipFile=urlZipFile;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', urlZipFile, true);
		xhr.responseType = 'blob';
		if (typeof down_onprogress!=="undefined"){
		    xhr.addEventListener("progress", down_onprogress, false);
		}
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
	getEntryFile(entry, creationMethod, onend) {
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
				});
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