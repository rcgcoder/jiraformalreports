var jrfDirective=class jrfDirective extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		var self=this;
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
			//debugger;
			var arrAccums=accumulators.split(",");
			arrAccums.forEach(function(accum){
				var arrTypeField=accum.split("=");
				var accumTypeRelation=arrTypeField[0];
				var accumRelationField=arrTypeField[1];
				var sKey=accumTypeRelation+"."+accumRelationField;
				//.....add(sKey,{key:sKey,type:typeRelation,field:fieldName});
				var hsAux;
				if (!self.accumulators.exists(accumTypeRelation)){
					hsAux=newHashMap();
					self.accumulators.add(accumTypeRelation,hsAux);
				} else {
					hsAux=self.accumulators.getValue(accumTypeRelation);
				}
				hsAux.add(sKey,{key:sKey,type:accumTypeRelation,field:accumRelationField});
			});
		}
	}
	apply(){
		// do none
	}

}

