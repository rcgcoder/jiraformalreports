var jrfGetVar=class jrfGetVar{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.varName=self.getAttrVal("getvar");
	}
	apply(){
		var self=this;
		var sValue=self.variables.getVar(self.varName);
		self.addHtml(sValue);
	}

}

