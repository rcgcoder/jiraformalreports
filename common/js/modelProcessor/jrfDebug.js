var jrfDebug=class jrfDebug extends jrfNoop{//this kind of definition allows to hot-reload
/*	constructor(tag,reportElem,model){
		super(tag,reportElem,model);
//		var self=this;
//		model.extendToken(self,tag,reportElem);
	}
*/	apply(){
		var antLogStatus=loggerFactory.getLogger().enabled;
		loggerFactory.getLogger().enabled=true;
		log("Hardcoded breakPoint!!");
		debugger;
		super.apply();
		if (!antLogStatus)loggerFactory.getLogger().enabled=false;
	}

}

