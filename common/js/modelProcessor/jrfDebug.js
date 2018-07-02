var jrfDebug=class jrfDebug extends jrfNoop{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.logAfterBreak=self.getAttrVal("continueLog");
		self.antLogStatus=loggerFactory.getLogger().enabled;
	}
	apply(){
		self.antLogStatus=loggerFactory.getLogger().enabled;
		loggerFactory.getLogger().enabled=true;
		log("Hardcoded breakPoint!!");
		debugger;
		super.apply();
	}
	endApplyToken(){
		super.endApplyToken();
		if ((self.logAfterBreak!="")&&(self.logAfterBreak.toLowerCase()=="false")){
			if (!self.antLogStatus)loggerFactory.getLogger().enabled=false;
		}
	}

}

