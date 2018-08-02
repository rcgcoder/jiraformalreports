var jrfFilter=class jrfFilter extends jrfNoop{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.autoAddPostHtml=false;
		self.postProcess="notMe";
		self.filterName=self.getAttrVal("name",undefined,false);
	}
	apply(){
		var self=this;
	//	debugger;
		self.indPostContentHtmlBuffer=self.pushHtmlBuffer();
		self.addPostHtml();
		var sFilterBody=self.popHtmlBuffer(self.indInnerContentHtmlBuffer); // getting the formula with possible html tags inside
		self.pushHtmlBuffer();
		sFilterBody="("+sFilterBody.saToString().trim()+")";
//		sFilterBody=sFilterBody.saRemoveInnerHtmlTags(""); // NOT NEEDED THE CLEAN FUNCTION REMOVES
		var fltName=self.replaceVars(self.filterName);
		self.model.filters.newFilter(fltName.saToString().trim(),sFilterBody);
	}

}

