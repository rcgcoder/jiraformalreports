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
	}
	reach(){
		var self=this;
		if (self.nItems<=0) {
			log("You reached to barrier but no items asigned to. It´s a bug in your program... no callback is launched");
			return;
		}
		self.nItems--;
		if (self.nItems<=0){
			self.callback();
		} 
	}
	add(){
		var self=this;
		if (self.fixedItem) return;
		self.nItems++;
	}
}
class RCGCallManager{
	constructor(){
		var self=this;
		self.description="";
		self.method="";
		self.isChangeObj=false;
		self.parent="";
		self.forkId="";
		self.actStep=-1;
		self.progressMin=0;
		self.progressMax=1;
		self.progress=0;
		self.weight=-1;
		self.methodWeight=-1;
		self.steps=[];
		self.forks=[];
		self.stackCallbacks=[];
		self.object="";
		self.running=false;
		self.done=false;
		self.barrier="";
		self.rootManager="";
		self.runningForkId="";
		//self.extendObject(obj);
		self.asyncPops=true;
	}
	getRootCallManager(){
		var self=this;
		var rootCM=self.rootManager;
		if (rootCM==""){
			rootCM=self;
		}
		return rootCM;
	}
	getRunningForkId(){
		var self=this;
		if (self.rootManager==""){
			return self.runningForkId; 
		} else {
			return self.rootManager.runningForkId;
		}
	}
	setRunningForkId(forkId){
		var self=this;
		if (self.rootManager==""){
			self.runningForkId=forkId;
		} else {
			self.rootManager.runningForkId=forkId;
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
					running:self.running
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
				running:bRunningMethod
				};
		if (self.steps.length==0){
			status.min=self.progressMin;
			status.max=self.progressMax;
			status.adv=self.progress;
			status.weight=self.weight;
			return status;
		}
		var arrStatus=[];
		arrStatus.push(status);
		for (var i=0;i<self.steps.length;i++){
			var auxStep=self.steps[i];
			arrStatus.push(auxStep.getStatus());
		}
		var totalWeight=0;
		var medWeight=0;
		var totalWeightSetted=0;
		var itemsWithoutWeight=0;
		var itemsWithWeight=0;
		var iRunning=-1;
		for (var i=0;i<arrStatus.length;i++){
			var auxStatus=arrStatus[i];
			if (auxStatus.weight>=0){
				totalWeightSetted+=auxStatus.weight;
				itemsWithWeight++;
			} else {
				itemsWithoutWeight++;
			}
			if (auxStatus.running){
				iRunning=i;
			}
		}
		if (totalWeightSetted>0){
			medWeight=totalWeightSetted/itemsWithWeight;
			totalWeight=totalWeightSetted+(medWeight*itemsWithoutWeight);
		} else {
			totalWeight=1;
			medWeight=totalWeight/itemsWithoutWeight;
		}
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
				child:arrStatus[iRunning]
				};
		return returnStatus;
	}
	searchForFork(forkId){
		var self=this;
		if (typeof forkId==="undefined") return self;
		if (self.forkId==forkId) return self;
		var rootCM=self.getRootCallManager();
		if (rootCM.forks.length==0) return "";
		var theFork="";
		for (var i=0;(i<self.forks.length);i++){
			theFork=self.forks[i].searchForFork(forkId);
			if (theFork!="") return theFork;
		}
		
		/*
		if ((self.steps.length==0) && (self.forks.length==0) && (self.stackCallbacks.lenght==0)) return "";
		if (self.actStep>=self.steps.length) return "";
		var bForkLocated=false;
		var theFork="";
		for (var i=0;(i<self.forks.length);i++){
			theFork=self.forks[i].searchForFork(forkId);
			if (theFork!="") return theFork;
		}
		for (var i=0;(i<self.steps.length);i++){
			theFork=self.steps[i].searchForFork(forkId);
			if (theFork!="") return theFork;
		}
		for (var i=0;(i<self.stackCallbacks.length);i++){
			theFork=self.stackCallbacks[i].searchForFork(forkId);
			if (theFork!="") return theFork;
		}
		*/
		return theFork;
	}
	getDeepStep(){
		var self=this;
		if (self.steps.length==0) return self;
		if (self.actStep>=self.steps.length) return self;
		if (self.actStep<0) return self;
		var actForkId=self.getRunningForkId();
		if (actForkId!=""){
			var theFork=self.searchForFork(actForkId);
			if (theFork!=""){
				return theFork.getDeepStep();
			}
		} 
		var stepRunning=self.steps[self.actStep];
		return stepRunning.getDeepStep();
	}
	getRunningCall(){
		var self=this;
		var stepRunning=self.getDeepStep();
		for (var i=(stepRunning.stackCallbacks.length-1);i>=0;i--){
			var cb=stepRunning.stackCallbacks[i];
			if (cb.running){
				return cb;
			}
		}
		return stepRunning;
	}
	newSubManager(method,obj){
		var self=this;
		var theObj=obj;
		if (typeof theObj==="undefined"){
			theObj=self.object;
		}
		var cm=new RCGCallManager();
		if (self.rootManager==""){
			cm.rootManager=self;
		} else {
			cm.rootManager=self.rootManager;
		}
		cm.parent=self;
		cm.object=theObj;
		cm.forkId=self.forkId;
		cm.method=method;
		return cm;
	}
	addStep(description,method,progressMin,progressMax,obj){
		var self=this;
		var cm=self.newSubManager(method,obj);
		if ((typeof progressMin!=="undefined")&&(typeof progressMax!=="undefined")){
			cm.progressMin=progressMin;
			cm.progressMax=progressMax;
			cm.progress=progressMin;
		}
		cm.description=description;
		cm.parent=self;
		self.steps.push(cm);
		return cm;
	}

	
	newForkId(){
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	addFork(method,barrier,obj){
		var self=this;
		var rootCM=self.getRootCallManager();
		var cm=self.getRunningCall();
		var cmFork=cm.newSubManager(method,obj);
		cmFork.forkId=self.newForkId();
		cmFork.barrier=barrier;
		rootCM.forks.push(cmFork);
		return cmFork;
	}
	runSteps(aArgs,bJumpLast){
		var self=this;
		var forkId=self.getRunningForkId();
		self.done=false;
		self.running=true;
		if (!((self.method==null)||(self.method=="")||(typeof self.method==="undefined"))){
			self.callMethod(aArgs);
		} else {
			self.nextStep(aArgs);
		}
	}
	pushCallback(method,obj,newFork,barrier){
		var self=this;
		if (typeof method==="undefined"){
			log("you are pushing an undefined callback... be carefull.... it´s maybe a big bug");
		}
		if ((typeof newFork!=="undefined")&&(newFork)){
			return self.addFork(method,barrier,obj);
		} else {
			var ds=self.getDeepStep();
			var cm=ds.newSubManager(method,obj);
			ds.stackCallbacks.push(cm);
			return cm;
		}
		
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
		var theForkId=self.forkId;
		var fncApply=function(){
			self.setRunningForkId(theForkId);
			theMethod.apply(context,newArgs);
		}
		if (self.asyncPops) {
			setTimeout(fncApply);
		} else {
			fncApply();
		}
	}
	nextStep(aArgs,bJumpLast){
		var self=this;
		var stepRunning=self.getRunningCall();
		
		
		var bWithSubSteps;
		var subSteps;
		var iSubStep;
		var nSteps;
		
		while (stepRunning!=""){
			subSteps=stepRunning.steps;
			nSteps=subSteps.length;
			iSubStep=stepRunning.actStep;
			bWithSubSteps=(nSteps>0);
			if (!bWithSubSteps){ // it´s finished
				stepRunning.running=false;  // the step is finished
				stepRunning.done=true;
				stepRunning=stepRunning.parent; // goto next brother
			} else if (iSubStep>nSteps){
				stepRunning.running=false;  // the step is finished
				stepRunning.done=true;
				stepRunning=stepRunning.parent; // goto next brother
			} else if (iSubStep==(nSteps-1)){
				stepRunning.running=false;  // the step is finished
				stepRunning.done=true;
				stepRunning.actStep++;
				stepRunning=stepRunning.parent; // goto next brother
			} else if (iSubStep>=0){ // the next step is [0 ... n-1] normal case
				stepRunning.actStep++;
				if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
					return stepRunning.nextStep(aArgs,false);
				} else {
					var cm=stepRunning.steps[stepRunning.actStep];
					return cm.callMethod(aArgs);
				}
			} else if (iSubStep<0){
				if (stepRunning.running){ // if it´s running.... the method were called and only advances the sub steps
					stepRunning.actStep++;
					if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
						return stepRunning.nextStep(aArgs,false);
					} else {
						var cm=stepRunning.steps[stepRunning.actStep];
						return cm.callMethod(aArgs);
					}
				} else if (stepRunning.method!="") { // if not is running... check if there is a method
					stepRunning.running=true;  // the step is finished
					stepRunning.done=false;
					if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){ // if have to jump the operation....
						stepRunning.actStep++;
						return stepRunning.nextStep(aArgs,false);
					} else { // 
						return stepRunning.callMethod(aArgs);
					}
				}
			}
		}
	}
	popCallback(aArgs,bJumpLast){
		var self=this;
		var ds=self.getDeepStep();
		if (ds.stackCallbacks.length>0){
			if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
				ds.stackCallbacks.pop();
				return self.popCallback(aArgs,false);
			} else {
				var theCallback=ds.stackCallbacks.pop();
				if (theCallback.isChangeObj){
					theCallback.callMethod(aArgs);
				} else {
					theCallback.callMethod(aArgs);
				}
			}
		} else { // there is not callbacks to pop..... let´s go to next step.
			self.nextStep(aArgs,bJumpLast);
		}
	}
	extended_setProgressMinMax(min,max){
		var stepRunning=self.callManager.getDeepStep();
		stepRunning.progressMin=min;
		stepRunning.progressMax=max;
	}
	extended_setProgress(amount){
		var stepRunning=self.callManager.getDeepStep();
		var val=amount;
		if (typeof val==="undefined"){
			val=0;
		}
		stepRunning.progress=val;
	}
	extended_incProgress(amount){
		var stepRunning=self.callManager.getDeepStep();
		var incVal=amount;
		if (typeof incVal==="undefined"){
			incVal=1;
		}
		stepRunning.progress+=incVal;
	}
	extended_addStep(description,method,progressMin,progressMax,newObj){
		var self=this;
		var cm=self.callManager.getRunningCall();
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		var antObj="";
		var bSetChangeObjStep=false;
		if (cm.object!=theObj){
			antObj=cm.object;
			bSetChangeObjStep=true;
		}
		cm.object=theObj;
		cm.addStep(description,method,progressMin,progressMax,theObj);
		if (bSetChangeObjStep){
			log("Requires ChangeObject Callback");
			var changeObjectStep=function(aArgs){
				var auxArgs=aArgs;
				if ((typeof auxArgs!=="array")&&(typeof auxArgs!=="undefined")){
					auxArgs=[auxArgs];
				}
				cm.object=antObj;
				cm.popCallback(auxArgs,false);
			}
			var chObj=cm.addStep(description+" changeObj",changeObjectStep,"");
			chObj.isChangeObj=true;
		}

	}
	extended_pushCallBack(method,newObj,newFork,barrier){
		var self=this;
		var cm=self.callManager;
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		var bNewFork=((typeof newFork!=="undefined")&&(newFork));
			
		if (cm.object!=theObj){
			log("Object Changed... pushing change callback:"+ self.callManager.getDeepStep().stackCallbacks.length);
			var antObj=cm.object;
			var changeObjectCallback=function(aArgs){
				cm.object=antObj;
				cm.popCallback(aArgs);
			}
			var newCM=self.callManager.pushCallback(changeObjectCallback,"",bNewFork,barrier);
			var auxForkId=newCM.forkId;
			bNewFork=false; // the fork is done... next push will be in the new fork
		}
		cm.object=theObj;
		return self.callManager.pushCallback(method,theObj,bNewFork,barrier);
	}
	extended_popCallback(aArgs){
		var self=this;
		self.callManager.popCallback(aArgs);
	}
	extendObject(obj){
		var self=this;
		self.object=obj;
		obj.callManager=self;
		obj.addStep=self.extended_addStep;
		obj.pushCallback=self.extended_pushCallBack;
		obj.popCallback=self.extended_popCallback;
		obj.incStepProgress=self.extended_incProgress;
		obj.setStepProgressMinMax=self.extended_setProgressMinMax;
		obj.setStepProgress=self.extended_setProgress;
	}
}
var callManager=new RCGCallManager();
