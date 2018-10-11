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
		if (isString(item))return "s";
		if (isNumber(item))return "n";
		if (isBoolean(item))return "b";
		if (isArray(item)) return "a";
		if (isHashMap(item)) return "h";
		return "o";
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
	internal_saveFile(key,baseName,contentToSave,onSave,onError){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		log("Task for "+baseName+" ->"+runningTask.forkId);
		var innerOnSave=self.createManagedCallback(function(e){
			log(baseName+" saved."+contentToSave.length+" bytes."+e.loaded+"/"+e.total);
			if (isDefined(onSave)){
				onSave(key);
			} else {
				self.continueTask(key);
			}
		});
		var innerOnError=self.createManagedCallback(function(e){
			logError("Error saving "+baseName+" saved."+contentToSave.length+" bytes."+e);
			if (isDefined(onError)){
				onError(key,e);
			} else {
				self.continueTask("Error");
			}
	    });
		filesystem.SaveFile(baseName,contentToSave,innerOnSave,innerOnError);
	}
	save(key,item){
		var self=this;
		var fileToSave="";
		var baseName=self.basePath+"/"+key;
		var objToSave=self.getStorageObject(item);
		var jsonToSave=JSON.stringify(objToSave);
		var totalLength=jsonToSave.length;
		if (totalLength<(7*1024*1024)){
			self.internal_saveFile(key,baseName,jsonToSave,self.onSave,self.onError);
		} else {
			var arrParts=[];
			var iniPos=0;
			var blockLength=7*1024*1024;
			var endPos=iniPos+blockLength;
			var iCount=0;
			while (iniPos<totalLength){
				arrParts.push({
						    partNumber:iCount,
						    partName:(iCount==0?baseName:baseName+"_part_"+iCount),
						    iniPos:iniPos,
						    endPos:endPos
							});
				iniPos=endPos;
				endPos+=blockLength;
				iCount=iCount+1;
			}
			self.addStep("Saving Parallelized "+totalLength+" bytes in "+ arrParts.length+" parts",function(){
				var fncSavePart=function(part){
					debugger;
					var contentToSave=jsonToSave.substring(part.iniPos,part.endPos);
					var objPartToSave={isPart:true,partNumber:part.partNumber,content:contentToSave};
					var jsonPartToSave=JSON.stringify(objPartToSave);
					self.internal_saveFile(key,part.partName,jsonPartToSave,undefined,self.onError);
					//self.continueTask();
				}
				self.parallelizeCalls(arrParts,fncSavePart,undefined,5);
			});
			self.continueTask();
		}
	}
	processFileObj(objContent){
		var self=this;
		var objResult;
		if ((objContent.type=="s" /*"string"*/)||(objContent.type=="n"/*"number"*/)){
			return objContent.value;
		} else if (objContent.type=="a"/*"array"*/){
			objResult=[];
			objContent.value.forEach(function(elem){
				objResult.push(self.processFileObj(elem));
			});
		} else if (objContent.type=="h"/*"hashmap"*/){
			objResult=newHashMap();
			objResult.autoSwing=false;
			objContent.value.forEach(function(hsElem){
				var key=hsElem.key;
				var hsValue=hsElem.value;
				objResult.add(key,self.processFileObj(hsValue));
			});
			objResult.autoSwing=true;
			objResult.swing();
		} else if (objContent.type=="o" /*"object"*/){
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
		var innerOnLoad=self.createManagedCallback(function(sContent){
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
	    });
		var innerOnError=self.createManagedCallback(function(e){
			logError("Error Loading Key:"+key+"."+e);
			if (isDefined(self.onError)){
				self.onError(key,e);
			} else {
				self.continueTask("Error");
			}
	    });
		filesystem.ReadFile(fileName,innerOnLoad,innerOnError);					
	}
}