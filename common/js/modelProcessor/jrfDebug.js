var jrfDebug=class jrfDebug extends jrfNoop{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.antLogStatus=loggerFactory.getLogger().enabled;
	}
	/*	constructor(tag,reportElem,model){
		super(tag,reportElem,model);
//		var self=this;
//		model.extendToken(self,tag,reportElem);
	}
*/	apply(){
		self.antLogStatus=loggerFactory.getLogger().enabled;
		loggerFactory.getLogger().enabled=true;
		log("Hardcoded breakPoint!!");
		debugger;
		super.apply();
	}
	endApplyToken(){
		super.endApplyToken();
		if (!self.antLogStatus)loggerFactory.getLogger().enabled=false;
	}

}

