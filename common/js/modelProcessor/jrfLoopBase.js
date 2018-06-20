var jrfLoopBase=class jrfLoopBase extends jrfSubset{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		super(tag,reportElem,model);
		var self=this;
		self.autoAddPostHtml=false;
		self.loopElements;
	}
	loopStart(){
		
	}
	loopItemProcess(elem){
		
	}
	loopEnd(){
		
	}
	apply(){
		var self=this;
		self.loopElements=super.apply();
		loopStart();
		// processing total elements
		elemsInForEach.walk(function(eachElem){
			self.loopItemProcess(elem);
		});
		loopEnd();
	}

}

