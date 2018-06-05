var jrfField=class jrfField{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.fieldName=self.getAttrVal("field");
		self.dateTime=self.getAttrVal("atDateTime");
		self.format=self.getAttrVal("inFormat");
	}
	apply(){
		var self=this;
		var bRendered=(self.format=="jiramarkup");
		var sValue;
		var auxDateTime;
		if (self.dateTime!=""){
			auxDateTime=toDateNormalDDMMYYYYHHMMSS(self.dateTime);			
		}
		sValue=self.reportElem.fieldValue(self.fieldName,true,auxDateTime);
		if (isString(sValue)&&(sValue.indexOf("&lt;jrf")>=0)){// if there is jrf tokens in the description
			var sHtml=decodeEntities(sValue);
			var theModel;
			self.addStep("Processing the field including the jrf tags",function(){
				theModel=new jrfModel(self.model.report,sHtml,self.reportElem);
				theModel.variables=self.model.variables;
				theModel.variables.pushVarEnv();
				theModel.process(); 
			});
			self.addStep("Setting the HTML",function(sModelProcessedResult){
				self.addHtml(sModelProcessedResult);
				theModel.variables.popVarEnv();
				self.continueTask();
			});
		} else {
			self.addHtml(sValue);
		}
	}

}

