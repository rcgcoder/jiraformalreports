var jrfDebug=class jrfDebug extends jrfNoop{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.postProcess="false";
		self.logText=self.getAttrVal("text");
		self.logAfterBreak=self.getAttrVal("continueLog");
		self.antLogStatus=loggerFactory.getLogger().enabled;
	}
	apply(){
		var self=this;
		self.antLogStatus=loggerFactory.getLogger().enabled;
		if (self.logText.saToString().trim()!=""){
			console.log(self.logText);
		} else {
			loggerFactory.getLogger().enabled=true;
			log("Hardcoded breakPoint!!");
			debugger;
		}
		super.apply();
	}
	endApplyToken(){
		var self=this;
		super.endApplyToken();
		if ((self.logAfterBreak!="")&&(self.logAfterBreak.toLowerCase()=="true")){
			loggerFactory.getLogger().enabled=true;
		} else {
			loggerFactory.getLogger().enabled=self.antLogStatus;
		}
	}

}

