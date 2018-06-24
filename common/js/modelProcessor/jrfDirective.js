var jrfDirective=class jrfDirective{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.uses=newHashMap();
		self.accumulators=newHashMap();
		var uses=self.getAttrVal("use").trim();
		if (uses!=""){
			var arrUses=uses.split(",");
			arrUses.forEach(function(use){
				if (!self.uses.exists(use)){
					self.uses.add(use,use);
				}
			});
		}
		var accumulators=self.getAttrVal("accumulators").trim();
		if (accumulators!=""){
			var arrAccums=accumulators.split(",");
			arrAccums.forEach(function(accum){
				var arrTypeField=accum.split("=");
				var accumTypeRelation=arrTypeField[0];
				var accumRelationField=arrTypeField[1];
				var sKey=accumTypeRelation+"."+accumRelationField;
				//.....add(sKey,{key:sKey,type:typeRelation,field:fieldName});
				if (!self.accumulators.exists(sKey)){
					self.accumulators.add(sKey,{key:sKey,type:typeRelation,field:fieldName});
				}
			});
		}
	}
	apply(){
		// do none
	}

}

