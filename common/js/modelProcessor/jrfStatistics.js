var jrfStatistics=class jrfStatistics extends jrfLoopBase{//this kind of definition allows to hot-reload
	initialize(){
	}
	apply(){
		var self=this;
		var bAllRoots=false;
		if (self.reportElem==self.model.report){
			bAllRoots=true;
		}
		var elemsInForEach=self.getElementsInForEach();
		
	}
}