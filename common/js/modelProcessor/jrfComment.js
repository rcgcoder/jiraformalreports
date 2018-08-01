var jrfComment=class jrfComment extends jrfNoop{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.logComment=self.getAttrVal("logComment");
	}
	endApplyToken(){
		var self=this;
		super.endApplyToken();
		var sValAux=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
		if (self.logComment.saToString().trim.toLowerCase()!="true"){
			var antLogStatus=loggerFactory.getLogger().enabled;
			log(sValAux);
			loggerFactory.getLogger().enabled=antLogStatus;
		}
	}

}

