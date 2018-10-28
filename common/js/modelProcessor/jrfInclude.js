var includesCache=newHashMap();
var jrfInclude=class jrfInclude extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.type=self.getAttrVal("include").trim(); // supports only confluence and url 
		self.subtype=self.getAttrVal("subtype").trim(); // now only content or javascript
		self.url=replaceAll(self.getAttrVal("url").trim()," ","");
		self.url=replaceAll(self.url,"\t","");
		self.url=replaceAll(self.url,"\n","");
		self.url=replaceAll(self.url,"\r","");
		
		self.jsClass=self.getAttrVal("class").trim();
		self.preprocessed=false;
		self.includeId="";
		self.autoAddPostHtml=false;
		self.finalUrl="";
		
//		debugger;
		self.titlePostpend=self.getAttrVal("titlePostpend").trim(); // now only content or javascript

	}
	preload(tag){
//		debugger;
		var self=this;
		var srcUrl=self.url;
		if (self.type.toLowerCase()=="url"){
			self.addStep("Getting Include Url",function(){
            	if (!self.model.includeCache.exists(srcUrl)){
            		System.webapp.loadRemoteFile(srcUrl);
            	} else {
            		self.continueTask();
            	}
			});			
			self.addStep("Executing class...."+self.jsClass,function(){
            	if (!self.model.includeCache.exists(srcUrl)){
            		self.model.includeCache.add(srcUrl,srcUrl);
            		if (self.jsClass!=""){
						var jrfPluginClass=new window[self.jsClass](tag,self.model.report,self.model);
						jrfPluginClass.execute();
            		}
            	} 
				self.continueTask();
			});			
		} else if (self.type.toLowerCase()=="confluence"){
            var urlParts=srcUrl.split("pages/");
            urlParts=urlParts[1].split("/");
            var contentId=urlParts[0];
    		var hash = sha256.create();
    		hash.update("Confluence:"+contentId+"-"+self.titlePostpend);
    		var theHash=hash.hex();
            self.includeId=theHash;
            var cflc=System.webapp.getConfluence();
            var bCached=self.model.includeCache.exists(theHash);
            //debugger;
            if (bCached){
            	var oCached=self.model.includeCache.getValue(theHash);
            	var tagCached=oCached.tag;
            	tag.finalUrl=tagCached.finalUrl;
            	var hsChilds=tagCached.getChilds();
            	hsChilds.walk(function(child,iDeep,key){
            		tag.addChild(child,key);
            	});
        		self.continueTask();
            } else {
	            self.addStep("Downloading content:"+contentId+" from "+srcUrl,function(){
	                	cflc.getContent(contentId);
	                	tag.finalUrl=srcUrl;
	            });
    			var sTitle="";
                if (self.titlePostpend!=""){
                	var antContent;
        			self.addStep("Getting title and prepend:"+self.titlePostpend+" to downlad the especific content of "+srcUrl,function(jsonContent){
        				var oContent;
        				if (typeof jsonContent==="object") {
        					oContent=jsonContent;
        				} else {  
            				oContent=JSON.parse(jsonContent);
        				}
        				antContent=oContent;
        				sTitle=oContent.title;
        				sTitle+=" - "+self.replaceVars(self.titlePostpend).saToString().trim();
                    	cflc.getContentByTitle(sTitle);
        			});            
        			self.addStep("Processing Confluence search Content:"+contentId+" from "+srcUrl,function(jsonContent){
        				var oContent;
        				if (typeof jsonContent==="object") {
        					oContent=jsonContent;
        				} else {  
            				oContent=JSON.parse(jsonContent);
        				}
        				var oResult=antContent;
        				if (oContent.size>0){
    	                	tag.finalUrl="Title:("+sTitle+")";
        					oResult=oContent.results[0];
        				} else {
    	                	tag.finalUrl="url:("+srcUrl+")";
        				}
    					self.continueTask([oResult]);
        			});
                }
                self.addStep("Adding content " + contentId + (self.titlePostpend!=""?" ("+self.titlePostpend+")":"") + " to contents cache",function(jsonContent){
    				var oContent;
    				if (typeof jsonContent==="object") {
    					oContent=jsonContent;
    				} else {  
        				oContent=JSON.parse(jsonContent);
    				}
                	self.model.includeCache.add(theHash,{content:oContent,tag:tag});
                	self.continueTask([oContent]);
                });
    			var auxModel;
    			self.addStep("Processing Confluence Content:"+contentId+(sTitle!=""?" ("+sTitle+")":"")+" from "+srcUrl,function(oContent){
    				var sContentBody=oContent.body.storage.value;
    				if (sContentBody=="") alert("Content Body is ''");
    				sContentBody=self.model.report.cleanModel(sContentBody);
//    				sContentBody=decodeEntities(sContentBody);
    				self.continueTask([sContentBody]);
    			});
                if (isUndefined(self.subtype)||(self.subtype=="content")||(self.subtype=="")){
        			self.addStep("Processing HTML Model of Confluence Content:"+contentId+" from "+srcUrl,function(sContentHtmlBody){
    					auxModel=new jrfModel(self.model.report,sContentHtmlBody,self.reportElem);
    					auxModel.functionCache=self.model.functionCache;
    					auxModel.variables=self.model.variables;
    					auxModel.directives=self.model.directives;
    					auxModel.filters=self.model.filters;
    					auxModel.includeCache=self.model.includeCache;
    					auxModel.parse(sContentHtmlBody,tag);
    				});
    				self.addStep("Updating Accumulators of Parent Model... avoid multiple process ",function(){
    					auxModel.accumulatorList.walk(function(hsAccum,iDeep,key){
    						if (!self.model.accumulatorList.exists(key)){
    							self.model.accumulatorList.add(key,hsAccum);
    						};
    					});
    					self.continueTask();
    				});
                } else if (self.subtype=="javascript"){
                	log("Include Javascript");
        			self.addStep("Processing Javascript of Confluence Content:"+contentId+" from "+srcUrl,function(sJavascriptBody){
        				var sJs=sJavascriptBody;
        				log(sJs);
        				var arrTagsReplace=["<p>","<br>","</p>","</br>","<br/>","<br />"];
        				arrTagsReplace.forEach(function(sTag){
            				sJs=replaceAll(sJs,sTag,"\n");
        				});
        				arrTagsReplace.forEach(function(sTag){
            				sJs=replaceAll(sJs,sTag.toUpperCase(),"\n");
        				});
        				sJs=self.model.removeInnerTags(sJs,true);
        				//log(sJs);
        				if (isArray(sJs)) sJs=sJs.asToString();
        				System.webapp.addJavascriptString(sJs);
        				var issExtender=new issueExtender(tag,self.model.report,self.model);
        				issExtender.extendTreeIssues();
        				self.continueTask();

//        				auxModel=new jrfModel(self.model.report,sContentHtmlBody,self.reportElem);
//    					auxModel.parse(sContentHtmlBody,tag);
    				});
                } else {
                	self.continueTask();
                }
        	}
		}
		self.continueTask();
	}
	apply(){
//		debugger;
		var self=this;
		self.addStep("Processing all Childs of jrfInclude",function(){
			if (self.model.variables.getVar("withComprobations")){
				self.addHtml("["+self.tag.finalUrl+"]");
			}
			self.processAllChilds();
		});
		self.addStep("Finalizing the jrfInclude",function(){
			self.addPostHtml();
			var sContent=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
			sContent=self.replaceVars(sContent);
			self.addHtml(sContent);
			self.continueTask();
		});
	}

}

