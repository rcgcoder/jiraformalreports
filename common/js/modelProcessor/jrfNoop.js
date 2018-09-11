var jrfNoop=class jrfNoop extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
//		debugger;
		var self=this;
		if ((self.tag.attr_TagText.toUpperCase().indexOf("SUM")>=0)
			||
			(self.tag.attr_TagText.toUpperCase().indexOf("FORMULA")>=0)){
			logError("The tag "+self.tag.attr_TagText() +" is incorrectly parsed.... processed as NOOP");
		}
			
//		if (self.postProcess=="") self.processVarsAtEnd=true;
	}
	apply(){
		var self=this;
		//debugger;
		self.addStep("Processing all Childs of NOOP",function(){
			self.processAllChilds();
		});
	}

}

