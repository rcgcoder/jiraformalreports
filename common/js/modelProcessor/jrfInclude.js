var includesCache=newHashMap();
var jrfInclude=class jrfInclude{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.type=self.getAttrVal("include").trim(); // supports only confluence... future: html, etc..
		self.subtype=self.getAttrVal("subtype").trim(); // now only content or javascript
		self.url=self.getAttrVal("url").trim();
		self.preprocessed=false;
		self.includeId="";
		self.autoAddPostHtml=false;
	}
	preload(tag){
		var self=this;
		if (self.type.toLowerCase()=="confluence"){
			var srcUrl=self.url;
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

            if (isUndefined(self.subtype)||(self.subtype=="content")){
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
    				var sJs=self.model.removeInnerTags(sJavascriptBody,true);
    				log(sJs);
    				var arrTagsReplace=["<p>","<br>","</p>","</br>","<br/>"];
    				arrTagsReplace.forEach(function(sTag){
        				sJs=replaceAll(sJs,sTag,"\n");
    				});
    				arrTagsReplace.forEach(function(sTag){
        				sJs=replaceAll(sJs,sTag.toUpperCase(),"\n");
    				});
    				System.webapp.addJavascriptString(sJs);
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
		var noopIndHtmlBuffer=self.pushHtmlBuffer();
		self.addStep("Processing all Childs of jrfInclude",function(){
			self.processAllChilds();
		});
		self.addStep("Finalizing the jrfInclude",function(){
			self.addPostHtml();
			var sContent=self.popHtmlBuffer(noopIndHtmlBuffer);
			sContent=self.replaceVars(sContent);
			self.addHtml(sContent);
			self.continueTask();
		});
	}

}

