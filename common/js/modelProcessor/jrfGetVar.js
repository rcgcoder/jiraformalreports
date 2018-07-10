var jrfGetVar=class jrfGetVar extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.varName=self.getAttrVal("getvar");
	}
	apply(){
		var self=this;
		var sName=self.varName;
		sName=self.replaceVars(sName);
/*		if (isDefined(self.datetime)){
			//debugger;
		}
*/		var vValue=self.variables.getVar(sName,self.datetime);
		self.addHtml(vValue);
	}

}

