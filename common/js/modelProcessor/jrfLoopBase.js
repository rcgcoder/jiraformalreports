var jrfLoopBase=class jrfLoopBase extends jrfSubset{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
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
		self.loopStart();
		// processing total elements
		self.loopElements.walk(function(loopElem){
			var bContinue=self.loopItemProcess(loopElem);
			if (isDefined(bContinue)&&(!bContinue)){
				return false;
			}
		});
		self.loopEnd();
	}

}

