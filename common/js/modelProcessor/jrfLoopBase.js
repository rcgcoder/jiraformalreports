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
			self.continueTask();
		});
		self.addStep("Start processing the Loop",function(loopElems){
			self.loopElements=loopElems;
			iLoopElemsCount=self.loopElements.length();
			self.loopStart(iLoopElemsCount);
			self.continueTask();
		});
		// processing total elements
		self.addStep("Processing the Loop",function(){
			var iLoopIndex=0;
			var bCancelLoop=false;
			
			self.parallelizeProcess(self.loopElements.length(),function(iLoopIndex){
//			self.loopElements.walk(function(loopElem,iDeep,itemKey,iLoopIndex){
				var loopElem=self.loopElements.findByInd(iLoopIndex);
				if (isDefined(loopElem.isStorable)&&loopElem.isStorable()){
					
				}
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
			},1);
//			self.continueTask();
		});
		self.addStep("Ending processing the Loop",function(){
			self.loopEnd(iLoopElemsCount);
			self.continueTask();
		});
	}

}

