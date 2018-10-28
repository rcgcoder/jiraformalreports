var RCGDynamicObjectStorage=class RCGDynamicObjectStorage{
	constructor(theFactory){
		var self=this;
		self.isSavingInactives=false;
		self.savingSemaphore=new RCGSemaphore(function(){return (!self.isSavingInactives);});
		self.concurrentSaveActionsMax=50;
		self.cacheItemsMax=0;
		self.peakMax=0.10;
		self.factory=theFactory;
		self.storer=new RCGObjectStorageManager(self.factory.name,System.webapp.getTaskManager());
		self.activeObjects=newHashMap();
		self.inactiveObjects=newHashMap();
		self.inactiveUnchangedObjects=newHashMap();
		self.withAutoSave=false;
//		self.lastAutoSavePeriod=1000;
		self.autoSaveSemaphore=new RCGSemaphore(function(){return (self.needsAutoSave());});
	}
	enableAutoSave(){
		var self=this;
/*		var storer=self.storer;
		if (self.withAutoSave) {
			return storer.continueTask();
		}
*/		self.withAutoSave=true;
	}
	disableAutoSave(){
		this.withAutoSave=false;
	}
	needsAutoSave(){
		var self=this;
		return ((!self.isSavingInactives)&&(self.isFlushInactivesNeeded()));
	}
	countActiveObjects(){
		return this.activeObjects.length();
	}
	countInactiveObjects(){
		return this.inactiveObjects.length()+this.inactiveUnchangedObjects.length();
	}
	countInactiveUnchangedObjects(){
		return this.inactiveUnchangedObjects.length();
	}
	reserve(dynObj){
		var self=this;
		var key=dynObj.getId();
		if (self.inactiveObjects.exists(key)){
			self.inactiveObjects.remove(key);
		}
		if (self.inactiveUnchangedObjects.exists(key)){
			self.inactiveUnchangedObjects.remove(key);
		}
		if (!self.activeObjects.exists(key)){
			self.activeObjects.add(key,dynObj);
		}
	}
	release(dynObj){
		var self=this;
		var storer=self.storer;
		var key=dynObj.getId();
		if (self.activeObjects.exists(key)){
			self.activeObjects.remove(key);
		}
		if (dynObj.isChanged()){
			if (!self.inactiveObjects.exists(key)){
				self.inactiveObjects.add(key,dynObj);
			}
		} else {
			if (!self.inactiveUnchangedObjects.exists(key)){
				self.inactiveUnchangedObjects.add(key,dynObj);
			}
		}
		if (self.needsAutoSave()){
			log("key:"+key+" launch autosaving");
			self.isSavingInactives=true;
			storer.addStep("Dynamic "+self.factory.name+" AutoSave", function(){
				storer.addStep("Autosaving",function(){
					//debugger;
					if (self.isFlushInactivesNeeded()){
						console.log("Saving "+self.countInactiveObjects()
										+" of "+self.countActiveObjects()
										+ "/"+self.factory.list.length()
										+ ". "+getMemStatus());							  
						storer.addStep("Saving....",function(){
							self.saveAllUnlocked();
						});
					} else {
						console.log("Saving....Some objects are changed and now is not necesary to save all");
					}
					storer.addStep("Saved....",function(){
						console.log("Saved... freeing the semaphore.. actual situation "+self.countInactiveObjects()
								+" of "+self.countActiveObjects()
								+ "/"+self.factory.list.length()
								+ ". "+getMemStatus());							  
						self.isSavingInactives=false;
						storer.continueTask();
					});
					storer.continueTask();
				});
				storer.continueTask();
	        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
		}
	}
	getStorageObject(dynObj){
		var self=this; //self is an individual object
		var objResult={};
		objResult.key=dynObj.id;
		objResult.name=dynObj.name;
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
		if ((!dynObj.isLocked())&&dynObj.isChanged()&&dynObj.isFullyLoaded()){
//			log("Preparing to save:"+dynObj.getId());
			storer.addStep("Saving to storage "+self.factory.name +"/"+dynObj.getId(),function(){
//				log("Saving to storage:"+dynObj.getId());
				dynObj.clearChanges();
				storer.save(dynObj.getId(),self.getStorageObject(dynObj));
			});
			storer.addStep("Item Saved "+self.factory.name +"/"+dynObj.getId(),function(key){
//				log("Item Saved:"+dynObj.getId()+" vs "+key);
				if (isUndefined(key)){
					debugger;
				}
				storer.continueTask();
			});
		} else {
			/*log("The object "+dynObj.getId() 
					+" not is locked:"+(!dynObj.isLocked())
					+" and is changed:"+dynObj.isChanged()
					+" and is Fully Loaded:"+dynObj.isFullyLoaded());
			*/
		}
		//storer.continueTask(); // not continues because the steps process at the end of the secuence
	}
	waitFinishSave(){
		var self=this;
		var storer=self.storer;
		self.savingSemaphore.taskArrived(storer.getRunningTask());
	}
	saveAllUnlocked(){
		var self=this;
		var storer=self.storer;
		var countInactives=self.countInactiveObjects();
		var countActives=self.countActiveObjects();
		var countSaved=0;
		var countNotNeedSave=0;
		var countRemoved=0;
		var countUnloaded=0;
		storer.addStep("Saving All in a Global pseudothread",function(){
			storer.addStep("Save Inactive objects is Started",function(){
				console.log("Save all inactive objects Started ("
								+"Initial:"+countInactives +"+"+countActives
								+",Total Issues:"+self.factory.list.length()
								+")"+getMemStatus()
								+ " Prev Task:"+storer.getRunningTask().forkId);
				storer.continueTask();
			});
			storer.addStep("Remove all inactive Objects ("+countInactives+")",function(){
				console.log("Save and removing inactive objects ("
						+"Initial:"+countInactives +"+"+countActives
						+",Total Issues:"+self.factory.list.length()
						+")"+getMemStatus()
						+ " Prev Task:"+storer.getRunningTask().forkId);
				var fncSaveCall=function(inactiveObject){
					//log("Saving All to Storage:"+inactiveObject.getId());
					if (inactiveObject.isChanged()){
						countSaved++;
					} else {
						countNotNeedSave++;
					}
					self.saveToStorage(inactiveObject);
					storer.continueTask();
				}
				var fncUnloadAndRemove=function(inactiveObject){
					//log("Unload and Remove from inactive objects:"+inactiveObject.getId());
					if (!inactiveObject.isLocked()){
						if (inactiveObject.isFullyLoaded()){
							//log("Unloading :"+inactiveObject.getId());
							inactiveObject.fullUnload();
							countUnloaded++;
						}
						//log("Removing :"+inactiveObject.getId());
						if (self.inactiveObjects.exists(inactiveObject.getId())){
							self.inactiveObjects.remove(inactiveObject.getId());
							countRemoved++;
						}
					} else {
						//log("It´s not in inactive objects:"+inactiveObject.getId());
					}
	//				storer.continueTask();
				}
				storer.parallelizeCalls(self.inactiveObjects,fncSaveCall,fncUnloadAndRemove,self.concurrentSaveActionsMax);
			});
			storer.addStep("Save Inactive objects is Finished",function(){
				console.log("Saved all inactive objects ("
								+"Initial:"+countInactives
								+",Saved:"+countSaved
								+",Not Saved:"+countNotNeedSave
								+",Removed:"+countRemoved
								+",Unloaded:"+countUnloaded
								+",Total Issues:"+self.factory.list.length()
								+")"+getMemStatus()
								+ " Prev Task:"+storer.getRunningTask().forkId);
				storer.continueTask();
			});
			storer.continueTask();
        });
		storer.continueTask();
	}
	isFlushInactivesNeeded(){
		var self=this;
		var nTotalItems=self.countInactiveObjects()
						+self.countActiveObjects();
		var nTotalPeak=(self.cacheItemsMax*self.peakMax);
		if ((self.cacheItemsMax<nTotalItems)&&(self.countInactiveObjects()>nTotalPeak)){
			var i=0;
			if (self.countInactiveUnchangedObjects()>0){
				self.countInactiveUnchangedObjects.clear();
			}
			var nTotalItemsAnt=nTotalItems;
			nTotalItems=self.countInactiveObjects()+self.countActiveObjects();
			var bNeedsSave=((self.cacheItemsMax<nTotalItems)&&(self.countInactiveObjects()>nTotalPeak));
			log("removed "+ (nTotalItemsAnt-nTotalItems)+" now needs to save:"+bNeedsSave);
			return bNeedsSave;
		}
		return false;
	}
	loadFromStorage(dynObj){
		dynObj.lock(); // lock the object to avoid unload before the step executions   
		var self=this;
		var storer=self.storer;
		var objId=dynObj.getId();
/*		if (self.isFlushInactivesNeeded()){
			storer.addStep("Save all unlocked objects",function(){
				self.saveAllUnlocked();
			});
		}
*/		if (dynObj.isFullyLoaded()){
			storer.addStep("Is already loaded. Returning the object "+self.factory.name +"/"+objId,function(){
				storer.continueTask([dynObj]);
			});
		} else {
			storer.addStep("Loading from storage "+self.factory.name +"/"+objId,function(){
				//log("Loading from storage:"+objId);
				if (dynObj.isFullyLoaded()){ // prevent a previous load of the object....  
					storer.continueTask();
				} else {
					storer.load(objId);
				}
			});
			storer.addStep("Item Loaded"+self.factory.name +"/"+objId,function(storedObj){
				if (!dynObj.isFullyLoaded()){ // prevent a previous load of the object....
					var theFactory=self.factory;
					//log("Loaded from storage:"+theFactory.name +"/"+objId);
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
