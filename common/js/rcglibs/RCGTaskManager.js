class RCGBarrier{
	constructor(callback,nItems){
		var self=this;
		self.callback=callback;
		self.nItems=0;
		self.id=self.newId();
		self.fixedItems=false;
		if (typeof nItems!=="undefined"){
			self.nItems==nItems;
			self.fixedItems=true;
		}
		self.tasksBarried=[]; // to debug barrier activity
		self.tasksReached=[]; // to debug barrier activity
		self.isReached=false;
	}
	newId(){
		var newId="bid-"+(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	reach(task){
		var self=this;
		log("Barrier "+self.id+" reached task:["+task.forkId+" - "+task.description+"] - "+self.nItems +" --> "+ (self.nItems-1) );
		self.tasksReached.push(task); // to debug activity
		task.running=false;
		task.done(false);
		if (self.nItems<=0) {
			log("Barrier "+self.id+" You reached to barrier but no items asigned to. It´s a bug in your program... no callback is launched");
			return;
		}
		self.nItems--;
		if (self.nItems<=0){
			log("Barrier "+self.id+" Barrier reached!");
			self.isReached=true;
			//debugger;
			self.tasksBarried=[]; // remove the arrays for free memory
			self.tasksReached=[]; // remove the arrays for free memory
			var theCallback=self.callback;
			self.callback="";// to free memory at the end
			setTimeout(theCallback); 
		} 
	}
	add(task){
		var self=this;
		log("Barrier "+self.id+" added task:["+task.forkId+" - "+task.description+"] - "+self.nItems);
		self.tasksBarried.push(task); // to debug barrier activity
		if (self.fixedItem) return;
		self.nItems++;
	}
}
class RCGTask{
	constructor(taskManager,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		self.description="";
		self.method="";
		self.isCallBack=false;
		self.isFork=false;
		self.isGlobalFork=false;
		self.parent="";
		self.forkId="";
		self.actStep=-1;
		self.progressMin=0;
		self.progressMax=1;
		self.progress=0;
		self.weight=-1;
		self.methodWeight=-1;
		self.steps=[]; // list of tasks to execute in sequence (callbacks are setted at position 0, next are pushed)
		self.innerForks=[]; // list of pseudothreaded forks running in task. The task not finish before the last fork finish
		self.object="";
		self.running=false;
		self.isDone=false;
		self.barrier=""; 
		self.taskManager=taskManager;
		taskManager.countNews++;
		self.wasFreed=false;

		self.initTime="";
		self.finishTime="";
		self.onChangeStatus="";
		if (typeof description!=="undefined"){
			self.description=description;
		}
		if ((typeof progressMin!=="undefined")&&(typeof progressMax!=="undefined")){
			self.progressMin=progressMin;
			self.progressMax=progressMax;
			self.progress=progressMin;
		}
		if (typeof totalWeight!=="undefined"){
			self.weight=totalWeight;
		}
		if (typeof methodWeight!=="undefined"){
			self.methodWeight=methodWeight;
		}
	}
	killTasks(){
		var self=this;
//		log("Free Memory of task:"+self.description);
		self.steps.forEach(function(element){
			element.killTasks();
		});
		self.innerForks.forEach(function(task){
			task.killTasks();
		});
		self.steps=[];
		self.innerForks=[];
		self.actStep=0;
		self.running=false;
		self.isDone=true;
		self.freeMemory();
	}
	canFreeMemory(){
		var self=this;
//		log("Free Memory of task:"+self.description);
		if (self.wasFreed) return false;
		if (self.barrier!=""){
			if (!self.barrier.isReached) return false;
		}
		if (self.isSomethingRunning()) return false;
		if (!self.isTotalDone()) return false;
		self.steps.forEach(function(element){
			if (!element.canFreeMemory()) return false;
		});
		self.innerForks.forEach(function(element){
			if (!element.canFreeMemory()) return false;
		});
		return true;
	}
	freeMemory(){
		var self=this;
//		log("Free Memory of task:"+self.description);
		if (!self.canFreeMemory()) return;
		self.wasFreed=true;
		self.taskManager.countFrees++;
		self.steps.forEach(function(element){
			element.freeMemory();
		});
		self.steps=[];
		self.actStep=-1;
		self.innerForks.forEach(function(element){
			element.freeMemory();
		});
		self.innerForks=[];
/*			if (self.parent!=""){
				self.parent.freeMemory();
			}*/
		if (self.barrier!=""){
			self.barrier="";
		}
		self.method="";
		self.parent="";
	}
	setOnChangeStatus(callback){
		var self=this;
		self.onChangeStatus=callback;
	}
	changeStatus(){
		var self=this;
		var itmAux=self;
		while (itmAux!=""){
			if (itmAux.onChangeStatus!=""){
				itmAux.onChangeStatus();
			}
			itmAux=itmAux.parent;
		}
		self.getTaskManager().changeStatus();
	}
	done(bFreeMemory){
		var self=this;
		self.isDone=true;
		self.finishTime=(new Date()).getTime();
		self.changeStatus();
		self.method="";
		var theParent=self.parent;
		//debugger;
		if ((typeof bFreeMemory==="undefined")||bFreeMemory){
			self.freeMemory();
		}
		return theParent;
	}
	

	getTaskManager(){
		var self=this; 
		return self.taskManager;
	}
	getRunningForkId(){
		var self=this;
		return self.getTaskManager().getRunningForkId(); 
	}
	getRunningTask(){
		var self=this;
		var task=self.getTaskManager().getRunningTask(); 
/*		if (task=="") return "";
		if ((task.isTotalDone())&&(!task.isSomethingRunning())){
			return "";
		}*/
		return task;
	}
	setRunningTask(theTask){
		var self=this;
		self.getTaskManager().setRunningTask(theTask);
	}
	callMethod(aArgs){
		var self=this;
		self.running=true;
		var obj=self.object;
		var theMethod=self.method;
		if (typeof theMethod==="undefined"){
			log("¿undefined?.... this will be a Big Crash!!!");
		}
		var context=obj;
		if (obj==""){
			context=undefined;
		}
		if ((typeof theMethod==="string")&&(theMethod!="")){
			theMethod=context[theMethod];
		}
		var newArgs=aArgs;
		if ((!Array.isArray(aArgs))&&(typeof aArgs!=="undefined")){
			newArgs=[aArgs];
		}
		var theTask=self;
		var theTaskManager=self.getTaskManager();
		var bIsAsync=false;
		var tCallCalled=Date.now();
		var fncApply=function(){
			self.initTime=Date.now();
			theTaskManager.setRunningTask(theTask);
			theTaskManager.asyncTimeWasted+=(self.initTime-tCallCalled);
/*			if (theTask.description!=""){
				log("Calling method of task: "+theTask.description);
			}
*/			if ((typeof theMethod==="undefined")||(theMethod=="")){
				debugger;
			}
			
			theMethod.apply(context,newArgs);
		}

		var fncAsyncApply=function(){
			theTaskManager.lastTimeout=Date.now();
			//var actWindow=theTaskManager.getActiveWindow();
			if (theTaskManager.asyncTaskCallsDelay>0){
				setTimeout(fncApply,theTaskManager.asyncTaskCallsDelay);
			} else {
				bIsAsync=true;
				//actWindow.setTimeout(fncApply);
				requestAnimationFrame(fncApply);
			}
		}
		self.changeStatus();
		if (theTaskManager.asyncTaskCalls) {
			var contRunningTime=Date.now()-theTaskManager.lastTimeout;
			if (
					(theTaskManager.asyncTaskCallsBlock==0)
					//||(theTaskManager.lastTimeout==0)
					||
					(theTaskManager.asyncTaskCallsMaxDeep<theTaskManager.asyncTaskCallActDeep)
					||(contRunningTime>theTaskManager.asyncTaskCallsBlock)
				){
				theTaskManager.timeoutsCalled++;
				theTaskManager.asyncTaskCallActDeep=0;
/*				log("Continuous running time:"+contRunningTime
						+" running ASYNC: " + theTaskManager.asyncTaskCallActDeep + "/" +theTaskManager.asyncTaskCallsMaxDeep
						+" setTimeout relation: "+theTaskManager.timeoutsCalled+"/"+theTaskManager.timeoutsAvoided);
*/				tCallCalled=Date.now();
				fncAsyncApply();
			} else {
				theTaskManager.timeoutsAvoided++;
				theTaskManager.asyncTaskCallActDeep++;
/*				log("Continuous running time:"+contRunningTime
						+" running SYNC: " + theTaskManager.asyncTaskCallActDeep + "/" +theTaskManager.asyncTaskCallsMaxDeep
						+" setTimeout relation:"+theTaskManager.timeoutsCalled+"/"+theTaskManager.timeoutsAvoided);
*/				tCallCalled=Date.now();
				fncApply();
			}
		} else {
			tCallCalled=Date.now();
			fncApply();
		}
	}
	isSomethingRunning(){
		var self=this;
		var totalDone=self.isTotalDone();
		if (totalDone){
			return false;
		}
		if (self.running) return true;
		if ((self.innerForks.length==0) && (self.steps.length==0)) return false;
		for (var i=0;i<self.innerForks.length;i++){
			if (self.innerForks[i].isSomethingRunning()){
				return true;
			}
		}
		for (var i=0;i<self.steps.length;i++){
			if (self.steps[i].isSomethingRunning()){
				return true;
			}
		}
		return false;
	}
	isTotalDone(){
		var self=this;
		if (!self.isDone) return false;
		if (self.running) return false;
		if ((self.innerForks.length==0) && (self.steps.length==0)) return true;
		for (var i=0;i<self.innerForks.length;i++){
			if (!self.innerForks[i].isTotalDone()){
				return false;
			}
		}
		for (var i=0;i<self.steps.length;i++){
			if (!self.steps[i].isTotalDone()){
				return false;
			}
		}
		return true;
	}
	getStatus(){
		var self=this;
		if ((!self.isSomethingRunning())){
			return {
					desc:self.description,
					min:self.progressMin,
					max:self.progressMax,
					perc:1,
					adv:self.progressMax,
					weight:self.weight,
					done:self.isDone,
					timeSpent:self.finishTime-self.initTime,
					running:self.running,
					isCallback:self.isCallback,
					nSubTasks:0,
					nSubTasksRunning:0,
					nSubDeep:0,
					detail:[]  // there is not detail..... 
					};
		}
		var progressPercent=0;
//		if (self.steps.length==0){
		// call status
		var bRunningMethod=false;
		
		// checking if all inner forks are finished
		var allInnerForksDone=true;
		for (var i=0;(allInnerForksDone)&&(i<self.innerForks.length);i++){
			var auxFork=self.innerForks[i];
			if (auxFork.running){
				allInnerForksDone=false;
			}
		}
		
		
		var progressMax=self.progressMax;
		var progressMin=self.progressMin;
		var progressItems=progressMax-progressMin;
		var progressAdv=progressPercent*progressItems;
		var progressPercent=0;
		if ((self.actStep>=0)&&(allInnerForksDone)){ // the method was executed
			progressPercent=1;
		} else if (self.method!=""){
			bRunningMethod=true;
			if (progressItems>0){
				progressPercent=self.progress/progressItems;
			}
		}
		var progressAdv=(progressPercent*progressItems)+progressMin;
		
		var status={
				desc:self.description,
				min:Math.round(progressMin),
				max:Math.round(progressMax),
				perc:progressPercent,
				adv:Math.round(progressAdv),
				weight:self.methodWeight,
				done:false,
				nSubTasks:0,
				nSubTasksRunning:0,
				nSubDeep:0,
				timeSpent:(bRunningMethod?(new Date()).getTime()-self.initTime:""),
				running:bRunningMethod,
				isCallback:self.isCallback
				,detail:[]  // there is not more detail???..... 
				};
		if ((self.steps.length==0)&&(allInnerForksDone)){
			status.weight=self.weight;
			status.nSubTasks=self.innerForks.length+self.steps.length;
			status.detail=[];  // No, there is not more detail..... 
			return status;
		}
		var arrStatus=[];
		arrStatus.push(status);
		var nSubTasks=0;
		var nSubTasksRunning=0;
		var auxStatus;
		var nSubDeep=0;
		var auxDeep=0;
		for (var i=0;i<self.steps.length;i++){
			var auxStep=self.steps[i];
			if (!auxStep.isFork){ // the forks will be processed in next for
				auxStatus=auxStep.getStatus();
				nSubTasks+=auxStatus.nSubTasks;
				auxDeep=(auxStatus.nSubDeep+1);
				if (auxDeep>nSubDeep){
					nSubDeep=auxDeep;
				}
				nSubTasks++;
				if (auxStatus.running){
					nSubTasksRunning++;
				}
				arrStatus.push(auxStatus);
			}
		}
		for (var i=0;i<self.innerForks.length;i++){
			var auxStep=self.innerForks[i];
			auxStatus=auxStep.getStatus();
			nSubTasks+=auxStatus.nSubTasks;
			nSubTasks++;
			if (auxStatus.running){
				nSubTasksRunning++;
			}
			auxDeep=(auxStatus.nSubDeep+1);
			if (auxDeep>nSubDeep){
				nSubDeep=auxDeep;
			}
			arrStatus.push(auxStatus);
		}
		//arrStatus has the estatus of all the steps and Forks in the list.
		var totalWeight=0;
		var medWeight=0;
		var totalWeightSetted=0;
		var itemsWithoutWeight=0;
		var itemsWithWeight=0;
		var arrRunningTasks=[];
		// getting the totalweight.... and the items without weight
		for (var i=0;i<arrStatus.length;i++){
			var auxStatus=arrStatus[i];
			if (auxStatus.weight>=0){
				totalWeightSetted+=auxStatus.weight;
				itemsWithWeight++;
			} else {
				itemsWithoutWeight++;
			}
			if (auxStatus.running){
				arrRunningTasks.push(auxStatus);
			}
		}
		// Calculating the medium weight to use it with the items without weight
		if (totalWeightSetted>0){
			medWeight=totalWeightSetted/itemsWithWeight;
			totalWeight=totalWeightSetted+(medWeight*itemsWithoutWeight);
		} else {
			totalWeight=1;
			medWeight=totalWeight/itemsWithoutWeight;
		}
		// identifying the processed steps.... and acumulated weight
		var acumProcessed=0;		
		for (var i=0;i<arrStatus.length;i++){
			var auxStatus=arrStatus[i];
			if (auxStatus.perc>0){
				var auxWeight=auxStatus.weight;
				if (auxWeight<0){
					auxWeight=medWeight*auxStatus.perc;
				} else {
					auxWeight=auxWeight*auxStatus.perc;
				}
				acumProcessed+=auxWeight;
			}
		}
		var totalPerc=acumProcessed/totalWeight;
		var returnStatus={
				desc:self.description,
				weight:self.weight,
				min:Math.round(progressMin),
				max:Math.round(progressMax),
				perc:totalPerc,
				adv:Math.round((progressItems*totalPerc)+progressMin),
				done:false,
				running:true,
				nSubTasks:nSubTasks,
				nSubTasksRunning:nSubTasksRunning,
				nSubDeep:nSubDeep,
				timeSpent:(new Date()).getTime()-self.initTime,
				child:arrRunningTasks,
				detail:arrStatus  // there is detail..... useful info!
				};
		return returnStatus;
	}

}
class RCGTaskManager{
	constructor(description){
		var self=this;
		self.description="";
		if (typeof description!=="undefined"){
			self.description=description;
		}
//		self.windows=[window];
		self.globalForks=[]; // list of pseudothreaded global tasks
		self.innerForks=[];   // list of pseudothreaded inner forks (forks in a subtask)
		self.runningTask="";
		self.onChangeStatus="";
		//self.extendObject(obj);
		self.asyncTaskCalls=true;
		self.asyncTaskCallsDelay=0;
		self.asyncTaskCallsBlock=0;  // do not use.... it breaks always
		self.asyncTaskCallsMaxDeep=0;  // do not use.... it breaks always
		self.asyncTaskCallActDeep=0;
		self.timeoutsCalled=0;
		self.timeoutsAvoided=0;
		self.lastTimeout=0;
		self.asyncTimeWasted=0;
		self.updateStatusDelay=1000;
		self.changeStatusNeedsNotify=false;
		self.changeStatusUpdateScheduled=false;
		self.autoFree=false;
		self.countFrees=0;
		self.countNews=0;
	}
/*	getActiveWindow(){
		var self=this;
		var i=0;
		var iWindows=self.windows.length;
		while (i<self.windows.length){
			var auxWindow=self.windows[i];
			if (auxWindow.closed){
				self.windows.splice(i, 1);
			} else {
				i++;
			}
		}
		if (iWindows!=self.windows.length){
			log("Windows in array before:"+iWindows);
			log("Windows in array after:"+self.windows.length);
		}
		self.windows.forEach(function(auxWindow,index){
			var winFocus=auxWindow.document.hasFocus();
			if (winFocus) {
				log("Window active:"+index);
				return auxWindow;
			}
		});
		return self.windows[0];
	}
*/	setChangeStatusNotifyDelay(millis){
		var self=this;
	}
	setOnChangeStatus(callback){
		var self=this;
		self.onChangeStatus=callback;
	}
	changeStatus(){
		var self=this;
		if (self.onChangeStatus!=""){
			if (self.updateStatusDelay<=0){
				return self.onChangeStatus();
			} 
			if (typeof self.changeStatusNeedsNotify==="undefined"){
				self.changeStatusNeedsNotify=true;
				self.changeStatusUpdateScheduled=false;
			} else {
				self.changeStatusNeedsNotify=true;
			}
			if (!self.changeStatusUpdateScheduled){
				var fncUpdateProgress=function(){
//					log("UPDATE STATE PROGRESS: Update Progress");
					if (!self.changeStatusNeedsNotify){
//						log("UPDATE STATE PROGRESS: not Update");
						self.changeStatusUpdateScheduled=false;
						return;
					}
//					log("UPDATE STATE PROGRESS: updating");
					self.changeStatusUpdateScheduled=true;
					self.changeStatusNeedsNotify=false;
					self.onChangeStatus();
//					log("UPDATE STATE PROGRESS: schedule next update");
					setTimeout(function(){
						self.changeStatusUpdateScheduled=true;
//						log("UPDATE STATE PROGRESS: it will run next second");
						setTimeout(fncUpdateProgress,self.updateStatusDelay);
					});
				}
				fncUpdateProgress();
			}
		}
	}
	
	
	getRunningForkId(){
		var self=this;
		var rTask=self.getRunningTask();
		if (rTask=="") return "";
		return rTask.forkId; 
	}
	getRunningTask(){
		var self=this;
		var task=self.runningTask; 
/*		if (task=="") return "";
		if ((task.isTotalDone())&&(!task.isSomethingRunning())){
			return "";
		}
*/		return task;
	}
	setRunningTask(theTask){
		var self=this;
		self.runningTask=theTask;
	}
	newForkId(){
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	newTask(method,obj,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		var bFirstTask=(self.globalForks.length==0);
		var lastForkId=self.getRunningForkId();
		var lastTask=self.getRunningTask();
		if (lastForkId==""){
			lastForkId=self.newForkId();
			log("There is not pseudoThread running... the TaskManager is Empty. creating pseudo thread with id:"+lastForkId);
			lastTask="";
		}
		var theObj=obj;
		if (typeof theObj==="undefined"){
			if (bFirstTask){
				theObj=""; // no object call... will be a global function.
			} else {
				theObj=lastTask.object;
			}
		}
		var task=new RCGTask(self,description,progressMin,progressMax,totalWeight,methodWeight);
		task.object=theObj;
		task.forkId=lastForkId;
		task.method=method;
		if (!bFirstTask){
			task.parent=lastTask;
		}
		return task;
	}
	addGlobalFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		var runningTask=self.getRunningTask();
		var fork=self.newTask(method,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		fork.parent="";
		fork.forkId=self.newForkId();
		fork.isFork=true;
		fork.isGlobalFork=true;
		var iTotalWeight=0;
		var iMethodWeight=0;
		if (typeof totalWeight!=="undefined"){
			iTotalWeight=totalWeight;
		}
		if (typeof methodWeight!=="undefined"){
			iMethodWeight=methodWeight;
		}
		fork.weight=iTotalWeight;
		fork.methodWeight=iMethodWeight;
		if (typeof barrier!=="undefined"){
			fork.barrier=barrier;
			log("Global Fork added to Barrier:"+barrier.id);
			fork.barrier.add(fork);
		}
		self.globalForks.push(fork);
/*		runningTask.steps.push(fork);
		if (typeof barrier!=="undefined"){
			fork.pushCallback(function(){
				barrier.reach(self.getRunningTask());
				fork.popCallback();
			});
		}*/
		return fork;
	}
	addInnerFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight,isGlobalFork){
		var self=this;
		var runningTask=self.getRunningTask();
		var fork=self.newTask(method,obj,description,progressMin,progressMax,totalWeight,methodWeight);

		fork.forkId=self.newForkId();
		fork.isFork=true;
		if ((typeof isGlobalFork!=="undefined")&&(isGlobalFork==true)){
			fork.isGlobalFork=true;
		}

		var iTotalWeight=-1;
		var iMethodWeight=-1;
		if (typeof totalWeight!=="undefined"){
			iTotalWeight=totalWeight;
		}
		if (typeof methodWeight!=="undefined"){
			iMethodWeight=methodWeight;
		}
		fork.weight=iTotalWeight;
		fork.methodWeight=iMethodWeight;
		runningTask.innerForks.push(fork);
		runningTask.steps.push(fork);
		if (typeof barrier!=="undefined"){
			fork.barrier=barrier;
			fork.barrier.add(fork);
		}
		if (!fork.isGlobalFork){ // the Global Forks does not use inner barrier
			self.innerForks.push(fork);
			var innerBarrier;
			if (runningTask.barrier==""){
				var fncBarrierOpen=function(){
					//debugger;
					self.setRunningTask(runningTask);
					runningTask.running=false;
//					var auxParent=runningTask.parent;
					runningTask.done(false);
//					runningTask.parent=auxParent;
					self.next();
				}
				innerBarrier=new RCGBarrier(fncBarrierOpen);
				innerBarrier.add(runningTask); // to reach the barrier at the end of the last step of the task
				runningTask.barrier=innerBarrier;
			} else {
				innerBarrier=runningTask.barrier;
			}
			innerBarrier.add(fork);
		}
		return fork;
	}
	
	searchForFork(forkId){
		var self=this;
		for (var i=0;i<self.globalForks.length;i++){
			if (self.globalForks[i].forkId==forkId){
				return self.globalForks[i];
			}
		}
		for (var i=0;i<self.innerForks.length;i++){
			if (self.innerForks[i].forkId==forkId){
				return self.innerForks[i];
			}
		}
		return "";
	}
	addStep(method,obj,sForkType,barrier,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		var task;
		if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="GLOBAL_RUN")){
			var frkGlobalRun=self.addGlobalFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight);
			frkGlobalRun.callMethod();
			return frkGlobalRun;
		} else if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="INNER")){
			return self.addInnerFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		} else if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="GLOBAL")){
			return self.addInnerFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight,true);
		} else {
			task=self.newTask(method,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		}
		if (self.globalForks.length==0){
			self.globalForks.push(task);
		} else {
			var runningTask=self.getRunningTask();
			runningTask.steps.push(task);
		} 
		return task;
	}
	
	parallelizeCalls(hsListItemsToProcess,fncCall,fncProcess,maxParallelThreads){
		var self=this;
		var maxThreads=25;
		if (isDefined(maxParallelThreads)) maxThreads=maxParallelThreads; 
		var hsListItems=newHashMap();
		hsListItemsToProcess.walk(function(item){
			hsListItems.push(item);
		});
		self.addStep("Doing " + hsListItems.length()+" parallels calls grouped by "+maxThreads, function(){
			var nextAccumulator=0;
			var fncAddThread=function(iThread){
				self.addStep("Parallel call Thread "+iThread,function(){
					var fncParallelCall=self.createManagedCallback(function(){
						if (hsListItems.length()==0)return;
						var iPet=hsListItems.length()-1;
						var item=hsListItems.pop();
						/*var callInfo=hsIssueGetProperties.pop();//push({issue:issue,key:propertyKey});
						var issue=callInfo.issue;
						var propKey=callInfo.key;
						*/
						self.addStep("Petition:"+iPet+" of parallel process ",function(){
							fncCall(item);
						});
						self.addStep("Petition:"+iPet+" Processing result and Trying Next Call...",function(objResult){
							if (isDefined(fncProcess)) fncProcess(item,objResult);
							if (hsListItems.length()>0){
								log("There are "+hsListItems.length()+" petitions pending... let´s go next petition");
								fncParallelCall();
							} else {
								log("There is not more petitions");
							}
							self.continueTask();
						});
					});
					fncParallelCall();
					self.continueTask();
				},0,1,undefined,undefined,undefined,"INNER",undefined
				);
			}
			for (var i=0;(i<maxThreads)&&(i<hsListItems.length());i++){
				fncAddThread(i);
			}
			self.continueTask();
		});
		self.continueTask();
	}
	
	
	pushCallback(method,obj,sForkType,barrier,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		if (typeof method==="undefined"){
			log("you are pushing an undefined callback... be carefull.... it´s maybe a big bug");
		}
		var task;
		if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="GLOBAL")){
			return self.addGlobalFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		} else if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="INNER")){
			return self.addInnerFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		}
		var task=self.newTask(method,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		task.isCallback=true;
		if (self.globalForks.length==0){
			self.globalForks.push(task);
		} else {
			var rTask=self.getRunningTask();
			rTask.steps.unshift(task); // set the new task in the first step
		}
		return task;
	}
	next(aArgs,iJumpOps){ // secuence
						  // 0 - method
						  // [removed] 1 - calls in the stack array LIFO
						  // 2 - calls in the step array FIFO
		var self=this;
		var stepRunning=self.getRunningTask();
		
		
		var bWithSubSteps;
		var bwithCallbacks;
		var subSteps;
		var stack;
		var iSubStep;
		var nSteps;
		var nStack;
		
		var nJumps=iJumpOps;
		if (typeof nJumps==="undefined"){
			nJumps=0;
		}
		var bLocated=false;
		while ((stepRunning!="")&&(!bLocated)){
//			self.setRunningTask(stepRunning);
			subSteps=stepRunning.steps;
			nSteps=subSteps.length;
			iSubStep=stepRunning.actStep;			
			bWithSubSteps=(nSteps>0);
			if (iSubStep>=nSteps){ // the actual task is reached the end of the steps
				if ((!stepRunning.isDone)&&
					((stepRunning.innerForks.length>0)
						||
					 (stepRunning.barrier!=""))
					){
					stepRunning.changeStatus();
					return stepRunning.barrier.reach(stepRunning);
				} else {
					stepRunning.running=false;
					stepRunning=stepRunning.done();
					//stepRunning=stepRunning.parent;
				}
				
			} else if ((iSubStep>=0)&&(iSubStep<nSteps)) { // Phase 2..steps.... 
													// it´s running a intermediate step...
				var actStep=subSteps[iSubStep];   // setting the actual step to identify the task to process in next round
				if (actStep.isDone){ // if the next step is done....
					stepRunning.actStep++; 
					if (stepRunning.actStep>=nSteps){ // if where the last step...
						var bReachBarrier=false;
						if ((stepRunning.isFork)&&(stepRunning.parent!="")){ //its inner fork
							stepRunning.parent.barrier.reach(stepRunning);
							bReachBarrier=true;
						} 
						if (stepRunning.barrier!=""){ // waiting
							stepRunning.barrier.reach(stepRunning);
							bReachBarrier=true;
						} 
						if (bReachBarrier){
							// if where a barrier the jumps are avoided
							return;
						}else {
							stepRunning.running=false;  // the step was finished... now is not running (ensure)
							stepRunning=stepRunning.done();     // the step was finished .. now is done (ensure)
							//stepRunning=stepRunning.parent; // next round have to check a brother step... method probably...
						}
					}
				} else { // if act step is not done.... 
					stepRunning=actStep; //next round wil check the next step action to do (method, substeps)
				}
			} else if (iSubStep<0){ // if there is not steps running..Phase 0... ¿the method?
				if ((!bWithSubSteps)&&(stepRunning.running)){ // if its running Method and there is not subSteps
					var bReachBarrier=false;
					if ((stepRunning.isFork)&&(stepRunning.parent!="")){ //its inner fork
						stepRunning.parent.barrier.reach(stepRunning);
						bReachBarrier=true;
					} 
					if (stepRunning.barrier!=""){ // waiting
						stepRunning.barrier.reach(stepRunning);
						bReachBarrier=true;
					} 
					if (bReachBarrier){
						// if where a barrier the jumps are avoided
						return;
					} else {
						stepRunning.running=false;  // the call was executed
						stepRunning=stepRunning.done();      // the call is done
						//stepRunning=stepRunning.parent; // goto next brother
					}
				} else if (stepRunning.running){ // if is running.... the call is finishing...
					stepRunning.actStep++;  // act step is 0 (-1 + 1)
					stepRunning=subSteps[stepRunning.actStep]; // next round will check actions for first step
				} else if (stepRunning.method!=""){ // if there is method setted....
					if (nJumps==0){ // if not jumps remaining
						bLocated=true; // ¡¡LOCATED!!
					} else { // if jumps remaining
						nJumps--; // reduce njumps
						stepRunning.running=false;  // the call was executed
						stepRunning=stepRunning.done();      // the call is done
						//stepRunning=stepRunning.parent; // goto next brother
					}
				} else if (stepRunning.parent!=""){ // if there is not method setted and is not the root callmanager
					//debugger;
					logError("Call without method....¿big error?"); // may be an error
					stepRunning=stepRunning.parent; // try again with parent
				} else {
					stepRunning=stepRunning.parent; // is root.... 
				}
			}
		}
		if (bLocated){
			var taskToRun=stepRunning;
			if (taskToRun.isFork){ // if the step is a fork.... maybe inner or global
				// remove the step..... and continue
				log ("Next running task is fork: " + taskToRun.description + "("+taskToRun.forkId+")");
				var parent=taskToRun.parent;
				var iStep=parent.actStep;
				if (parent!=""){
					if ((iStep<0)||(iStep>parent.steps.length)){
						log("Impossible situation.... the fork has to be in the step array of the parent");
					} else { // remove the fork from the parent step
						parent.steps.splice(iStep, 1);
						if (taskToRun.isGlobalFork){
							taskToRun.parent="";
							self.globalForks.push(taskToRun);
						}
						var nextTask=parent;
						if (parent.actStep<parent.steps.length){
							nextTask=parent.steps[parent.actStep];
						}
						log("Continue running "+nextTask.description+ "("+nextTask.forkId+")");
						self.setRunningTask(nextTask);
						self.next(aArgs,nJumps);
					}
				} else {  // the step is a Global Fork.....
					log("Is Global Fork..... ¿do nothing?");
					
				}
			}
			taskToRun.callMethod(aArgs);
		} else {
			log("-->  FINISHING !!... InnerForks:"+self.innerForks.length+" Global Forks:"+self.globalForks.length);
			self.changeStatus();
			var i=0;
			while (i< self.innerForks.length){
				var fork=self.innerForks[i];
				if (!fork.isSomethingRunning()){
					fork.freeMemory();
					self.innerForks.splice(i,1);
				} else {
					i++;
				}
			}
			i=0;
			while (i< self.globalForks.length){
				var gf=self.globalForks[i];
				if (!gf.isSomethingRunning()){
					gf.freeMemory();
					self.globalForks.splice(i,1);
				} else {
					i++;
				}
			}
/*			if ((self.globalForks.length==0)&&(self.innerForks.length==0)){
				self.runningTask="";
				self.setRunningTask("");
			}
*/
			if (typeof window.gc!=="undefined") {
				setTimeout(function(){
							log("Calling Garbage Collector");
							window.gc();
						},3000);
			}
			log("-->   FINISHED !! InnerForks:"+self.innerForks.length+" Global Forks:"+self.globalForks.length);
			self.asyncTimeWasted=0;
			return "";
		}
	}

	popCallback(aArgs,iJumps){
		var self=this;
		return self.next(aArgs,iJumps);
	}
	extended_getTaskManager(){
		var self=this;
		var tm=self.RCGTaskManager;
		if ((typeof tm === "undefined") || (tm=="")){
			return "";
		} 
		return tm;
	}
	extended_getTaskManagerStatus(){
		var self=this;
		var tm=self.RCGTaskManager;
		if ((typeof tm === "undefined") || (tm=="")){
			return "";
		} 
		var arrStatus=[];
		for (var i=0;i<tm.globalForks.length;i++){
			arrStatus.push(tm.globalForks[i].getStatus());
		}
		return arrStatus;
	}
	
	extended_createManagedCallback(fncTraditionalCallback){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		var fncManagedCallback=function(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10){
			tm.setRunningTask(runningTask);
//			log("Calling Traditional Callback in fork:"+runningTask.forkId);
			return fncTraditionalCallback(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10);
		}
		return fncManagedCallback;
	}
	extended_setProgressMinMax(min,max){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		runningTask.progressMin=min;
		runningTask.progressMax=max;
	}
	extended_setProgress(amount){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		var val=amount;
		if (typeof val==="undefined"){
			val=0;
		}
		runningTask.progress=val;
		runningTask.changeStatus();
	}
	extended_incProgress(amount){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		var incVal=amount;
		if (typeof incVal==="undefined"){
			incVal=1;
		}
		runningTask.progress+=incVal;
	}
	extended_addStep(description,method,progressMin,progressMax,newObj,totalWeight,methodWeight,sForkType,barrier){
		var self=this;
//		log("Adding Step:["+description+"]");
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		return tm.addStep(method,theObj,sForkType,barrier,description,progressMin,progressMax,totalWeight,methodWeight);
	}
	extended_parallelizeCalls(hsListItemsToProcess,fncCall,fncProcess,maxParallelThreads){
		var self=this;
		var tm=self.getTaskManager();
		var bckAutoFree=tm.autoFree;
		var bckTaskCallsBlock=tm.asyncTaskCallsBlock;
		var bckTaskCallsMaxDeep=tm.asyncTaskCallsMaxDeep;
		self.addStep("Change autofree and taskCallsblock", function(){
			tm.autoFree=false;
			tm.asyncTaskCallsBlock=0;
			tm.asyncTaskCallsMaxDeep=0;
			self.next();
		});
		self.addStep("Call parallelized pseudoThreaded",function(){
			tm.parallelizeCalls(hsListItemsToProcess,fncCall,fncProcess,maxParallelThreads);
		});
		self.addStep("Restore AutoFree and CallsBlock params",function(){
			tm.autoFree=bckAutoFree;
			tm.asyncTaskCallsBlock=bckTaskCallsBlock;
			tm.asyncTaskCallsMaxDeep=bckTaskCallsMaxDeep;
		});
		self.next();
	}

	extended_pushCallBack(method,newObj,sForkType,barrier,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		return tm.pushCallback(method,theObj,sForkType,barrier,description,progressMin,progressMax,totalWeight,methodWeight);
	}
	extended_popCallback(aArgs,iJumps){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		return tm.popCallback(aArgs,iJumps);
	}
	extended_setRunningTask(task){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		tm.setRunningTask(task);
	}
	extended_getRunningTask(){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		return tm.getRunningTask();
	}
	extended_continueTask(aArgs,iJumps){
		var self=this;
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		tm.next(aArgs,iJumps);
	}
	
	extendObject(obj){
		var self=this;
		self.object=obj;
		obj.RCGTaskManager=self;
		obj.addStep=self.extended_addStep;
		obj.pushCallback=self.extended_pushCallBack;
		obj.popCallback=self.extended_popCallback;
		obj.incTaskProgress=self.extended_incProgress;
		obj.setTaskProgressMinMax=self.extended_setProgressMinMax;
		obj.setTaskProgress=self.extended_setProgress;
		obj.createManagedCallback=self.extended_createManagedCallback;
		obj.setRunningTask=self.extended_setRunningTask;
		obj.getRunningTask=self.extended_getRunningTask;
		obj.getTaskManagerStatus=self.extended_getTaskManagerStatus;
		obj.getTaskManager=self.extended_getTaskManager;
		obj.parallelizeCalls=self.extended_parallelizeCalls;
		obj.continueTask=self.extended_continueTask;
	}
	killTasks(){
		var self=this;
		self.globalForks.forEach(function(task){
			task.killTasks();
		});
		self.innerForks.forEach(function(task){
			task.killTasks();
		});
		if (self.runningTask!=""){
			self.runningTask.killTasks();
		}
		self.freeMemory();
		self.globalForks=[];
		self.innerForks=[];
		self.runningTask="";
		self.changeStatus();
	}
	freeMemory(){
		var self=this;
		self.globalForks.forEach(function(task){
			task.freeMemory();
		});
		self.innerForks.forEach(function(task){
			task.freeMemory();
		});
		if (self.runningTask!=""){
			self.runningTask.freeMemory();
		}
		self.globalForks=[];
		self.innerForks=[];
		self.runningTask="";
	}
	
}
var taskManager=new RCGTaskManager("Total Tasks");
