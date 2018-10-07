'use strict';
log("Loading object storage utils");
var RCGObjectStorageManager=class RCGObjectStorageManager{
	constructor(basePath,taskManager,fncSave,fncLoad){
		var self=this;
		taskManager.extendObject(self);
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
		if (isHashMap(item)) return "hashmap";
		return "object";
	}
	getStorageObject(item){
		var self=this;
		var objToSave={};
		if (isDefined(item)){
			objToSave.type=self.getType(item);
			if (self.isBaseType(item)){
				objToSave.value=item;
			} else if (isArray(item)){
				objToSave.value=[];
				item.forEach(function(elem){
					objToSave.value.push(self.getStorageObject(elem));
				});
			} else if (isHashMap(item)){
				objToSave.value=[];
				item.walk(function(elem,deep,key){
					objToSave.value.push({key:key,value:self.getStorageObject(elem)});
				});
			} else {
				if (isDefined(item.getStorageObject)){
					objToSave.value=item.getStorageObject();
				} else {
					var arrProps=getAllProperties(item);
					objToSave.value={};
					arrProps.forEach(function(prop){
						objToSave.value[prop]=self.getStorageObject(item[prop]);
					});
				}
			}
		}
		return objToSave;
	}
	save(key,item){
		var self=this;
		var fileToSave="";
		var objToSave=self.getStorageObject(item);
		var jsonToSave=JSON.stringify(objToSave);
		filesystem.SaveFile(self.basePath+"/"+key,jsonToSave,
					function(){
						log("Key:"+key+" saved."+jsonToSave.length+" bytes");
						if (isDefined(self.onSave)){
							self.onSave(key);
						} else {
							self.continueTask(key);
						}
				    },
				    function(e){
						logError("Error saving Key:"+key+" saved."+jsonToSave.length+" bytes."+e);
						if (isDefined(self.onError)){
							self.onError(key,e);
						} else {
							self.continueTask("Error");
						}
				    });
	}
	processFileObj(objContent){
		var self=this;
		var objResult;
		if ((objContent.type=="string")||(objContent.type=="float")){
			return objContent.value;
		} else if (objContent.type=="array"){
			objResult=[];
			objContent.value.forEach(function(elem){
				objResult.push(self.processFileObj(elem));
			});
		} else if (objContent.type=="hashmap"){
			objResult=newHashMap();
			objContent.value.forEach(function(hsElem){
				var key=hsElem.key;
				var hsValue=hsElem.value;
				objResult.add(key,self.processFileObj(hsValue));
			});
			objResult.swing();
		} else if (objContent.type=="object"){
			var arrProps=getAllProperties(objContent.value);
			objResult={};
			arrProps.forEach(function(prop){
				objResult[prop]=self.processFileObj(objContent.value[prop]);
			});
		} 
		return objResult;
	}
	load(key,fncProcess){
		var self=this;
		var fileName=(self.basePath+"/"+key);
		filesystem.ReadFile(fileName,					
				function(sContent){
					log("Key:"+key+" loaded."+sContent.length+" bytes");
					var objContent=JSON.parse(sContent);
					var objProcessed=self.processFileObj(objContent);
					if (isDefined(self.onLoad)){
						self.onLoad(key,objProcessed);
					} else {
						if (isDefined(fncProcess)){
							fncProcess(objProcessed);
						}
						self.continueTask(objProcessed);
					}
			    },
			    function(e){
					logError("Error Loading Key:"+key+"."+e);
					if (isDefined(self.onError)){
						self.onError(key,e);
					} else {
						self.continueTask("Error");
					}
			    });
	}
}