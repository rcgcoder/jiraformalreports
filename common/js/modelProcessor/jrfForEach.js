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
		self.rowPrePendHtml="";
		self.counter=0;
		self.parentId="";
		self.childId="";
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
			var arrVisiParts=visibility.split("=");
			visiType=arrVisiParts[0].trim().toLowerCase();
			if (arrVisiParts.length>1){
				visiParam=parseInt(arrVisiParts[1]);
			}
		}
		if ((visiType=="dynamic")&&(self.subType=="subrow")||(self.subType=="row")){
			//debugger;
			//..... first add an id to previous <tr> 
			var iDeep=self.variables.getVar("RecursiveDeep");
			var parentElem=self.variables.getVar("parentRecursiveElement");
			var sParentKey="noKey";
			if (parentElem!=""){
				sParentKey="isKey";
			}
			var iPosCounter=atLevel;
			var iPosTR=self.model.htmlStack.saFindPos("<tr",true);
			while ((iPosCounter<0)&&(iPosTR>=0)){
				iPosCounter++;
				iPosTR=self.model.htmlStack.saFindPos("<tr",true,iPosTR);
			}
			if (iPosTR>=0){
				self.model.htmlStack.saReplace(iPosTR,3,'<tr id="trId_'+sAppendText+'_counter--'+self.counter+'_deep--'+iDeep+'_parentkey--'+sParentKey+'_visiParam--'+visiParam+'" ');
				iPosTR=self.model.htmlStack.saFindPos("</td>",false,iPosTR);
				if (iPosTR>=0){
					self.model.htmlStack.saReplace(iPosTR,5,'id="trId_'+sAppendText+'_counter--'+self.counter+'_deep--'+iDeep+'_parentkey--'+sParentKey+'_visiParam--'+visiParam+'" </td>');
				}
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
			self.variables.pushVar("LoopElemsCount",loopLength);
			self.variables.pushVar("LoopIndex",index);
			if (self.consolidateHtml){
				//debugger;
				var indLoopContentHtmlBuffer=self.pushHtmlBuffer();
				self.variables.pushVar("LoopHtmlIndex",indLoopContentHtmlBuffer);
			}
			var iPosTR=self.model.htmlStack.saFindPos("<tr",true);
			if (index==0){
				//debugger;
				self.rowPrePendHtml=self.model.htmlStack.saSubstring(iPosTR);
			}
			
//			self.addHtml("<!-- START INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
			if (self.bAllRoots) self.model.processingRoot=newParent;
			self.variables.pushVarEnv();
			
			if ((self.subType=="row")||(self.subType=="subrow")){
			/*	if (isDefined(self.reportElem.getKey)&&(self.reportElem.getKey()=="NOTIFLOPD-124")){
					//debugger;
				} */
				debugger;
				var treeParentId=self.variables.getVar("recursiveNodeId");
				var treeNode={expanded:false,childs:newHashMap(),html:"",loaded:true};
				var treeNodeId=modelInteractiveFunctions.addInteractiveContent(treeNode);
				if (treeParentId!=""){ // its the first
					var treeParentNode=modelInteractiveFunctions.getInteractiveContent(treeParentId);
					treeParentNode.childs.add(treeNodeId,treeNode);
				}
				self.variables.pushVar("recursiveNodeId",treeNodeId);
				
				self.variables.pushVar("InitTR_Pos",iPosTR);
				if (iPosTR>=0){
					self.model.htmlStack.saReplace(iPosTR,3,'<tr id="'+treeNodeId+'" ');
				}
			}
			self.continueTask();
		});
		self.addStep("Processing Element in For Each",function(){
			self.addStep("Processing all Childs elements",function(){
				if (isDefined(self.activeVar)){
					self.processAllChilds(self.tag.getChilds(),self.activeVar);
				} else {
					self.processAllChilds(self.tag.getChilds(),newParent);
				}
			});
			//self.updateTrId(0,"inLoop");
			if ((self.recursive!="")&&((self.replaceVarsAndExecute(self.recursive)+"").trim().toLowerCase()=="true")){
				log("Recursive!");
				self.addStep("Encoding recursive childs...",function(){
//					self.addHtml("<!-- Start Recursive -->");
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
//					self.addHtml("<!-- End Recursive -->");
					self.variables.popVar("RecursiveDeep");
					self.reportElem=self.variables.popVar("parentRecursiveElement");
					self.variables.popVarEnv();
					self.continueTask();
				});
			}
			self.addStep("Continue...",function(){
				if (self.bAllRoots) self.model.processingRoot=self.rootBackUp;
				if ((self.subType=="row")||(self.subType=="subrow")){
					debugger;
					var treeNodeId=self.variables.popVar("recursiveNodeId");
					var treeNode=modelInteractiveFunctions.getInteractiveContent(treeNodeId);
					var iPosTR=self.variables.popVar("InitTR_Pos");
					var initTR=iPosTR;
					iPosTR=self.model.htmlStack.saFindPos("</td>",false,iPosTR);
					var sInsertInTd=""; //treeNodeId;
					if (treeNode.childs.length()>0){
						var sShowCaption="Show ("+ treeNode.childs.length() +") rows"; 
						var sHideCaption="Hide ("+ treeNode.childs.length() +") rows";
						sInsertInTd+='<button id="btn'+treeNodeId+'" onclick="modelInteractiveFunctions.changeDisplayChildRow(\''+treeNodeId+'\',false,window,\''+sShowCaption+'\',\''+sHideCaption+'\')">'+sShowCaption+'</button>';
					}
					if (self.model.report.config.interactiveResult){
						self.model.htmlStack.saReplace(iPosTR,5,sInsertInTd+'</td>');
					}
					var parentNodeId=self.variables.getVar("recursiveNodeId");
					if (parentNodeId!=""){
						treeNode.loaded=false;
						treeNode.expanded=false;
						self.model.htmlStack.saReplace(initTR,3,'<tr style="display:none" ');
						var iPosEndTR=5+self.model.htmlStack.saFindPos("</tr>",false,initTR);
						var sTrContent=self.model.htmlStack.saSubstring(initTR,iPosEndTR);
						self.model.htmlStack.saReplace(initTR,iPosEndTR-initTR,'');
						treeNode.html=sTrContent;
					}
					//self.model.htmlStack.saReplace(iPosTR,5,sInsertInTd+'</td>');
				}
				self.variables.popVarEnv();
				
				
				
//				self.addHtml("<!-- END INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
//				self.addPostHtml();
				if ((self.subType=="row")
						//&&(bLastShowed)
						//&&((processedItemNumber+processedItemJumped)<(elemsInForEach.length()))
					 ){
					if (index<(loopLength-1)){
						// intermediate row
//						self.addHtml('<!-- ADDED BY FOREACH ROW ==>>  --></td></tr>');
						self.addHtml(self.rowPrePendHtml);
//						self.addHtml('<!-- <== ADDED BY FOREACH ROW -->');
						//<tr><td></td><td><!-- <== ADDED BY FOREACH ROW -->');
					}
				} else if ((self.subType=="subrow")
//							&&(bLastShowed)
//							&&((processedItemNumber+processedItemJumped)<(elemsInForEach.length()))
						){
					if (index<(loopLength-1)){
						// intermediate row
/*						self.addHtml('<!-- ADDED BY FOREACH SUBROW ==>>  --></td></tr>');
						self.addHtml(self.rowPrePendHtml);
						self.addHtml('<!-- <== ADDED BY FOREACH SUBROW -->');
*///						self.addHtml('<!-- ADDED BY FOREACH SUBROW ==>>  --></td></tr><tr id="palacete"><td><!-- <== ADDED BY FOREACH SUBROW -->');
					}
				} else {
					self.addPostHtml();
				}
				self.variables.popVar("LoopIndex");
				self.variables.popVar("LoopElemsCount");
				if (self.consolidateHtml){
					//debugger;
					var indLoopContentHtmlBuffer=self.variables.popVar("LoopHtmlIndex");
					var sHtml=self.popHtmlBuffer(indLoopContentHtmlBuffer);
					if (sHtml.saLength()>0) self.addHtml(sHtml);
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