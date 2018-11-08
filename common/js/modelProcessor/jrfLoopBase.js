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
	innerApply(){
		super.apply();
	}
	apply(){
		var self=this;
		//debugger;
		var iLoopElemsCount;  
		self.addStep("Initializing loop base",function(){
			self.innerApply();
		});
		self.addStep("Start processing the Loop",function(loopElems){
			self.loopElements=loopElems;
			iLoopElemsCount=self.loopElements.length();
			self.loopStart(iLoopElemsCount);
		});
		// processing total elements
		self.addStep("Processing the Loop",function(){
			var iLoopIndex=0;
			var bCancelLoop=false;
			
			self.parallelizeProcess(self.loopElements.length(),function(iLoopIndex){
//			self.loopElements.walk(function(loopElem,iDeep,itemKey,iLoopIndex){
				var loopElem=self.loopElements.findByInd(iLoopIndex);
				self.addStep("Processing the Loop item:"+iLoopIndex + " of " +iLoopElemsCount,function(){
					self.addStep("Preparing the process of item "+iLoopIndex ,function(){
						self.variables.pushVar("LoopElemsCount",iLoopElemsCount);
						self.variables.pushVar("LoopIndex",iLoopIndex );
					});
					self.addStep("Processing...",function(){
						if (!bCancelLoop) {
							if (self.innerVarName!=""){
								self.initVariables(self.innerVarName,undefined,loopElem);
							}
							if (isDynamicObject(loopElem)){
								self.workOnSteps(loopElem,function(){
									self.addStep("Processing",function(){
										var bContinue=self.loopItemProcess(loopElem,iLoopIndex,iLoopElemsCount);
										return bContinue;
									});
								});
							} else {
								self.addStep("Process no Dynamic Object",function(){
									var bContinue=self.loopItemProcess(loopElem,iLoopIndex,iLoopElemsCount);
									return bContinue;
								});
							}
						}
						return !bCancelLoop;
					});
					self.addStep("Ending the process of item "+iLoopIndex,function(bContinue){
						if (isDefined(bContinue)&&(!bContinue)){
							bCancelLoop=true;
						}
						if (self.innerVarName!=""){
							self.variables.popVar(self.innerVarName);
						}
						self.variables.popVar("LoopIndex");
						self.variables.popVar("LoopElemsCount");
					});
				});
			},1);
		});
		self.addStep("Ending processing the Loop",function(){
			self.loopEnd(iLoopElemsCount);
		});
	}

}

