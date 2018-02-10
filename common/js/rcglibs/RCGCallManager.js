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
			console.log("You reached to barrier but no items asigned to. It´s a bug in your program... no callback is launched");
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
		//self.extendObject(obj);
		self.asyncPops=true;
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
		if (typeof forkId==="undefined") return self;
		if (self.forkId==forkId) return self;
		if (self.steps.length==0) return "";
		if (self.actStep>=self.steps.length) return "";
		var bForkLocated=false;
		var theFork="";
		for (var i=0;(theFork=="") &&(i<self.forks.length);i++){
			theFork=self.forks[i].searchForFork(forkId);
		}
		return theFork;
	}
	getDeepStep(forkId){
		var self=this;
		if (self.steps.length==0) return self;
		if (self.actStep>=self.steps.length) return self;
		if (self.actStep<0) return self;
		if (typeof forkId!=="undefined"){
			var theFork=self.searchForFork(forkId);
			if (theFork!=""){
				return theFork.getDeepStep();
			}
		} 
		var stepRunning=self.steps[self.actStep];
		return stepRunning.getDeepStep();
	}
	getRunningCall(forkId){
		var self=this;
		var stepRunning=self.getDeepStep(forkId);
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
		cm.parent=self;
		cm.object=theObj;
		cm.forkId=self.forkId;
		cm.method=method;
		return cm;
	}
	addStep(description,method,progressMin,progressMax,forkId,obj){
		var self=this;
		var cm=self.newSubManager(method,obj);
		if ((typeof progressMin!=="undefined")&&(typeof progressMax!=="undefined")){
			cm.progressMin=progressMin;
			cm.progressMax=progressMax;
			cm.progress=progressMin;
		}
		cm.description=description;
		self.steps.push(cm);
		return cm;
	}
	newForkId(){
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	runSteps(aArgs,forkId,bJumpLast){
		var self=this;
		self.done=false;
		self.running=true;
		if (!((self.method==null)||(self.method=="")||(typeof self.method==="undefined"))){
			self.callMethod(aArgs);
		} else {
			self.nextStep(aArgs);
		}
	}
	addFork(method,obj){
		var self=this;
		cm=self.newSubManager(method,obj);
		cm.forkId=self.newForkId();
		self.forks.push(cm);
		return cm;
	}
	pushCallback(method,forkId,obj){
		var self=this;
		if (typeof method==="undefined"){
			console.log("you are pushing an undefined callback... be carefull.... it´s maybe a big bug");
		}
		var ds=self.getDeepStep(forkId);
		var cm=ds.newSubManager(method,obj);
		ds.stackCallbacks.push(cm);
	}
	callMethod(aArgs){
		var self=this;
		self.running=true;
		var obj=self.object;
		var theMethod=self.method;
		if (typeof theMethod==="undefined"){
			console.log("¿undefined?.... this will be a Big Crash!!!");
		}

		var context=obj;
		if (obj==""){
			context=undefined;
		}
		if (typeof theMethod==="string"){
			theMethod=context[theMethod];
		}
		var newArgs=aArgs;
		if (!Array.isArray(aArgs)){
			newArgs=[aArgs];
		}
		var fncApply=function(){
			theMethod.apply(context,newArgs);
		}
		if (self.asyncPops) {
			setTimeout(fncApply);
		} else {
			fncApply();
		}
	}
	nextStep(aArgs,forkId,bJumpLast){
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
					return stepRunning.nextStep(aArgs,forkId,false);
				} else {
					var cm=stepRunning.steps[stepRunning.actStep];
					return cm.callMethod(aArgs);
				}
			} else if (iSubStep<0){
				if (stepRunning.running){ // if it´s running.... the method were called and only advances the sub steps
					stepRunning.actStep++;
					if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
						return stepRunning.nextStep(aArgs,forkId,false);
					} else {
						var cm=stepRunning.steps[stepRunning.actStep];
						return cm.callMethod(aArgs);
					}
				} else if (stepRunning.method!="") { // if not is running... check if there is a method
					stepRunning.running=true;  // the step is finished
					stepRunning.done=false;
					if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){ // if have to jump the operation....
						stepRunning.actStep++;
						return stepRunning.nextStep(aArgs,forkId,false);
					} else { // 
						return stepRunning.callMethod(aArgs);
					}
				}
			}
		}
	}
	popCallback(aArgs,forkId,bJumpLast){
		var self=this;
		var ds=self.getDeepStep(forkId);
		if (ds.stackCallbacks.length>0){
			if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
				ds.stackCallbacks.pop();
				return self.popCallback(aArgs,forkId,false);
			} else {
				var theCallback=ds.stackCallbacks.pop();
				theCallback.callMethod(aArgs);
			}
		} else { // there is not callbacks to pop..... let´s go to next step.
			self.nextStep(aArgs,forkId,bJumpLast);
		}
	}
	extended_setProgressMinMax(min,max,forkId){
		var stepRunning=self.callManager.getDeepStep(forkId);
		stepRunning.progressMin=min;
		stepRunning.progressMax=max;
	}
	extended_setProgress(amount,forkId){
		var stepRunning=self.callManager.getDeepStep(forkId);
		var val=amount;
		if (typeof val==="undefined"){
			val=0;
		}
		stepRunning.progress=val;
	}
	extended_incProgress(amount,forkId){
		var stepRunning=self.callManager.getDeepStep(forkId);
		var incVal=amount;
		if (typeof incVal==="undefined"){
			incVal=1;
		}
		stepRunning.progress+=incVal;
	}
	extended_addStep(description,method,progressMin,progressMax,forkId,newObj){
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
		cm.addStep(description,method,progressMin,progressMax,forkId,theObj);
		if (bSetChangeObjStep){
			console.log("Requires ChangeObject Callback");
			var changeObjectStep=function(aArgs){
				var auxArgs=aArgs;
				if (typeof auxArgs!=="array"){
					auxArgs=[auxArgs];
				}
				cm.object=antObj;
				cm.popCallback(auxArgs,forkId,false);
			}
			var chObj=cm.addStep(description+" changeObj",changeObjectStep,forkId,"");
			chObj.isChangeObj=true;
		}

	}
	extended_pushCallBack(method,forkId,newObj,isFork,barrier){
		var self=this;
		var cm=self.callManager;
		var theObj=newObj;
		if (typeof newObj==="undefined"){
			theObj=self;
		}
		if (cm.object!=theObj){
			var antObj=cm.object;
			var changeObjectCallback=function(aArgs){
				cm.object=antObj;
				cm.popCallback(aArgs);
			}
			self.callManager.pushCallback(changeObjectCallback,forkId,"");
		}
		cm.object=theObj;
		self.callManager.pushCallback(method,forkId,theObj);
	}
	extended_popCallback(aArgs){
		this.callManager.popCallback(aArgs);
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
