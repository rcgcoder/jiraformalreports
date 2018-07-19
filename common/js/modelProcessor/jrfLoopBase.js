var jrfLoopBase=class jrfLoopBase extends jrfSubset{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		super.loadOwnProperties();
		var self=this;
		self.loopElements;
	}
	loopStart(){
		
	}
	loopItemProcess(elem){
		
	}
	loopEnd(){
		
	}
	apply(){
		var self=this;
		//debugger;
		self.loopElements=super.apply();
		self.addStep("Start processing the Loop",function(){
			self.loopStart();
			self.continueTask();
		});
		// processing total elements
		var iLoopIndex=0;
		var iLoopElemsCount=self.loopElements.length();
		var bCancelLoop=false;
		self.loopElements.walk(function(loopElem,iDeep,itemKey,iLoopIndex){
			self.addStep("Processing the Loop item:"+iLoopIndex + " of " +iLoopElemsCount,function(){
				self.variables.pushVar("LoopElemsCount",iLoopElemsCount);
				self.variables.pushVar("LoopIndex",iLoopIndex );
				if (!bCancelLoop) {
					if (self.innerVarName!=""){
						self.initVariables(self.innerVarName,undefined,loopElem);
					}
					var bContinue=self.loopItemProcess(loopElem,iLoopIndex,iLoopElemsCount);
					if (isDefined(bContinue)&&(!bContinue)){
						bCancelLoop=true;;
					}
				}
				self.variables.popVar("LoopIndex");
				self.variables.popVar("LoopElemsCount");
				self.continueTask();
			});
		});
		self.addStep("Ending processing the Loop",function(){
			self.loopEnd();
			self.continueTask();
		});
	}

}

