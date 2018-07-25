var jrfExport=class jrfExport extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.objType=self.getAttrVal("object");
		self.exportFormat=self.getAttrVal("export");
	}
	apply(){
		var self=this;
		var btnId="btn_"+modelInteractiveFunctions.newInteractiveId();
		if (self.objType.toLowerCase()=="table"){
			self.addHtml(`<button id="`+btnId+`" onclick="modelInteractiveFunctions.exportTableToXlsx('`+btnId+`',window)">Export to `+self.exportFormat+"</button>");
		}
	}

}

