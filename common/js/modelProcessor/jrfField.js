var jrfField=class jrfField{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.fieldName=self.getAttrVal("field");
		self.datetime=self.getAttrVal("atDateTime").trim();
		self.format=self.getAttrVal("inFormat");
		self.moreParams=self.getAttrVal("aditionalparameters");
	}
	apply(){
		var self=this;
		var bRendered=(self.format=="jiramarkup");
		var sValue;
		var auxDateTime;
		if (self.datetime!=""){
			auxDateTime=toDateNormalDDMMYYYYHHMMSS(self.datetime);			
		}
		if (!isDefined(self.reportElem.fieldValue)){
			log("There is not function.... in reportElem:it appears to be a jrfReport element");
		} else {
			log("There is function fieldValue.... in reportElem:"+self.reportElem.getKey());
			var hsParams=newHashMap();
			if (self.moreParams!=""){
				var splitParams=self.moreParams.split(",");
				splitParams.forEach(function(aParam){
					var paramParts=aParam.split("=");
					var paramName=paramParts[0].trim();
					var paramValue=undefined;
					if (paramParts.length>1){
						paramValue=paramParts[1].trim();
					}
					hsParams.add(paramName,paramValue);
				});
			}
			sValue=self.reportElem.fieldValue(self.fieldName,true,auxDateTime,hsParams);
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

}

