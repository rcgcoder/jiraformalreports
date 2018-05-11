var jrfGetVar=class jrfGetVar{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.varName=self.getAttrVal("getvar").trim();
	}
	apply(){
		var self=this;
		var sName=self.varName;
		var initInd=sName.lastIndexOf("{{");
		var vValue="";
		if (initInd<0){ // there is not {{varName}} tokens all the string is a varName
			vValue=self.variables.getVar(sName);
		} else {
			vValue=self.replaceVarsAndExecute(sName);
		}
		self.addHtml(vValue);
	}

}

