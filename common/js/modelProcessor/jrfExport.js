var jrfExport=class jrfExport extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.objType=self.getAttrVal("object");
		self.exportFormat=self.getAttrVal("export");
	}
	apply(){
		var self=this;
		self.addHtml(`<button onclick="modelInteractiveFunctions.alert('test of alert')">Export to `+self.exportFormat+"</button>");
	}

}

