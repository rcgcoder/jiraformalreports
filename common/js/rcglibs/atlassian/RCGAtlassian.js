class RCGAtlassian{
	constructor(app){
		var self=this;
		self.proxyPath="";
		self.instance="";
		self.JiraAPConnection=AP;
		self.app=app;
		self.confluence="";//new RCGConfluence();
		self.jira="";
		self.initialized=true;
		taskManager.extendObject(self);
	}
	getJira(){
		var self=this;
		if (self.jira==""){
			self.jira=new RCGJira(self);
		}
		return self.jira;
	}
	getConfluence(){
		var self=this;
		if (self.confluence==""){
			self.confluence=new RCGConfluence(self);
		}
		return self.confluence;
	}
	loadError(oError){
	    throw new URIError("The URL " + oError.target.src + " is not accessible.");
	}
	apiCallOauth(sTargetUrl,data,sPage,sType,callback,arrHeaders){
		var self=this;
		var sUrl=self.proxyPath+"/oauth"+sTargetUrl;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', sUrl, true);
		xhr.responseType = 'json';
		xhr.onerror=self.loadError;
		xhr.onload = self.createManagedCallback(function(e) {
		  if (xhr.status == 200) {
			  self.popCallback([xhr.response,xhr,sTargetUrl,arrHeaders]);
		  } else {
			  self.loadError({target:{src:sUrl}});			  
		  }
		});
		xhr.send();	
	}
	apiOauthSecondStep(response,xhr,sUrl,headers){
		var self=this;
		if (response!=null){
			log("Oauth Jira URL:"+response.url);
		} else {
			log("Oauth Jira ... waiting");
		}
		var win;
		
		var checkIfToken=self.createManagedCallback(function(){
			self.addStep("Checking for session access token",function(response,xhr,sUrl,headers) {
				if  ((response==null)||
					(typeof response==="undefined")||
					(response.isToken==false)){
					setTimeout(checkIfToken,1000);
				} else {
					log("Oauth Access token:"+response.access);
					self.popCallback([response.access,response.secret]);
				}
			});
			self.apiCallOauth("/sessionToken");
		});
		win = window.open(response.url, '_blank');
		log("Tab Opened");
		checkIfToken();
	}

	oauthConnect(appInfo){
		var self=this;
		var appName="Jira";
		if (appInfo.subPath!=""){
			appName=appInfo.subPath;
		}
		self.addStep("Querying a OAuth Access Token for "+appName,function(){
				self.apiCallOauth("/sessions/connect?jiraInstance="+
						self.instance+
						(appInfo.subPath!=""?"/":"")+appInfo.subPath+
						"&callbackServer="+self.proxyPath);
		});
		self.addStep("Waiting for grant in "+appName,self.apiOauthSecondStep);
		self.addStep("Setting Access Token for "+appName,function(accessToken,secret){
			log("Setting Access Token:"+accessToken+" and Secret:"+secret);
			appInfo.tokenNeeded=true;
			appInfo.tokenAccess=accessToken;
			appInfo.tokenTime=secret;
			self.popCallback();
		});
		self.continueTask();
	}
	
	apiGetFullList(appInfo,sTarget,resultName,callType,data,callback,arrHeaders){
		var self=this;
		var arrResults=[];
		var nLast=0;
		var fncAddIteration=function(nLast,nTotal,nBlockItems){
			//	extended_addStep(description,method,
			//progressMin,progressMax,newObj,totalWeight,methodWeight,sForkType,barrier){

			var frkTask=self.addStep("Getting "+resultName+" ["+nLast+","+nTotal+"]",function(){
					self.addStep("Calling "+sTarget+ " "+nLast, function(){
						self.apiCallApp(appInfo,sTarget,callType,data,nLast,1000,undefined,callback,arrHeaders);
					});
					self.addStep("Procesing the Call "+sTarget+ " "+nLast,function(response,xhr,sUrl,headers){
						var objResp;
						if (typeof response=="string"){
							objResp=JSON.parse(response);
						} else {
							objResp=response;
						}
						arrResults=arrResults.concat(objResp[resultName]);
						log("Retrieved "+resultName+":"+arrResults.length);
						self.continueTask([arrResults]);
					});
					self.continueTask();
			},0,nBlockItems,undefined,undefined,undefined,"INNER",undefined
			);
		};
		var fncIteration=self.createManagedCallback(function(){
			self.pushCallback(function(response,xhr,sUrl,headers){
				var objResp;
				if (typeof response=="string"){
					objResp=JSON.parse(response);
				} else {
					objResp=response;
				}
				var nTotal=objResp.total;
				var nResults=objResp.maxResults;
				var nInit=objResp.startAt;
				nLast=nInit+nResults;
				arrResults=arrResults.concat(objResp[resultName]);
				if (nLast<nTotal){
					self.addStep("Adding all blocks of response...",function(){
						while (nLast<nTotal){
							var nBlockItems=nResults;
							if (nLast+nBlockItems>nTotal){
								nBlockItems=nTotal-nLast;
							}
							fncAddIteration(nLast,nTotal,nBlockItems);
							nLast+=nResults;
						}
						self.continueTask();
					});
					self.addStep("Returning all the results...",function(){
						self.popCallback([arrResults]);
					});
					self.continueTask();
				} else {
					self.popCallback([arrResults]);
				}
			});
			self.apiCallApp(appInfo,sTarget,callType,data,nLast,1000,undefined,callback,arrHeaders);
		});
		fncIteration();
	}
	
	apiCallApp(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders){
		var self=this;
		var sTokenParam="";
		var bHasParams=true;
		if (sTarget.indexOf("?")<0){
			bHasParams=false;
		}
		var fncAddParam=function(name,value){
			if (typeof value!=="undefined"){
				if (!bHasParams){
					sTokenParam+="?";
					bHasParams=true;
				} else {
					sTokenParam+="&";
				}
				sTokenParam+=name+"="+value;
				
			}
		}
		if (appInfo.tokenNeeded){
			fncAddParam("access_token",appInfo.tokenAccess);
		}
		fncAddParam("startAt",startItem);
		fncAddParam("maxResults",maxResults);
		var newSubPath=appInfo.subPath;
		if (newSubPath!=""){
			newSubPath="/"+newSubPath;
		}
		var sTargetUrl=newSubPath+sTarget+sTokenParam;
		log("Calling api of "+(newSubPath==""?"Jira":appInfo.subPath) + " final url:"+sTargetUrl);
		self.pushCallback(function(response,xhr,sUrl,headers){
			log("Api Call Response of "+(newSubPath==""?"Jira":appInfo.subPath) 
					+ " final url:"+sTargetUrl);
			if (typeof xhr==="undefined"){
				log("=========");
				log("ERROR: xhr is undefined.... " );
				log("=========");
			} else {
				log(" --> Bytes:"+response.length);
			}
			if (xhr.status == 429){
				var millis=Math.round(((Math.random()*5)+10)*1000);
				log("too many request.... have to wait "+(Math.round(millis/10)/100)+" secs");
				setTimeout(self.createManagedCallback(function(){
					log("retrying api call");
					self.apiCallApp(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders);					
					}),millis);
			} else if ((xhr.status == 403)||(response=="")) { // forbidden
				self.addStep("Discarding Oauth Access Token",function(){
					self.apiCallOauth("/discardToken");
				});
				self.addStep("Getting Oauth Access Token",function(){
					self.oauthConnect(appInfo);
				});
				self.addStep("Retrying api call",function(){
					self.apiCallApp(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders);					
				});
				self.continueTask();
			} else {
				self.popCallback([response,xhr,sUrl,headers]);
			}
		});
		self.apiCallBase(sTargetUrl,callType,data,sResponseType,callback,arrHeaders);
	}
	apiCallBase(sTargetUrl,callType,data,sResponseType,callback,arrHeaders){
		var self=this;
		var newType="GET";
		if (typeof callType!=="undefined"){
			newType=callType;
		}
		var newData;
		if (typeof data!=="undefined"){
			newData=JSON.stringify(data);
		}
		var newResponseType='application/json';
		if (typeof sResponseType!=="undefined"){
			newResponseType=sResponseType;
		}
		var newCallback;//=callback;
		var newErrorCallback;//=callback;
		if (typeof newCallback==="undefined"){
			newCallback=self.createManagedCallback(function(responseObj){
				if (isDefined(callback)){
					setTimeout(function(){
							callback(responseObj);
					});
				}
			    self.popCallback([responseObj,self.JiraAPConnection]);
			  });
			newErrorCallback=self.createManagedCallback(function(xhr, statusText, errorThrown){
			    self.popCallback(["",xhr, statusText, errorThrown]);
			  })
		}
		self.JiraAPConnection.request({
			  url: sTargetUrl,
			  type:newType,
			  data:newData,
			  contentType: sResponseType,
			  success: newCallback,
			  error: newErrorCallback
			});
	}
}