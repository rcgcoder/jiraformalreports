class RCGAtlassian{
	constructor(app){
		var self=this;
		self.proxyPath="";
		self.instance="";
		self.JiraAPConnection=AP;
		self.userId="";
		self.userName="";
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
	getUser(){
		var self=this;
		self.addStep("Calling the API for get Current User",function(){
			self.JiraAPConnection.getUser(self.createManagedCallback(function(user){
				  log("user id", user.id);
				  log("user key", user.key);
				  log("user name", user.fullName);
				  self.userId=user.key;
				  self.userName=user.fullName;
				  self.continueTask();
			}));
		});
		self.continueTask();
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
			  self.continueTask([xhr.response,xhr,sTargetUrl,arrHeaders]);
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
			self.addStep("Authorization call",function(){
				self.apiCallOauth("/sessionToken");
			});
			self.addStep("Checking for session access token",function(response,xhr,sUrl,headers) {
				//debugger;
				if  ((response==null)||
					(typeof response==="undefined")||
					(response.isToken==false)){
					setTimeout(checkIfToken,1000);
				} else {
					log("Oauth Access token:"+response.access);
					self.continueTask([response.access,response.secret]);
				}
			});
			self.continueTask();
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
		log("AppName ouath connecting:"+appName + " instance:"+self.instance);
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
			self.continueTask();
		});
		self.continueTask();
	}
	apiGetFullList(appInfo,sTarget,resultName,callType,data,callback,arrHeaders,bNotReturnAll){
		var self=this;
		var arrResults=[];
		var nLast=0;
		self.addStep("Calling for "+sTarget,function(){
			self.addStep("Calling to api "+sTarget,function(){
				self.apiCallApp(appInfo,sTarget,callType,data,nLast,1000,undefined,undefined,arrHeaders);
			});	
			if (isDefined(callback)){
				var vResult=[];
				self.addStep("Calling the user callback",function(response,xhr,sUrl,headers){
					vResult=[response,xhr,sUrl,headers];
					var fncManagedCallback=self.createManagedCallback(callback);
					fncManagedCallback(response,xhr,sUrl,headers);
				});
				self.addStep("Returning Result",function(){
					self.continueTask(vResult);
				});
			}
			self.addStep("Processing result of call "+sTarget,function(response,xhr,sUrl,headers){
				var objResp;
				if (typeof response==="string"){
					if (response=="") return self.continueTask([[]]);
					try {
						objResp=JSON.parse(response);
					} catch (e) {
						debugger;
						alert("Error Parsing response");
					}
				} else {
					objResp=response;
				}
				var nTotal=objResp.total;
				var nResults=objResp.maxResults;
				var nInit=objResp.startAt;
				nLast=nInit+nResults;
				if (isUndefined(bNotReturnAll)||(!bNotReturnAll)){
					arrResults=arrResults.concat(objResp[resultName]);
				}
				if (nLast>=nTotal){
					return self.continueTask([arrResults]);					
				} else if (nLast<nTotal){
					//debugger;
					var hsListItemsToProcess=newHashMap();
					while (nLast<nTotal){
						var nBlockItems=nResults;
						if (nLast+nBlockItems>nTotal){
							nBlockItems=nTotal-nLast;
						}
						hsListItemsToProcess.push({first:nLast,total:nTotal,nBlockItems:nBlockItems});
						//fncAddIteration(nLast,nTotal,nBlockItems);
						nLast+=nResults;
					}
					var fncCall=function(callInfo){
						self.addStep("Doing ["+callInfo.first+","+(callInfo.first+callInfo.nBlockItems)+"]",function(){
							self.apiCallApp(appInfo,sTarget,callType,data,callInfo.first,callInfo.nBlockItems,undefined,undefined,arrHeaders);
						});
						if (isDefined(callback)){
							var vResult=[];
							self.addStep("Calling the user callback",function(response,xhr,sUrl,headers){
								vResult=[response,xhr,sUrl,headers];
								var fncManagedCallback=self.createManagedCallback(callback);
								fncManagedCallback(response,xhr,sUrl,headers);
							});
							self.addStep("Return values",function(){
								self.continueTask(vResult);
							});
						}
						self.continueTask();
					}
					var fncProcess=function(item,response){
						if (isUndefined(bNotReturnAll)||(!bNotReturnAll)){
							var objResp;
							if (typeof response=="string"){
								objResp=JSON.parse(response);
							} else {
								objResp=response;
							}
							arrResults=arrResults.concat(objResp[resultName]);
							log("Retrieved "+resultName+":"+arrResults.length);
						}
					}
					//debugger;
					self.parallelizeCalls(hsListItemsToProcess,fncCall,fncProcess,10);
				}
			});
			self.continueTask();
		});
		if (isUndefined(bNotReturnAll)||(!bNotReturnAll)){
			self.addStep("Returnig results for "+sTarget,function(){
				self.continueTask([arrResults]);
			});
		}
		self.continueTask();
	}
	authenticate(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders){
		var self=this;
		self.addStep("Authenticating....",function(){
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
		});
		self.continueTask();
	}
	apiCallApp(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders,oCallSecurity,aditionalOptions){
		var self=this;
		var sTokenParam="";
		var bHasParams=true;
		if (sTarget.indexOf("?")<0){
			bHasParams=false;
		}
		var oSecurity={proxy:false,token:false};
		if (isDefined(oCallSecurity)){
			oSecurity=oCallSecurity;
			if (isUndefined(oSecurity.token))oSecurity.token=false;
			if (isUndefined(oSecurity.proxy))oSecurity.proxy=false;
		} 
		if ((oSecurity.token)&&(appInfo.tokenAccess=="")){
			//needs to get a Token
			self.pushCallback(function(){
				self.oauthConnect(appInfo);
			})
		}
		//"Doing de API call..."
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
		self.addStep("Doing the API call..."+sTarget,function(){
	/*		if (appInfo.tokenNeeded){
				fncAddParam("access_token",appInfo.tokenAccess);
			}
	*/		fncAddParam("startAt",startItem);
			fncAddParam("maxResults",maxResults);
			var newSubPath=appInfo.subPath;
			if (newSubPath!=""){
				newSubPath="/"+newSubPath;
			}
			var sTargetUrl=newSubPath+sTarget+sTokenParam;
			log("Calling api of "+(newSubPath==""?"Jira":appInfo.subPath) + " final url:"+sTargetUrl);
			var auxHeaders=arrHeaders;
			var auxCallType="GET";
			if (isDefined(callType)) auxCallType=callType;
			if (oSecurity.token){
				auxHeaders={};
				var oAuthString= ' OAuth oauth_consumer_key="'+"OauthKey"+'",'+
								'oauth_token="' +appInfo.tokenAccess+'",'+
								'oauth_version="'+"1.0"+'"';
				auxHeaders["Authorization"]=oAuthString;
			}
			self.addStep("Base API Call "+sTargetUrl,function(){
				self.apiCallBase(sTargetUrl,auxCallType,data,sResponseType,auxHeaders,appInfo.tokenAccess,oSecurity,aditionalOptions);
			});
			self.addStep("Processing result and retry if necesary of "+sTargetUrl,function(response,xhr,sUrl,headers){
				//debugger;
				log("Api Call Response of "+(newSubPath==""?"Jira":appInfo.subPath) 
						+ " final url:"+sTargetUrl);
				if (typeof xhr==="undefined"){
					log("=========");
					log("ERROR: xhr is undefined.... " );
					log("=========");
					self.continueTask(["",xhr,sUrl,headers]);
				} else {
					log(" --> Bytes:"+response.length);
					if ((xhr.status == 429)){
						var millis=Math.round(((Math.random()*10)+5)*1000);
						log("too many request.... have to wait "+(Math.round(millis/10)/100)+" secs");
						setTimeout(self.createManagedCallback(function(){
							log("retrying api call");
							self.apiCallApp(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders);					
							}),millis);
					} else if (xhr.status == 400){
						alert(headers);
						return self.continueTask([response,xhr,sUrl,headers]);
					} else if (xhr.status == 403) { // forbidden
						if (appInfo.tokenAccess==""){
							self.authenticate(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders);
						} else {
							log(xhr.responseText);
							self.continueTask(["",xhr,sUrl,headers]);
						}
					} else if (xhr.status==500){
						logError("Error 500 in atlassian server calling to "+sTarget);
					} else {
						self.continueTask([response,xhr,sUrl,headers]);
					}
				}
			});
			if (isDefined(callback)){
				self.addStep("Calling callback to "+sTargetUrl,function([response,xhr,sUrl,headers]){
					callback(response,xhr,sUrl,headers);
					self.continueTask([response,xhr,sUrl,headers]);
				});
			}
			self.continueTask();
		});
		self.continueTask();
	}
	apiCallBase(sTargetUrl,callType,data,sResponseType,arrHeaders,tokenAccess,oCallSecurity,aditionalOptions){
		var self=this;
		var newType="GET";
		if (typeof callType!=="undefined"){
			newType=callType;
		}
		var oSecurity={proxy:false,token:false};
		if (isDefined(oCallSecurity)){
			oSecurity=oCallSecurity;
			if (isUndefined(oSecurity.token))oSecurity.token=false;
			if (isUndefined(oSecurity.proxy))oSecurity.proxy=false;
		}
		var newData;
		if (typeof data!=="undefined"){
			newData=JSON.stringify(data);
			//newData=data;
		}
		var newResponseType='application/json';
		if (typeof sResponseType!=="undefined"){
			newResponseType=sResponseType;
		}
		var newCallback;//=callback;
		var newErrorCallback;//=callback;
		newCallback=self.createManagedCallback(function(responseObj){
		    self.popCallback([responseObj,self.JiraAPConnection]);
		  });
		newErrorCallback=self.createManagedCallback(function(xhr, statusText, errorThrown){
		    self.popCallback(["",xhr, statusText, errorThrown]);
		  })
		var fncAddAditionalOptions=function(options){
			if (isDefined(aditionalOptions)){
				var arrProps=getAllProperties(aditionalOptions);
				arrProps.forEach(function(property){
					options[property]=aditionalOptions[property];
				});
			}
		}
		if (!oSecurity.proxy){
			var options = {
					  url: sTargetUrl,
					  type:newType,
					  data:newData,
					  contentType: sResponseType,
					  headers: arrHeaders,
					  success: newCallback,
					  error: newErrorCallback
			}
			fncAddAditionalOptions(options);
			self.JiraAPConnection.request(options);
		} else {
			var jqElem=$;
			
			log("Cookie:"+document.cookie);
			document.cookie = "atlassian.xsrf.token" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
			log("Cookie:"+document.cookie);
			var oAuthString= ' OAuth oauth_consumer_key="'+"OauthKey"+'",'+
					'oauth_token="' +tokenAccess+'",'+
					'oauth_version="'+"1.0"+'"';
			log("OAUT STRING:"+oAuthString);
			sTargetUrl="/jfreports/proxy/"+"rcgcoder.atlassian.net"+"/endproxy"+sTargetUrl;
			var options = {
				url: sTargetUrl,
				method: newType,
				headers: {
					'Content-Type': 'application/json',
					'Authorization':oAuthString
					//'Authorization':"Bearer "+oauthAccessToken+"",
					/*						'access_token': oauthAccessToken
					'oauth_consumer_key':"OauthKey",
					'oauth_token':oauthAccessToken,
					*/					  
					},
				data: newData,
				dataType: newResponseType,
			    success: newCallback,
			    error: newErrorCallback
			};
			fncAddAditionalOptions(options);
			$.ajax(options);/*.done(function(){
				alert("end Call");
				log("Cookie:"+document.cookie);
				document.cookie = "atlassian.xsrf.token" + '=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				log("Cookie:"+document.cookie);
			});*/
			
			
/*			$.ajax({
			    type: 'POST',
			    url: sTargetUrl,
			    headers: arrHeaders,
			    data:newData
//			    dataType:"json"
			    //OR
			    //beforeSend: function(xhr) { 
			    //  xhr.setRequestHeader("My-First-Header", "first value"); 
			    //  xhr.setRequestHeader("My-Second-Header", "second value"); 
			    //}
			}).done(function(data) { 
			    alert(data);
			});
			*/
		}
	}
	renderContent(appInfo,contentToRender){
		var self=this;
		self.pushCallback(function(objResponse,xhr, statusText, errorThrown){
			log("Rendered Content:"+objResponse);
			self.continueTask();
		});
		
//		apiCallApp(appInfo,sTarget,callType,data,startItem,maxResults,sResponseType,callback,arrHeaders){

		self.apiCallApp(appInfo,
					//"https://rcgcoder.atlassian.net/rest/api/1.0/render",
				        "https://cantabrana.no-ip.org/jfreports/proxy/rcgcoder.atlassian.net/endproxy/rest/api/1.0/render",
						"POST",
						{"rendererType":"atlassian-wiki-renderer","unrenderedMarkup":contentToRender},
						undefined,
						undefined,
						"text",
						undefined,
						undefined,
						true);
	}
}