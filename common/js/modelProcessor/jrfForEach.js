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
	updateTrId(atLevel,sAppendText){
		var nLevel=0;
		if (isDefined(atLevel)) nLevel=atLevel;
		var self=this;
		var visibility=self.visibility.saToString().trim();
		var visiType="";
		var visiParam="";
		var iVisiParam=0;
		if (visibility!=""){
			visiType=arrVisiParts[0].trim().toLowerCase();
			var arrVisiParts=visibility.split("=");
			if (arrVisiParts.length>1){
				visiParam=parseInt(arrVisiParts[1]);
			}
			
		}
		if ((visiType=="dynamic")&&(self.subType=="subrow")||(self.subType=="row")){
			debugger;
			//..... first add an id to previous <tr> 
			var iDeep=self.variables.getVar("RecursiveDeep");
			var parentElem=self.variables.getVar("parentRecursiveElement");
			var sParentKey="No hay";
			if (parentElem!=""){
				sParentKey="Si hay";
			}
			var iPosCounter=atLevel;
			var iPosTR=self.model.htmlStack.saFindPos("<tr",true);
			while ((iPosCounter<0)&&(iPosTR>=0)){
				iPosCounter++;
				iPosTR=self.model.htmlStack.saFindPos("<tr",true,iPosTR);
			}
			if (iPosTR>=0){
				self.model.htmlStack.saReplace(iPosTR,3,'<tr id="trId_'+sAppendText+'_counter--'+self.counter+'_deep--'+iDeep+'_parentkey--'+sParentKey+'" ');
			}
			self.counter++;
		}
	}
	loopStart(){
		var self=this;
//		debugger;
		if (self.reportElem==self.model.report){
			self.bAllRoots=true;
		}
//		var nItem=0;
		self.rootBackUp=self.model.processingRoot;
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
					self.updateTrId(0,"PreRecurEncode");
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