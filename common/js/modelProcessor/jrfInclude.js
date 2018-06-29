var includesCache=newHashMap();
var jrfInclude=class jrfInclude extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.type=self.getAttrVal("include").trim(); // supports only confluence and url 
		self.subtype=self.getAttrVal("subtype").trim(); // now only content or javascript
		self.url=self.getAttrVal("url").trim();
		self.jsClass=self.getAttrVal("class").trim();
		self.preprocessed=false;
		self.includeId="";
		self.autoAddPostHtml=false;
	}
	preload(tag){
		var self=this;
		var srcUrl=self.url;
		if (self.type.toLowerCase()=="url"){
			self.addStep("Getting Include Url",function(){
				System.webapp.loadRemoteFile(srcUrl);
			});			
			if (self.jsClass!=""){
				self.addStep("Executing class...."+self.jsClass,function(){
    				var jrfPluginClass=new window[self.jsClass](tag,self.model.report,self.model);
    				jrfPluginClass.execute();
    				self.continueTask();
				});			
			}
		} else if (self.type.toLowerCase()=="confluence"){
            var urlParts=srcUrl.split("pages/");
            urlParts=urlParts[1].split("/");
            var contentId=urlParts[0];
    		var hash = sha256.create();
    		hash.update("Confluence:"+contentId);
    		var theHash=hash.hex();
            self.includeId=theHash;
            var cflc=System.webapp.getConfluence();
            self.addStep("Downloading content:"+contentId+" from "+srcUrl,function(){
            	cflc.getContent(contentId);
            });
            var auxModel;
			self.addStep("Processing Confluence Content:"+contentId+" from "+srcUrl,function(jsonContent){
				var oContent=JSON.parse(jsonContent);
				var sContentBody=oContent.body.storage.value;
				sContentBody=decodeEntities(sContentBody);
				self.continueTask([sContentBody]);
			});

            if (isUndefined(self.subtype)||(self.subtype=="content")||(self.subtype=="")){
    			self.addStep("Processing HTML Model of Confluence Content:"+contentId+" from "+srcUrl,function(sContentHtmlBody){
					auxModel=new jrfModel(self.model.report,sContentHtmlBody,self.reportElem);
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

//    				auxModel=new jrfModel(self.model.report,sContentHtmlBody,self.reportElem);
//					auxModel.parse(sContentHtmlBody,tag);
				});
            }
		}
		self.continueTask();
	}
	apply(){
		var self=this;
		self.addStep("Processing all Childs of jrfInclude",function(){
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

