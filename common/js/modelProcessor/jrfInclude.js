var includesCache=newHashMap();
var jrfInclude=class jrfInclude{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.type=self.getAttrVal("include").trim();
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
			self.addStep("Processing Confluence Content:"+contentId+" from "+srcUrl,function(jsonContent){
				var oContent=JSON.parse(jsonContent);
				var sHtmlBody=oContent.body.storage.value;
				sHtmlBody=decodeEntities(sHtmlBody);
				theModel=new jrfModel(self.model.report,sHtmlBody,self.reportElem);
				theModel.parse(sHtmlBody,self);
			});

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

