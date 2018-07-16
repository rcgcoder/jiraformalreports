var jrfSum=class jrfSum extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		this.varName=this.getAttrVal("var",self.reportElem,false);
	}
	
	apply(){
		var self=this;
		//debugger;
		var varName=self.replaceVars(self.varName);
		var hsValues=self.variables.getVars(varName);
		var sValue=0;
		if (hsValues==""){
			alert("The variable "+self.varName+" does not exists. My be a model error");
		}
		hsValues.walk(function(elem){
			if (isArray(elem)) elem=elem.saToString();
			var vValue=0;
			if ($.isNumeric(elem)){
				vValue=parseFloat(elem);
				sValue+=vValue;
			}
		});
		self.addHtml(sValue);
	}

}

