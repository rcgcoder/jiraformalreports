var jrfField=class jrfField{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.fieldName=self.getAttrVal("field");
		self.format=self.getAttrVal("inFormat");
	}
	apply(){
		var self=this;
		var bRendered=(self.format=="jiramarkup");
		var sValue=self.reportElem.fieldValue(self.fieldName,true);
		if (sValue.indexOf("&lt;jrf")>=0){// if there is jrf tokens in the description
			var sHtml=decodeEntities(sValue);
			self.addStep("Processing the field including the jrf tags",function(){
				var theModel=new jrfModel(self.model.report,sHtml);
				theModel.process(); 
			});
			self.addStep("Setting the HTML",function(sModelProcessedResult){
				self.addHtml(sModelProcessedResult);
				self.continueTask();
			});
		} else {
			self.addHtml(sValue);
		}
	}

}

