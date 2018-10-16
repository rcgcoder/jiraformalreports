var RCGDynamicObjectStorageUtils=class RCGDynamicObjectStorageUtils{
	constructor(theFactory){
		var self=this;
		self.factory=factory;
		self.storer=new RCGObjectStorageManager(self.factory.name,System.webapp.getTaskManager());
		self.activeObjects=newHashMap();
		self.inactiveObjects=newHashMap();
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
		var self=this;
		var storer=self.storer;
		var objId=dynObj.getId();
		storer.addStep("Loading from storage "+self.factory.name +"/"+objId,function(){
			log("Loading from storage:"+objId);
			storer.load(objId);
		});
		storer.addStep("Item Loaded"+self.factory.name +"/"+objId,function(storedObj){
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
		});
		//storer.continueTask(); // not continues because the steps process at the end of the secuence
	}
}
