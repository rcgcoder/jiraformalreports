var jrfNoop=class jrfNoop extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
//		debugger;
		var self=this;
		if (self.postprocess=="") self.processVarsAtEnd=true;
	}
	apply(){
		var self=this;
		//debugger;
		self.addStep("Processing all Childs of NOOP",function(){
			self.processAllChilds();
		});
	}

}

