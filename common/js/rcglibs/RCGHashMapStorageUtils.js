'use strict';
var RCGHashMapStorageManager=class RCGHashMapStorageManager{
	constructor(basePath,fncSave,fncLoad){
		var self=this;
		self.basePath=basePath;
		self.onSave=fncSave;
		self.onLoad=fncLoad;
	}
	setOnSave(fncOnSave){
		this.onSave=fncOnSave;
	}
	setOnLoad(fncOnLoad){
		this.onLoad=fncOnLoad;
	}
	isBaseType(item){
		return isString(item)||isNumber(item)||isBoolean(item);
	}
	save(key,item){
		var self=this;
		var objToSave={};
		var fileToSave="";
		if (self.isBaseType(item)){
			objToSave.type="baseType";
			objToSave.value=item;
		} if (isArray(item)){
			objToSave.type="array";
			objToSave.value=[];
			item.forEach(function(elem){
				if (self.isBaseType(elem)){
					objToSave.value.push(elem);
				} else {
					
				}
			});
			objToSave.value=item;
			
		}
	}
	load(key){
		
	}
}