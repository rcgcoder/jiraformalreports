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
	constructor(){
		var self=this;
		self.description="";
		self.method="";
		self.isChangeObj=false;
		self.parent="";
		self.forkId="";
		self.actStep=-1;
		self.steps=[];
		self.forks=[];
		self.progressMin=0;
		self.progressMax=0;
		self.progress=0;
		self.progressWeight=-1;
		self.stackCallbacks=[];
		self.object="";
		self.running=false;
		//self.extendObject(obj);
		self.asyncPops=false;
	}
	getStatus(){
		var self=this;
		var progressItems=0;
		var progressPercent=0;
		var progressMax=100;
		var progressMin=0;
		var itemsRunned=0;
//		if (self.steps.length==0){
		// call status
		if (self.method!=""){
			progressMax=self.progressMax;
			progressMin=self.progressMin;
			progressItems=progressMax-progressMin;
			progressPercent=0;
			if (progressItems>0){
				progressPercent=self.progress/progressItems;
			}
		}
		if (self.steps.length==0){
			return {perc:progressPercent,weight:self.weight};
		} else { // if has substeps
			progressMax=100;
			progressMin=0;
			progressItems=self.steps.length;
			var totalWeight=0;
			var itemsWithWeight=0;
			var acumWeightProcessed=0;
			var itemsProcessedWithoutWeight=0;
			if (self.method!=""){
				progressItems++; // if has method... there is a one more item
				if (self.weight>=0){
					itemsWithWeight++;
					totalWeight+=self.weight;
					if (self.actStep>=0){
						acumWeightProcessed+=self.weight;
					}
				} else if (self.actStep>=0){
					itemsProcessedWithoutWeight++;
				}
			}
			for (var i=0;i<self.steps.length;i++){
				var auxStep=self.steps[i];
				if (auxStep.weight>=0){
					itemsWithWeight++;
					totalWeight+=auxStep.weight;
					if ((self.actStep>=0)&&(self.actStep<i)){
						acumWeightProcessed+=auxStep.weight;
					}
				} else if ((self.actStep>=0)&&(self.actStep<i)){
					itemsProcessedWithoutWeight++;
				}
			}
			var medWeight=0;
			var percWeight=0;
			var percProcessedWeight=0;
			if (itemsWithWeight==0){
				totalWeight=100;
				medWeight=totalWeight/progressItems;
			} else {
				medWeight=totalWeight/itemsWithWeight;
				totalWeight+=(medWeight*(progressItems-itemsWithWeight));
			}
			acumWeightProcessed+=(itemsProcessedWithoutWeight*medWeight);
			percWeight=100/totalWeight;
			percProcessedWeight=(percWeight*acumWeightProcessed);
			return {perc:percProcessedWeight,weight:self.weight};
		}
	}
	searchForFork(forkId){
		if (typeof forkId==="undefined") return self;
		if (self.forkId==forkId) return self;
		if (self.steps.length==0) return "";
		if (self.actStep>=self.steps.length) return "";
		var bForkLocated=false;
		var theFork="";
		for (var i=0;(theFork=="") &&(i<self.forks.length);i++){
			theFork=self.forks[i].searchForFork(forkId);
		}
		return theFork;
	}
	getDeepStep(forkId){
		var self=this;
		if (self.steps.length==0) return self;
		if (self.actStep>=self.steps.length) return self;
		if (self.actStep<0) return self;
		if (typeof forkId!=="undefined"){
			var theFork=self.searchForFork(forkId);
			if (theFork!=""){
				return theFork.getDeepStep();
			}
		} 
		var stepRunning=self.steps[self.actStep];
		return stepRunning.getDeepStep();
	}
	getRunningCall(forkId){
		var self=this;
		var stepRunning=self.getDeepStep(forkId);
		for (var i=(stepRunning.stackCallbacks.length-1);i>=0;i--){
			var cb=stepRunning.stackCallbacks[i];
			if (cb.running){
				return cb;
			}
		}
		return stepRunning;
	}
	newSubManager(method,obj){
		var self=this;
		var theObj=obj;
		if (typeof theObj==="undefined"){
			theObj=self.object;
		}
		var cm=new CallManager();
		cm.parent=self;
		cm.object=theObj;
		cm.forkId=self.forkId;
		cm.method=method;
		return cm;
	}
	addStep(description,method,forkId,obj){
		var self=this;
		var cm=self.newSubManager(method,obj);
		cm.description=description;
		self.steps.push(cm);
	}
	newForkId(){
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	runSteps(aArgs,forkId,bJumpLast){
		var self=this;
		if (!((self.method==null)||(self.method=="")||(typeof self.method==="undefined"))){
			self.callMethod(aArgs);
		} else {
			self.nextStep(aArgs);
		}
	}
	addFork(method,obj){
		var self=this;
		cm=self.newSubManager(method,obj);
		cm.forkId=self.newForkId();
		self.forks.push(cm);
		return cm;
	}
	pushCallback(method,forkId,obj){
		var self=this;
		if (typeof method==="undefined"){
			console.log("you are pushing an undefined callback... be carefull.... it´s maybe a big bug");
		}
		var ds=self.getDeepStep(forkId);
		var cm=ds.newSubManager(method,obj);
		ds.stackCallbacks.push(cm);
	}
	callMethod(aArgs){
		var self=this;
		self.running=true;
		var obj=self.object;
		var theMethod=self.method;
		if (typeof theMethod==="undefined"){
			console.log("¿undefined?.... this will be a Big Crash!!!");
		}

		var context=obj;
		if (obj==""){
			context=undefined;
		}
		if (typeof theMethod==="string"){
			theMethod=context[theMethod];
		}
		var fncApply=function(){
			theMethod.apply(context,aArgs);
		}
		if (self.asyncPops) {
			setTimeout(fncApply);
		} else {
			fncApply();
		}
	}
	nextStep(aArgs,forkId,bJumpLast){
		var self=this;
		var stepRunning=self.getRunningCall();
		
		while (stepRunning!=""){
			if ((stepRunning.steps.length>0)&&((stepRunning.steps.length-1)>stepRunning.actStep)){
				if (stepRunning.actStep>=0){
					stepRunning.steps[stepRunning.actStep].running=false;
				}
				stepRunning.actStep++;
				var cm=stepRunning.steps[stepRunning.actStep];
				if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
					return self.nextStep(aArgs,forkId,false);
				} else {
					return cm.callMethod(aArgs);
				}
			} 
			stepRunning.running=false;  // the step is finished
			stepRunning=stepRunning.parent;
		}
	}
	popCallback(aArgs,forkId,bJumpLast){
		var self=this;
		var ds=self.getDeepStep(forkId);
		if (ds.stackCallbacks.length>0){
			if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
				ds.stackCallbacks.pop();
				return self.popCallback(aArgs,forkId,false);
			} else {
				var theCallback=ds.stackCallbacks.pop();
				theCallback.callMethod(aArgs);
			}
		} else { // there is not callbacks to pop..... let´s go to next step.
			self.nextStep(aArgs,forkId,bJumpLast);
		}
	}
	extended_addStep(description,method,forkId,newObj){
		var self=this;
		var cm=self.callManager.getRunningCall();
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		var antObj="";
		var bSetChangeObjStep=false;
		if (cm.object!=theObj){
			antObj=cm.object;
			bSetChangeObjStep=true;
		}
		cm.object=theObj;
		cm.addStep(description,method,forkId,theObj);
		if (bSetChangeObjStep){
			var changeObjectStep=function(aArgs){
				cm.object=antObj;
				cm.popCallback(aArgs);
				cm.isChangeObj=true;
			}
			cm.addStep(description,changeObjectStep,forkId,"");
		}

	}
	extended_pushCallBack(method,forkId,newObj){
		var self=this;
		var cm=self.callManager;
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		if (cm.object!=theObj){
			var antObj=cm.object;
			var changeObjectCallback=function(aArgs){
				cm.object=antObj;
				cm.popCallback(aArgs);
			}
			self.callManager.pushCallback(changeObjectCallback,forkId,"");
		}
		cm.object=theObj;
		self.callManager.pushCallback(method,forkId,theObj);
	}
	extended_popCallback(aArgs){
		this.callManager.popCallback(aArgs);
	}
	extendObject(obj){
		var self=this;
		self.object=obj;
		obj.callManager=self;
		obj.addStep=self.extended_addStep;
		obj.pushCallback=self.extended_pushCallBack;
		obj.popCallback=self.extended_popCallback;
	}
}
var callManager=new CallManager();

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
		callManager.extendObject(self);
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
		  console.log("Remaining GitHub Pets:"+nRemaining+" test");
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
			  self.popCallback([self.arrCommits],self.callManager.forkId,true);
		  }
	   } else {
		  self.popCallback([self.arrCommits],self.callManager.forkId,true);
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
		self.popCallback([self.commitId,self.commitDate],self.callManager.forkId,true);
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
				self.popCallback([self.commitId,arrCommits],self.callManager.forkId,true);
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
		self.popCallback([sCommitShortId,sCommitDate],self.callManager.forkId,true);
	}
	getLastCommitOfFile(sRelativePath){
		var self=this;
		self.pushCallback(self.processLastCommitOfFile);
		self.apiCall("https://api.github.com/repos/"+self.repository+"/commits?path="+sRelativePath);
	}
	updateDeployZipCommits(deployZips,iFile){
		var self=this;
		if (iFile>=deployZips.length){
			self.popCallback([],self.callManager.forkId,true);
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
		self.localStorageMaxSize=200*1024*1024; // 200 MBytes by default
		callManager.extendObject(self);
		console.log("ZippedApp Created");
		self.requestFileSystem = window.webkitRequestFileSystem 
								|| window.mozRequestFileSystem 
								|| window.requestFileSystem;
		self.storage="";
		self.loadedFiles={"rcglibs/RCGZippedWebApp.js":true};
		var fncShowStatus=function(){
			var status=self.callManager.getStatus();
			setTimeout(fncShowStatus,500);
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
			self.addStep(function(){
				self.deploy(theDeploy);
			});
			self.addStep(function(){
				self.checkForDeploys(iZip+1);
			});
			self.callManager.runSteps();
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
		console.log("GetCommits");
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
//		self.pushCallback(self.updateFilesFromCommits);
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
	  		  		  "js/libs/b64.js",
			  		  ];
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
//			var webapp = new window[self.mainClass]();
			var webapp=new ZipWebApp();
			self.extendFromObject(webapp);
			self.run();
		});
		self.loadRemoteFile(self.mainJs);
	}
	run(){
		var self=this;
		if ((self.github!="")&&((self.github.commitId=="")||(self.github.commitDate==""))){
			self.addStep(self.github.updateLastCommit,undefined,self.github);
		}
		self.addStep(self.startPersistence);
		self.addStep(self.updateDeployZips);
		self.addStep(self.startApplication);
		self.callManager.runSteps();
		 
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