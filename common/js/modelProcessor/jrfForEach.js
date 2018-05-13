var jrfForEach=class jrfForEach{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
		self.type=self.getAttrVal("type");
		self.subType=self.getAttrVal("subtype");
		self.where=self.getAttrVal("where");
		self.innerVarName=self.getAttrVal("as").trim();
		if (self.type=="root"){
			self.elemsInForEach=self.model.report.childs;
		} else if (self.type=="child"){
			self.elemsInForEach=self.reportElem.getChilds();
		} else if (self.type=="advchild"){
			self.elemsInForEach=self.reportElem.getAdvanceChilds();
		} else {
			self.elemsInForEach=newHashMap();
		}
	}
	
	
	apply(){
		var self=this;
		var bAllRoots=false;
		if (self.reportElem==self.model.report){
			bAllRoots=true;
		}
//		var nItem=0;
		var nItemWalk=0;
		var rootBackUp=self.model.processingRoot;
		
		var fncProcessEach=function(newParent,nItem){
			self.addHtml("<!-- START INNER LOOP OF ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			if (self.innerVarName!=""){
				self.variables.pushVar(self.innerVarName,newParent);
			}
			if (bAllRoots) self.model.processingRoot=newParent;
			self.addStep("Process Childs",function(){
				self.processAllChilds(self.tag.getChilds(),newParent);
			});
			self.addStep("Continue...",function(){
				if (bAllRoots) self.model.processingRoot=rootBackUp;
				self.addPostHtml();
	
				if ((self.subType=="row")&&(self.elemsInForEach.getLast().value.getKey()
											!=newParent.getKey())){
					self.addHtml("</td></tr><tr><td>");
				}
				self.addHtml("<!-- END INNER LOOP OF ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
				self.continueTask();
			});
			self.continueTask();
		}
		
		self.elemsInForEach.walk(function(newParent){
			self.addStep("Processing Element in For Each",function(){
				fncProcessEach(newParent,nItemWalk);
			});
			nItemWalk++;
		});
		
/*		self.elemsInForEach.walk(function(newParent){
			self.addHtml("<!-- START INNER LOOP OF ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			if (self.innerVarName!=""){
				self.variables.pushVar(self.innerVarName,newParent);
			}
			if (bAllRoots) self.model.processingRoot=newParent;
			self.processAllChilds(self.tag.getChilds(),newParent);
			if (bAllRoots) self.model.processingRoot=rootBackUp;
			self.addPostHtml();

			if ((self.subType=="row")&&(self.elemsInForEach.getLast().value.getKey()
										!=newParent.getKey())){
				self.addHtml("</td></tr><tr><td>");
			}
			self.addHtml("<!-- END INNER LOOP OF ITEM "+ (nItem) + " IN FOREACH JRF TOKEN -->");
			nItem++;
		});*/
	}

}

