var jrfFilter=class jrfFilter extends jrfNoop{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.filterName=self.getAttrVal("name",undefined,false);
	}
	endApplyToken(){
		var self=this;
		debugger;
		super.endApplyToken();
		var sFilterBody=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
		sFilterBody="("+sFilterBody.saToString().trim()+")";
//		sFilterBody=sFilterBody.saRemoveInnerHtmlTags(""); // NOT NEEDED THE CLEAN FUNCTION REMOVES
		var fltName=self.replaceVars(self.filterName);
		self.model.filters.newFilter(fltName.saToString().trim(),sFilterBody);
	}

}

