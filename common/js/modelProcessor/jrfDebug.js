var jrfDebug=class jrfDebug extends jrfNoop{//this kind of definition allows to hot-reload
/*	constructor(tag,reportElem,model){
		super(tag,reportElem,model);
//		var self=this;
//		model.extendToken(self,tag,reportElem);
	}
*/	apply(){
		debugger;
		log("Push here a breakPoint");
		super.apply();
	}

}

