var jrfSum=class jrfSum{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.varName=self.getAttrVal("var").trim();
	}
	apply(){
		var self=this;
		debugger;
		var hsValues=self.variables.getVars(self.varName);
		var sValue=0;
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

