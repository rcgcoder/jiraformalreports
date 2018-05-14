var jrfDebug=class jrfDebug{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
	}
	apply(){
		log("Push here a breakPoing");
	}

}

