var jrfDirective=class jrfDirective{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.uses=newHashMap();
		var uses=self.getAttrVal("use").trim();
		if (uses!=""){
			var arrUses=uses.split(",");
			arrUses.forEach(function(use){
				if (!self.uses.exists(use)){
					self.uses.add(use,use);
				}
			});
		}
	}
	apply(){
		// do none
	}

}

