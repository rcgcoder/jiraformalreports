'use strict';
log("Loading object storage utils");
var RCGObjectStorageManager=class RCGObjectStorageManager{
	constructor(basePath,fncSave,fncLoad){
		var self=this;
		self.basePath=basePath;
		self.onSave=fncSave;
		self.onLoad=fncLoad;
		self.onError=function(error){
			alert("Error writing the object:"+e);
		}
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
	getType(item){
		if (isString(item))return "string";
		if (isNumber(item))return "float";
		if (isBoolean(item))return "boolean";
		if (isArray(item)) return "array";
		return "object";
	}
	getStorageObject(item){
		var objToSave={};
		if (isDefined(item)){
			if (self.isBaseType(item)){
				objToSave.type=self.getType(item);
				objToSave.value=item;
			} if (isArray(item)){
				objToSave.type="array";
				objToSave.value=[];
				item.forEach(function(elem){
					objToSave.push(self.getStorageObject(elem));
				});
			} else {
				objToSave.type="object";
				if (item.isStorable()){
					objToSave.value=item.getStorageObject();
				}
				var arrProps=getAllProperties(item);
				objToSave.value={};
				arrProps.forEach(function(prop){
					objToSave.value[prop]=self.getStorageObject(item[prop]);
				});
			}
		}
		return objToSave;
	}
	save(key,item){
		var self=this;
		var fileToSave="";
		var objToSave=self.getStorageObject(item);
		var jsonToSave=JSON.stringify(objToSave);
		filesystem.SaveFile(self.basePath+"/"+key,jsonToSave,self.onSave,self.onError);
	}
	load(key){
		
	}
}