var jrfNoop=class jrfNoop{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
	}
	apply(){
		var self=this;
		self.pushHtmlBuffer();
		self.processAllChilds();
		var sContent=self.popHtmlBuffer();
		self.addHtml(sContent);
	}

}

