var jrfInclude=class jrfInclude{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.type=self.getAttrVal("type").trim();
		self.url=self.getAttrVal("url").trim();
		self.autoAddPostHtml=false;
	}
	apply(){
		var self=this;
		var noopIndHtmlBuffer=self.pushHtmlBuffer();
		// if Confluence.... take the Content Id
		if (self.type.toLowerCase()=="confluence"){
			var sUrl=self.url;
			var arrParts=sUrl.split("/pages/");
			sUrl=arrParts[1];
			arrParts=sUrl.split("/");
			var contentId=arrParts[0];
			var confluence=System.webapp.getConfluence();
			// download the content....
			self.addStep("Getting Confluence Content:"+contentId,function(){
				confluence.getContent(contentId);
			});
			// parse the content
			self.addStep("Processing Confluence Content:"+contentId,function(jsonContent){
				var oContent=JSON.parse(jsonContent);
				var sHtmlBody=oContent.body.storage.value;
				sHtmlBody=decodeEntities(sHtmlBody);
				var theModel=new jrfModel(self.model.report,sHtmlBody);
				theModel.process(); // hash inner task....
			});
			self.addStep("Return processed content of:"+contentId,function(sResultHtml){
				var sProcessed=sResultHtml;
				self.addHtml(sProcessed); 
				self.continueTask();
			});
		}
		// apply the tags
	}

}

