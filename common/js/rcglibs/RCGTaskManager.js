class RCGBarrier{
	constructor(callback,nItems){
		self=this;
		self.callback=callback;
		self.nItems=0;
		self.fixedItems=false;
		if (typeof nItems!=="undefined"){
			self.nItems==nItems;
			self.fixedItems=true;
		}
		self.tasksBarried=[]; // to debug barrier activity
		self.tasksReached=[]; // to debug barrier activity
	}
	reach(task){
		var self=this;
		self.tasksReached.push(task); // to debug activity
		if (self.nItems<=0) {
			log("You reached to barrier but no items asigned to. It´s a bug in your program... no callback is launched");
			return;
		}
		self.nItems--;
		if (self.nItems<=0){
			setTimeout(self.callback);
		} 
	}
	add(task){
		var self=this;
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
		self.done=false;
		self.barrier="";
		self.taskManager=taskManager;
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
	setOnChangeStatus(callback){
		var self=this;
		self.onChangeStatus=callback;
	}
	changeStatus(){
		var self=this;
		if (self.onChangeStatus!=""){
			self.onChangeStatus();
		}
		if (self.parent!=""){
			self.parent.changeStatus();
		} else {
			self.getTaskManager().changeStatus();
		}
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
		return self.getTaskManager().getRunningTask(); 
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
		if (typeof theMethod==="string"){
			theMethod=context[theMethod];
		}
		var newArgs=aArgs;
		if ((!Array.isArray(aArgs))&&(typeof aArgs!=="undefined")){
			newArgs=[aArgs];
		}
		var theTask=self;
		var fncApply=function(){
			self.getTaskManager().setRunningTask(theTask);
			if (theTask.description!=""){
				log("Calling method of task: "+theTask.description);
			}
			theMethod.apply(context,newArgs);
		}
		if (self.getTaskManager().asyncTaskCalls) {
			setTimeout(fncApply); //976 76 70 02 #9315# 
		} else {
			fncApply();
		}
	}
	
	getStatus(){
		var self=this;
		if ((self.done)||(!self.running)){
			return {
					desc:self.description,
					min:0,
					max:1,
					perc:(self.done?1:0),
					adv:(self.done?1:0),
					weight:self.weight,
					done:self.done,
					running:self.running,
					isCallback:self.isCallback,
					detail:[]  // there is not detail..... 
					};
		}
		var progressPercent=0;
//		if (self.steps.length==0){
		// call status
		var bRunningMethod=false;
		if (self.actStep>=0){
			progressPercent=1;
		} else if (self.method!=""){
			bRunningMethod=true;
			var progressMax=self.progressMax;
			var progressMin=self.progressMin;
			var progressItems=progressMax-progressMin;
			progressPercent=0;
			if (progressItems>0){
				progressPercent=self.progress/progressItems;
			}
		}
		var status={
				desc:self.description,
				min:0,
				max:1,
				perc:progressPercent,
				adv:progressPercent,
				weight:self.methodWeight,
				done:false,
				running:bRunningMethod,
				isCallback:self.isCallback
				,detail:[]  // there is not more detail???..... 
				};
		if (self.steps.length==0){
			status.min=self.progressMin;
			status.max=self.progressMax;
			status.adv=self.progress;
			status.weight=self.weight;
			status.detail=[];  // No, there is not more detail..... 
			return status;
		}
		var arrStatus=[];
		arrStatus.push(status);
		for (var i=0;i<self.steps.length;i++){
			var auxStep=self.steps[i];
			arrStatus.push(auxStep.getStatus());
		}
		for (var i=0;i<self.innerForks.length;i++){
			var auxStep=self.innerForks[i];
			arrStatus.push(auxStep.getStatus());
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
				min:0,
				max:1,
				perc:totalPerc,
				adv:totalPerc,
				done:false,
				running:true,
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
		self.globalForks=[]; // list of pseudothreaded global tasks
		self.innerForks=[];   // list of pseudothreaded inner forks (forks in a subtask)
		self.runningTask="";
		self.onChangeStatus="";
		//self.extendObject(obj);
		self.asyncTaskCalls=true;
	}
	setOnChangeStatus(callback){
		var self=this;
		self.onChangeStatus=callback;
	}
	changeStatus(){
		var self=this;
		if (self.onChangeStatus!=""){
			self.onChangeStatus();
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
		return self.runningTask; 
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
			fork.barrier.add(fork);
		}
		self.globalForks.push(fork);
		runningTask.steps.push(fork);
		if (typeof barrier!=="undefined"){
			fork.pushCallback(function(){
				barrier.reach(self.getRunningTask());
				fork.popCallback();
			});
		}
		return fork;
	}
	addInnerFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight){
		var self=this;
		var runningTask=self.getRunningTask();
		var fork=self.newTask(method,obj,description,progressMin,progressMax,totalWeight,methodWeight);

		fork.forkId=self.newForkId();
		fork.isFork=true;

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
		
		
		
		runningTask.innerForks.push(fork);
		self.innerForks.push(fork);
		runningTask.steps.push(fork);
		if (typeof barrier!=="undefined"){
			fork.barrier=barrier;
			fork.barrier.add(fork);
			// there is not necesary to include a reach callback.... the next method launches automatically
			/*fork.pushCallback(function(){
				barrier.reach(fork);
				fork.popCallback();
			});*/
		}
		var innerBarrier;
		if (runningTask.barrier==""){
			var fncBarrierOpen=function(){
				self.setRunningTask(runningTask);
				runningTask.running=false;
				runningTask.done=true;
				self.next();
			}
			innerBarrier=new RCGBarrier(fncBarrierOpen);
			innerBarrier.add(runningTask); // to reach the barrier at the end of the last step of the task
			runningTask.barrier=innerBarrier;
		} else {
			innerBarrier=runningTask.barrier;
		}
		innerBarrier.add(fork);
/*		self.setRunningTask(fork);
		self.pushCallback(function(){
			self.setRunningTask(runningTask);
			log("fork:" + fork.forkId+" has reached the finish Barrier");
			innerBarrier.reach(fork);
			if (typeof barrier!=="undefined"){
				barrier.reach(fork);
			}
		});
		self.setRunningTask(runningTask);
*/		return fork;
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
		if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="GLOBAL")){
			return self.addGlobalFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight);
		} else if ((typeof sForkType!=="undefined")&&(sForkType.toUpperCase()=="INNER")){
			return self.addInnerFork(method,barrier,obj,description,progressMin,progressMax,totalWeight,methodWeight);
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
			if (iSubStep>=nSteps){ // the actual task is reached the end of de steps
				if ((!stepRunning.done)&&((stepRunning.innerForks.length>0)||(stepRunning.barrier!=""))){
					stepRunning.changeStatus();
					return stepRunning.barrier.reach(stepRunning);
				} else {
					stepRunning.running=false;
					stepRunning.done=true;
					stepRunning.changeStatus();
					stepRunning=stepRunning.parent;
				}
				
			} else if ((iSubStep>=0)&&(iSubStep<nSteps)) { // Phase 2..steps.... 
													// it´s running a intermediate step...
				var actStep=subSteps[iSubStep];   // setting the actual step to identify the task to process in next round
				if (actStep.done){ // if the next step is done....
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
							stepRunning.done=true;     // the step was finished .. now is done (ensure)
							stepRunning.changeStatus();
							stepRunning=stepRunning.parent; // next round have to check a brother step... method probably...
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
						stepRunning.done=true;      // the call is done
						stepRunning.changeStatus();
						stepRunning=stepRunning.parent; // goto next brother
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
						stepRunning.done=true;      // the call is done
						stepRunning.changeStatus();
						stepRunning=stepRunning.parent; // goto next brother
					}
				} else if (stepRunning.parent!=""){ // if there is not method setted and is not the root callmanager
					log("Call without method....¿big error?"); // may be an error
				} else {
					stepRunning=stepRunning.parent; // is root.... 
				}
			}
		}
		if (bLocated){
			var taskToRun=stepRunning;
			if (stepRunning.isFork){ // if the step is a fork.... 
				// remove the step..... and continue
				log ("Next running task is fork: " + stepRunning.description + "("+stepRunning.forkId+")");
				var parent=stepRunning.parent;
				var iStep=parent.actStep;
				if ((iStep<0)||(iStep>parent.steps.length)){
					log("Impossible situation.... the fork has to be in the step array of the parent");
				} else { // remove the parent step of the fork
					parent.steps.splice(iStep, 1);
					var continueTask=parent;
					if (parent.actStep<parent.steps.length){
						continueTask=parent.steps[parent.actStep];
					}
					log("Continue running "+continueTask.description+ "("+continueTask.forkId+")");
					self.setRunningTask(continueTask);
					self.next(aArgs,nJumps);
				}
			}
			taskToRun.callMethod(aArgs);
		} else {
			self.changeStatus();
			log("¡¡FINISHED!!");
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
			fncTraditionalCallback(p1,p2,p3,p4,p5,p6,p7,p8,p9,p10);
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
		log("Adding Step:["+description+"]");
		var tm=self.getTaskManager();
		var runningTask=tm.getRunningTask();
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		return tm.addStep(method,theObj,sForkType,barrier,description,progressMin,progressMax,totalWeight,methodWeight);
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
		obj.incStepProgress=self.extended_incProgress;
		obj.setStepProgressMinMax=self.extended_setProgressMinMax;
		obj.setStepProgress=self.extended_setProgress;
		obj.createManagedCallback=self.extended_createManagedCallback;
		obj.setRunningTask=self.extended_setRunningTask;
		obj.getRunningTask=self.extended_getRunningTask;
		obj.getTaskManagerStatus=self.extended_getTaskManagerStatus;
		obj.getTaskManager=self.extended_getTaskManager;
		obj.continueTask=self.extended_continueTask;
	}
}
var taskManager=new RCGTaskManager("Total Tasks");
