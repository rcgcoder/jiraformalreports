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
			alert("Error writing the object:"+error);
		}
		self.functions=newHashMap();
	}
	setOnSave(fncOnSave){
		this.onSave=fncOnSave;
	}
	setOnLoad(fncOnLoad){
		this.onLoad=fncOnLoad;
	}
	isBaseType(itemType){
		return (itemType=="s")||(itemType=="n")||(itemType=="b");
	}
	getType(item){
		if (isMethod(item))return "m";
		if (isString(item))return "s";
		if (isNumber(item))return "n";
		if (isBoolean(item))return "b";
		if (isArray(item)) return "a";
		if (isHashMap(item)) return "h";
		if (isDate(item)) return "d";
		if (isObject(item)){
			if (isDefined(item.getStorageObject)){
				if (isDefined(item.getFactory)){
					return "fo";
				}
				return "co";
			} else {
				return "o";
			}
		}
		if (isNull(item)){
			return "null";
		}
		if (isUndefined(item)){
			return "undef";
		}
		// part is "p"
		return "o";
	}
	getStorageObject(item){
		var self=this;
		var objToSave={};
		if (isDefined(item)){
			objToSave.type=self.getType(item);
			if (self.isBaseType(objToSave.type)){
				objToSave.value=item;
			} else if (objToSave.type=="d"){
				objToSave.value=(""+item);
			} else if (objToSave.type=="m"){
				var sFncFormula=""+item.toString();
				var hash = sha256.create();
				hash.update(sFncFormula);
				var theHash=hash.hex();
				if (!self.functions.exists(theHash)){
					self.functions.add(theHash,item);
				};
				objToSave.value=theHash;
			} else if (objToSave.type=="a"){
				objToSave.value=[];
				item.forEach(function(elem){
					objToSave.value.push(self.getStorageObject(elem));
				});
			} else if (objToSave.type=="h"){
				objToSave.value=[];
				item.walk(function(elem,deep,key){
					objToSave.value.push({key:key,value:self.getStorageObject(elem)});
				});
			} else if (objToSave.type=="o"){
				var arrProps=getAllProperties(item);
				objToSave.atts={};
				var nProps=arrProps.length;
				if (nProps>0){
					arrProps.forEach(function(prop){
						objToSave.atts[prop]=self.getStorageObject(item[prop]);
					});
//				} else {
//					debugger; 
//					logError("There is not properties of object");
				}
			} else if (objToSave.type=="co"){
				objToSave.className=item.constructor.name;
				objToSave.value=item.getStorageObject(self);
			} else if (objToSave.type=="fo"){
				objToSave.className=item.constructor.name;
				objToSave.factoryName=item.getFactory().name;
				objToSave.value={key:item.getId()};
				//item.saveToStorage(self);
			} else if (objToSave.type=="null"){
				objToSave.value=undefined;
			} else if (objToSave.type=="undef"){
				objToSave.value=undefined;
				//item.saveToStorage(self);
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
//			alert("Test:"+baseName);
//			debugger;
			if (isDefined(onSave)){
				onSave(key);
			} else {
				log(baseName + " Continue Task");
				self.continueTask(key);
			}
		});
		var innerOnError=self.createManagedCallback(function(e){
			logError("Error saving "+baseName+" saved."+contentToSave.length+" bytes."+e);
			debugger;
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
		self.addStep("Getting info to store from item "+key,function(){
			var objToSave=self.getStorageObject(item);
			self.continueTask([objToSave]);
		});
		self.addStep("Saving the object "+key,function(objToSave){
			var jsonToSave=JSON.stringify(objToSave);
			var totalLength=jsonToSave.length;
			log("Storer save:"+baseName);
			if (totalLength<(7*1024*1024)){
	//			log("Internal saveFile called for:"+baseName);
				self.internal_saveFile(key,baseName,jsonToSave,self.onSave,self.onError);
			} else {
	//			debugger;
				var arrParts=[];
				var iniPos=0;
				var blockLength=7*1024*1024;
				var endPos=iniPos+blockLength;
				var iCount=0;
				while (iniPos<totalLength){
					arrParts.push({
							    partNumber:arrParts.length,
							    partName:(arrParts.length==0?baseName:baseName+"_part_"+arrParts.length),
							    totalParts:0,
							    iniPos:iniPos,
							    endPos:endPos
								});
					iniPos=endPos;
					endPos+=blockLength;
				}
				arrParts[0].totalParts=arrParts.length;
				self.addStep("Saving Parallelized "+totalLength+" bytes in "+ arrParts.length+" parts",function(){
					var fncSavePart=function(part){
	//					debugger;
	//					log("Parrallel Saving step:"+part.partNumber);
						self.addStep("Save Part:"+part.partNumber,function(){
	//						debugger;
							var contentToSave=jsonToSave.substring(part.iniPos,part.endPos);
							var objPartToSave={type:"p",
												partNumber:part.partNumber,
												totalParts:part.totalParts,
												content:contentToSave};
							var jsonPartToSave=JSON.stringify(objPartToSave);
	//						log("Part:"+part.partNumber+" Key:"+key+" part:"+part.partName+" length:"+jsonPartToSave.length+" ini:"+part.iniPos+" end:"+part.endPos);
							self.internal_saveFile(key,part.partName,jsonPartToSave,undefined,self.onError);
						});
						self.continueTask();
					}
					var fncProcessed=function(part){
						log("Saved Part:"+part.partNumber+" Key:"+key+" part:"+part.partName+" ini:"+part.iniPos+" end:"+part.endPos);
					}
	//				debugger;
					self.parallelizeCalls(arrParts,fncSavePart,fncProcessed,5);
				});
				self.addStep("Everithing Saved",function(){
					log("Every Thing is Saved for:"+baseName);
					self.continueTask();
				});
				self.continueTask();
			}
		});
		self.continueTask();
	}
	processFileObj(objContent,fsKey,filename){
		debugger;
		var self=this;
		if (self.isBaseType(objContent.type)){ 
			return objContent.value;
		} else if (objContent.type=="null"/*"null"*/){
			return null;
		} else if (objContent.type=="undef"/*"undef"*/){
			return undefined;
		} else if (objContent.type=="d" /* date */){
			return new Date(objContent.value);
		} else if (objContent.type=="m" /* method */){
			var theHash=objContent.value;
			var theMethod=self.functions.getValue(theHash);
			return theMethod;
		} else if (objContent.type=="a"/*"array"*/){
			var objResult=[];
			objContent.value.forEach(function(elem){
				var oPartial=self.processFileObj(elem);
				objResult.push(oPartial);
			});
			return objResult;
		} else if (objContent.type=="h"/*"hashmap"*/){
			var objResult=newHashMap();
			objResult.autoSwing=false;
			objContent.value.forEach(function(hsElem){
				var key=hsElem.key;
				var hsValue=hsElem.value;
				var oPartial=self.processFileObj(hsValue);
				objResult.add(key,oPartial);
			});
			objResult.autoSwing=true;
			objResult.swing();
			return objResult;
		} else if (objContent.type=="o" /*"object"*/){
			var arrProps=getAllProperties(objContent.atts);
			var objResult={};
			arrProps.forEach(function(prop){
				var oAtt=objContent.atts[prop];
				var oPartial;
				if (isDefined(oAtt.type)){
					oPartial=self.processFileObj(oAtt);
				} else {
					oPartial=oAtt;
				}
				objResult[prop]=oPartial;
			});
			return objResult;
		} else if (objContent.type=="co" /* custom object */){
			var objResult=new window[objContent.className]();
			objResult.loadFromStorageObject(objContent.value);
			return objResult;
		} else if (objContent.type=="fo" /* object with factory */){
			debugger;
			var factoryName=objContent.factoryName;
			var theFactory=baseDynamicObjectFactory.getFactoryGlobal(factoryName);
			var storedObj=objContent.value;
			var objId=storedObj.key;
			var dynObj=theFactory.getById(objId);
			if (dynObj===""){ // if object not exists in factory.... creates one
				dynObj=theFactory.new(storedObj.name,objId); // the new object is marked as changed and locked
				dynObj.setFullyUnloaded();
				dynObj.clearChanges(); // mark as unchanged
				dynObj.setStored(true);
				dynObj.unlock(); // unlock!
			}
			return dynObj;
		} else if (objContent.type=="p" /* object part */){
			if (objContent.partNumber==0){
				//debugger;
				var arrContents=new Array(objContent.totalParts);
				arrContents[0]=objContent.content;
				self.addStep("Retrieving other "+(objContent.totalParts-1)+" parts",function(){
					var arrPets=[];
					for (var i=1;i<objContent.totalParts;i++){
						arrPets.push(fsKey+"_part_"+i);
					}
					var fncLoadPart=function(part){
						self.load(part);
					};
					var fncProcessed=function(partId,part){
						arrContents[part.partNumber]=part.content;
					};
					self.parallelizeCalls(arrPets,fncLoadPart,fncProcessed,5);
				});
				self.addStep("Creating and parsing JSON of "+objContent.totalParts,function(){
					var sJSON=arrContents.saToString();
					var objJson=JSON.parse(sJSON);
					var objProcessed=self.processFileObj(objJson);
					self.continueTask([objProcessed]);
				});
				self.addStep("Setting values to Returning Result of "+objContent.totalParts,function(objProcessed){
					self.continueTask([objProcessed]);
				});
				return undefined;
			} else {
				return objContent;
			}
		} else {
			logError("Other type");
			debugger;
		}
		logError("ERROR... the processFile must never reach this line....");
//		return objResult;
	}
	exists(key){
		var self=this;
		var fileName=(self.basePath+"/"+key);
		filesystem.ReadFile(fileName,
							function(){self.continueTask([true]);},
							function(){self.continueTask([false]);}
							);					
	}
	load(key,fncProcess){
		var self=this;
		var fileName=(self.basePath+"/"+key);
		var innerOnLoad=self.createManagedCallback(function(sContent){
			log("Key:"+key+" loaded."+sContent.length+" bytes");
			var objContent=JSON.parse(sContent);
			
			self.addStep("Processing content",function(){
				var objProcessed=self.processFileObj(objContent,key);
				self.continueTask([objProcessed]);
			});
			self.addStep("Returning result",function(objProcessed){
				if (isDefined(self.onLoad)){
					self.addStep("Default Defined process result",function(objProcessed){
						self.onLoad(key,objProcessed);
						self.continueTask([objProcessed]);
					});
				} else if (isDefined(fncProcess)){
					self.addStep("User Defined process result",function(objProcessed){
						fncProcess(objProcessed,key,fileName);
						self.continueTask([objProcessed]);
					});
				}
				self.continueTask([objProcessed]);
			});
			self.continueTask();
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