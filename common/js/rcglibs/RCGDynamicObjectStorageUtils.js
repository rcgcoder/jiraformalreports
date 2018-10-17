var RCGDynamicObjectStorage=class RCGDynamicObjectStorage{
	constructor(theFactory){
		var self=this;
		self.factory=theFactory;
		self.storer=new RCGObjectStorageManager(self.factory.name,System.webapp.getTaskManager());
		self.activeObjects=newHashMap();
		self.inactiveObjects=newHashMap();
	}
	reserve(dynObj){
		var self=this;
		var key=dynObj.getId();
		if (self.inactiveObjects.exists(key)){
			self.inactiveObjects.remove(key);
		}
		if (!self.activeObjects.exists(key)){
			self.activeObjects.add(dynObj,key);
		}
	}
	release(dynObj){
		var self=this;
		var key=dynObj.getId();
		if (self.activeObjects.exists(key)){
			self.activeObjects.remove(key);
		}
		if (!self.inactiveObjects.exists(key)){
			self.inactiveObjects.add(dynObj,key);
		}
	}
	getStorageObject(dynObj){
		var self=this; //self is an individual object
		var objResult={};
		objResult.key=self.id;
		objResult.name=self.name;
		self.factory.attrTypes.walk(function(value,deep,key){
			var attrName=key;
			var attrType=value.type;
			if (attrType=="Value"){
				objResult[attrName]=self.storer.getStorageObject(dynObj["get"+attrName]());
			} else if(attrType=="List") {
				objResult[attrName]=self.storer.getStorageObject(dynObj["get"+attrName+"s"]());
			}
		});
		return objResult;
	}
	saveToStorage(dynObj){
		var self=this;
		var storer=self.storer;
		storer.addStep("Saving to storage "+self.factory.name +"/"+dynObj.getId(),function(){
			log("Saving to storage:"+dynObj.getId());
			storer.save(dynObj.getId(),self.getStorageObject(dynObj));
		});
		storer.addStep("Item Saved "+self.factory.name +"/"+dynObj.getId(),function(key){
			log("Item Saved:"+key);
			storer.continueTask();
		});
		//storer.continueTask(); // not continues because the steps process at the end of the secuence
	}
	loadFromStorage(dynObj){
		dynObj.lock(); // lock the object to avoid unload before the step executions   
		var self=this;
		var storer=self.storer;
		var objId=dynObj.getId();
		if (dynObj.isFullyLoaded()){
			storer.addStep("Is already loaded. Returning the object "+self.factory.name +"/"+objId,function(){
				storer.continueTask([dynObj]);
			});
		} else {
			storer.addStep("Loading from storage "+self.factory.name +"/"+objId,function(){
				log("Loading from storage:"+objId);
				if (dynObj.isFullyLoaded()){ // prevent a previous load of the object....  
					storer.continueTask();
				} else {
					storer.load(objId);
				}
			});
			storer.addStep("Item Loaded"+self.factory.name +"/"+objId,function(storedObj){
				if (!dynObj.isFullyLoaded()){ // prevent a previous load of the object....
					var theFactory=self.factory;
					log("Loaded from storage:"+theFactory.name +"/"+objId);
					var auxValue;
					theFactory.attrTypes.walk(function(value,deep,key){
						var attrName=key;
						var attrType=value.type;
						if (isDefined(storedObj[attrName])){
							auxValue=storer.processFileObj(storedObj[attrName]);
						} else {
							auxValue="";
						}
						if (attrType=="Value"){
							dynObj["set"+attrName](auxValue);
						} else if(attrType=="List") {
							dynObj["set"+attrName+"s"](auxValue);
						}
					});
					dynObj.setFullyLoaded();
					dynObj.clearChanges();
				}
				storer.continueTask([dynObj]);
			});
		}
		//storer.continueTask(); // not continues because the steps process at the end of the secuence
	}
}
