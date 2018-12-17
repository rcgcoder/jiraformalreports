var jrfField=class jrfField extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
		self.fieldName=self.getAttrVal("field",self.reportElem,false);
		if (self.fieldName.trim().toLowerCase()=="status.name"){
			//debugger;
		}
		self.format=self.getAttrVal("inFormat");
	}
	apply(){
		var self=this;
		var sRenderedPostText="";
		if (self.format=="rendered"){
			sRenderedPostText="_rendered";
			debugger;
		}
		var bRendered=(self.format=="jiramarkup");
		var sValue;
		if (!isDefined(self.reportElem.fieldValue)){
			log("There is not function.... in reportElem:it appears to be a jrfReport element");
		} else {
            log("There is function fieldValue.... in reportElem:"+self.reportElem.getKey());
            var bAsStep=false;
            var fieldName=self.fieldName;
            if (fieldName.indexOf("{{")>=0){
                debugger;
                bAsStep=true;
                fiedName=self.getStringReplacedScript(fieldName);
            }

			self.executeAsStepMayRetry(bAsStep,"AsyncFieldException",function(){
				/*if (self.fieldName=="Billing.calculos.comentarios"){
					debugger;
				}*/
				sValue=self.reportElem.fieldValue(fieldName+sRenderedPostText,true,self.datetime,self.otherParams);
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
					});
				} else {
					self.addHtml(sValue);
				}
			});
		}
	}

}

