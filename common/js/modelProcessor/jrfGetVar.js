var jrfGetVar=class jrfGetVar{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.varName=self.getAttrVal("getvar").trim();
	}
	apply(){
		var self=this;
		var sName=self.varName;
		var vValues=[];
		var vVarRefs=[];
		var sVarRef="";
		var iVar=0;
		var initInd=sName.lastIndexOf("{{");
		if (initInd<0){ // there is not {{varName}} tokens all the string is a varName
			var vValue=self.variables.getVar(sName);
			return self.addHtml(vValue);
		} 
		// if there are {{varname}} tokens.... the string is a function
		while (initInd>=0){
			var lastInd=sName.indexOf("}}",initInd+2);
			var sInnerVarName=sName.substring(initInd+2,lastInd);
			var vInnerVarValue=self.variables.getVar(sInnerVarName);
			if (isString(vInnerVarValue)){
				vValues.unshift('`'+vInnerVarValue+"`");
			} else {
				vValues.unshift(vInnerVarValue);
			}
			sVarRef="_vRef_"+iVar;
			vVarRefs.unshift(sVarRef);
			sName=sName.subString(0,initInd)+sVarRef+sName.subString(lastInd+2,sName.length);
			initInd=sName.lastIndexOf("{{");
		}
		var sFnc=sName;
		vValue=self.executeFunction(vValues,sFnc);
		self.addHtml(vValue);
	}

}

