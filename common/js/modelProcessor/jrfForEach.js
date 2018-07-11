var jrfForEach=class jrfForEach extends jrfLoopBase{//this kind of definition allows to hot-reload
	loadOwnProperties(){
		//debugger;
		super.loadOwnProperties();
//		debugger;
		var self=this;
		self.autoAddPostHtml=false;
		self.subType=self.getAttrVal("subtype").trim().toLowerCase();
		
/*		if (self.subType.toLowerCase()=="row"){
			self.postProcess="false";
		}
*/		
		//debugger;
		self.counter=0;
		self.parentId="";
		self.childId="";
		self.bIsRecursiving=false;
		self.recursive=self.getAttrVal("recursive");
		self.bAllRoots=false;
		self.rootBackup;
	}
	loopStart(){
		var self=this;
//		debugger;
		if (self.reportElem==self.model.report){
			self.bAllRoots=true;
		}
//		var nItem=0;
		self.rootBackUp=self.model.processingRoot;
		if ((self.subType=="subrow")||(self.subType=="row")){

			var visibility=self.visibility;
			if (visibility.trim().toLowerCase()=="dynamic"){
				debugger;
				//..... first add an id to previous <tr> 
				var iDeep=self.variables.getVar("RecursiveDeep");
				var iPosTR=self.model.htmlStack.saFindPos("<tr",true);
				if (iPosTR>=0){
					self.model.htmlStack.saReplace(iPosTR,3,'<tr id="caseta_'+self.counter+'_'+iDeep+'" ');
				}
				if (self.counter==0){
					var iPosTR=self.model.htmlStack.saFindPos("<tr",true,iPosTR);
					if (iPosTR>=0){
						self.model.htmlStack.saReplace(iPosTR,3,'<tr id="ROOT_caseta"');
					}
				}
				self.counter++;
			}
			self.bIsRecursiving=true;
		}
	}
	loopItemProcess(eachElem,index,loopLength){
		var self=this;
//		debugger;
		var newParent;
		var bLastShowed=true;
		if ((self.type=="root")||
			(self.type=="child")||
			(self.type=="advchild")||
			(self.type=="list")
			){
			newParent=eachElem;
		} else if (self.type=="array"){
			newParent=self.reportElem;
		}
		self.addStep("Start processing Element in For Each",function(){
			self.addHtml("<!-- START INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
			if (self.bAllRoots) self.model.processingRoot=newParent;
			self.continueTask();
		});
		self.addStep("Processing Element in For Each",function(){
			self.addStep("Processing all Childs elements",function(){
				self.processAllChilds(self.tag.getChilds(),newParent);
			});
			if ((self.recursive!="")&&((self.replaceVarsAndExecute(self.recursive)+"").trim().toLowerCase()=="true")){
				log("Recursive!");
				self.addStep("Encoding recursive childs...",function(){
					self.addHtml("<!-- Start Recursive -->");
					self.variables.pushVarEnv();
					var iDeep=self.variables.getVar("RecursiveDeep");
					if (iDeep==""){
						iDeep=1;
					} else {
						iDeep++;
					}
					self.variables.pushVar("RecursiveDeep",iDeep);
					self.variables.pushVar("parentRecursiveElement",self.reportElem);
					self.reportElem=eachElem;
					self.encode();
				});
				self.addStep("Encoding recursive childs...",function(){
					self.addHtml("<!-- End Recursive -->");
					self.variables.popVar("RecursiveDeep");
					self.reportElem=self.variables.popVar("parentRecursiveElement");
					self.variables.popVarEnv();
					self.continueTask();
				});
			}
			self.addStep("Continue...",function(){
				if (self.bAllRoots) self.model.processingRoot=self.rootBackUp;
				
				self.addHtml("<!-- END INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
//				self.addPostHtml();
				if ((self.subType=="row")
						//&&(bLastShowed)
						//&&((processedItemNumber+processedItemJumped)<(elemsInForEach.length()))
					 ){
					if (index<(loopLength-1)){
						// intermediate row
						self.addHtml('<!-- ADDED BY FOREACH ROW ==>>  --></td></tr><tr id="palacio"><td><!-- <== ADDED BY FOREACH ROW -->');
					}
				} else if ((self.subType=="subrow")
//							&&(bLastShowed)
//							&&((processedItemNumber+processedItemJumped)<(elemsInForEach.length()))
						){
					if (index<(loopLength-1)){
						// intermediate row
						self.addHtml('<!-- ADDED BY FOREACH SUBROW ==>>  --></td></tr><tr id="palacete"><td><!-- <== ADDED BY FOREACH SUBROW -->');
					}
				} else {
					self.addPostHtml();
				}
				self.continueTask();
			});
			self.continueTask();
		});
		return true; //allways continue
	}
	loopEnd(){
//		var self=this;
	}
	
}