var jrfSum=class jrfSum extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		this.varName=this.getAttrVal("var",self.reportElem,false);
	}
	
	apply(){
		var self=this;
		//debugger;
		var varName=self.replaceVars(self.varName).saToString().trim();
		var hsValues=self.variables.getVars(varName);
		var sValue=0;
		if (hsValues==""){
			if (self.model.report.config.AlertErrors){
				alert("The variable "+self.varName + " ("+varName+") used in tag "+ self.tag.getTagText() + " does not exists.\n My be a model error");
			}
		} else { 
			hsValues.walk(function(elem){
				if (isArray(elem)) elem=elem.saToString();
				var vValue=0;
				if ($.isNumeric(elem)){
					vValue=parseFloat(elem);
					sValue+=vValue;
				}
			});
		}
		self.addHtml(sValue);
	}

}

