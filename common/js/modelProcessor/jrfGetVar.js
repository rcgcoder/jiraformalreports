var jrfGetVar=class jrfGetVar{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.varName=self.getAttrVal("getvar").trim();
	}
	apply(){
		var self=this;
		var sName=self.varName;
		sName=self.replaceVars(sName);
		var vValue=self.variables.getVar(sName);
		self.addHtml(vValue);
	}

}

