var jrfNoop=class jrfNoop{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
//		debugger;
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.processVarsAtEnd=true;
	}
	apply(){
		var self=this;
//		debugger;
		self.addStep("Processing all Childs of NOOP",function(){
			self.processAllChilds();
		});
	}

}

