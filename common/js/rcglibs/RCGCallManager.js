class callManagerTask{
	constructor(method,callManager,isChangeObj,progressMin,progressMax,weight){
		self.method="";
		self.isChangeObj=false;
		self.progressMin=progressMin;
		self.progressMax=progressMax;
		self.progress=0;
		self.progressWeight=weight;
		self.running=false;
		self.callManager=callManager;
	}
}


class CallManager{
	constructor(){
		var self=this;
		self.description="";
		self.parent="";
		self.forkId="";
		self.actStep=-1;
		self.progressMin=0;
		self.progressMax=0;
		self.progress=0;
		self.steps=[];
		self.forks=[];
		self.stackCallbacks=[];
		self.object="";
		self.running=false;
		//self.extendObject(obj);
		self.asyncPops=false;
	}
	getStatus(){
		var self=this;
		var progressPercent=0;
//		if (self.steps.length==0){
		// call status
		var bRunning=false;
		if (self.actStep>=0){
			progressPercent=1;
		} else if (self.method!=""){
			bRunning=true;
			var progressMax=self.progressMax;
			var progressMin=self.progressMin;
			var progressItems=progressMax-progressMin;
			progressPercent=0;
			if (progressItems>0){
				progressPercent=self.progress/progressItems;
			}
		}

		var arrStatus=[];
		arrStatus.push({desc:self.description,perc:progressPercent,weight:self.weight,running:bRunning});
		for (var i=0;i<self.steps.length;i++){
			var auxStep=self.steps[i];
			if (i<self.actStep){
				arrStatus.push({desc:auxStep.description,perc:1,weight:auxStep.weight,running:false});
			} else if (i>self.actStep) {
				arrStatus.push({desc:auxStep.description,perc:0,weight:auxStep.weight,running:false});
			} else {
				var auxStatus=auxStep.getStatus();
				arrStatus.push({desc:auxStep.description,perc:auxStatus.perc,weight:auxStep.weight,running:true});
			}
		}
		var totalWeight=0;
		var medWeight=0;
		var totalWeightSetted=0;
		var itemsWithoutWeight=0;
		var itemsWithWeight=0;
		var iRunning=-1;
		for (var i=0;i<arrStatus.length;i++){
			var auxStatus=arrStatus[i];
			if (auxStatus.weight<0){
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
					auxWeight=medWeight;
				}
				acumProcessed+=auxWeight;
			}
		}
		
		
		var 
		totalWeight=totalWeightSetted
		
		
		
		if (self.steps.length==0){
			return ;
		} else { // if has substeps
			
			
			
			
			
			progressMax=100;
			progressMin=0;
			progressItems=self.steps.length;
			var totalWeight=0;
			var itemsWithWeight=0;
			var acumWeightProcessed=0;
			var itemsProcessedWithoutWeight=0;
			var bRunning=false;
			var actualStepWeight=-1;
			var actualStepAdv=0;
			if (self.method!=""){
				progressItems++; // if has method... there is a one more item
				if (self.actStep<0){
					bRunning=true;
					actualStepWeight=self.weight;
					actualStepAdv=progressPercent;		
				} else if (self.weight>=0){
					itemsWithWeight++;
					totalWeight+=self.weight;
					if (self.actStep>=0){
						acumWeightProcessed+=self.weight;
					}
				} else 
					itemsProcessedWithoutWeight++;
				}
			}
			for (var i=0;i<self.steps.length;i++){
				var auxStep=self.steps[i];
				if (i==self.actStep){
					bRunning=true;
					var actStatus=auxStep.getStatus();
					if (auxStep.weight<0){
						actualStepWeight=-1;
						var actualStepAdv=0;
						
					} else {
						actualStepWeight=auxStep.weight;
						
					}
				} else if (auxStep.weight>=0){
					itemsWithWeight++;
					totalWeight+=auxStep.weight;
					if ((self.actStep>=0)&&(self.actStep>i)){
						acumWeightProcessed+=auxStep.weight;
					}
				} else if ((self.actStep>=0)&&(self.actStep>i)){
					itemsProcessedWithoutWeight++;
				} 
			}
			var medWeight=0;
			var percWeight=0;
			var percProcessedWeight=0;
			if (itemsWithWeight==0){
				totalWeight=100;
				medWeight=totalWeight/progressItems;
			} else {
				medWeight=totalWeight/itemsWithWeight;
				totalWeight+=(medWeight*(progressItems-itemsWithWeight));
			}
			acumWeightProcessed+=(itemsProcessedWithoutWeight*medWeight);
			percWeight=100/totalWeight;
			percProcessedWeight=(percWeight*acumWeightProcessed);
			return {perc:percProcessedWeight,weight:self.weight};
		}
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
		var cm=new CallManager();
		cm.parent=self;
		cm.object=theObj;
		cm.forkId=self.forkId;
		cm.method=method;
		return cm;
	}
	addStep(description,method,forkId,obj){
		var self=this;
		var cm=self.newSubManager(method,obj);
		cm.description=description;
		self.steps.push(cm);
	}
	newForkId(){
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	runSteps(aArgs,forkId,bJumpLast){
		var self=this;
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
		var fncApply=function(){
			theMethod.apply(context,aArgs);
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
		
		while (stepRunning!=""){
			if ((stepRunning.steps.length>0)&&((stepRunning.steps.length-1)>stepRunning.actStep)){
				if (stepRunning.actStep>=0){
					stepRunning.steps[stepRunning.actStep].running=false;
				}
				stepRunning.actStep++;
				var cm=stepRunning.steps[stepRunning.actStep];
				if ((typeof bJumpLast!=="undefined")&&(bJumpLast)){
					return self.nextStep(aArgs,forkId,false);
				} else {
					return cm.callMethod(aArgs);
				}
			} 
			stepRunning.running=false;  // the step is finished
			stepRunning=stepRunning.parent;
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
	extended_addStep(description,method,forkId,newObj){
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
		cm.addStep(description,method,forkId,theObj);
		if (bSetChangeObjStep){
			var changeObjectStep=function(aArgs){
				cm.object=antObj;
				cm.popCallback(aArgs);
				cm.isChangeObj=true;
			}
			cm.addStep(description,changeObjectStep,forkId,"");
		}

	}
	extended_pushCallBack(method,forkId,newObj){
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
	}
}
var callManager=new CallManager();
