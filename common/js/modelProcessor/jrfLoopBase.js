var jrfLoopBase=class jrfLoopBase extends jrfSubset{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
		self.initialize();
	}
	apply(){
		var self=this;
		var bAllRoots=false;
		if (self.reportElem==self.model.report){
			bAllRoots=true;
		}
		var elemsInForEach=super.apply();
		
//		var nItem=0;
		var rootBackUp=self.model.processingRoot;
		// counting total elements
		elemsInForEach.walk(function(eachElem){
			var newParent;
			var bLastShowed=true;
			if ((self.type=="root")||(self.type=="child")||(self.type=="advchild")){
				newParent=eachElem;
			} else if (self.type=="array"){
				newParent=self.reportElem;
			}
			self.addStep("Start processing Element in For Each",function(){
				self.addHtml("<!-- START INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
				if (self.innerVarName!=""){
					self.variables.pushVar(self.innerVarName,eachElem);
				}
				if (bAllRoots) self.model.processingRoot=newParent;
				self.continueTask();
			});
			self.addStep("Processing Element in For Each",function(){
				self.addStep("Processing all Childs elements",function(){
					self.processAllChilds(self.tag.getChilds(),newParent);
				});
				if ((self.recursive!="")&&((self.replaceVars(self.recursive)+"").trim().toLowerCase()=="true")){
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
				self.continueTask();
			});
			self.addStep("Continue...",function(){
				if (bAllRoots) self.model.processingRoot=rootBackUp;
				self.addPostHtml();
				self.addHtml("<!-- END INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
				if ((self.subType=="row")
						//&&(bLastShowed)
						//&&((processedItemNumber+processedItemJumped)<(elemsInForEach.length()))
					 ){
					self.addHtml("<!-- ADDED BY FOREACH ROW ==>>  --></td></tr><tr><td><!-- <== ADDED BY FOREACH ROW -->");
				} else if ((self.subType=="subrow")
//							&&(bLastShowed)
//							&&((processedItemNumber+processedItemJumped)<(elemsInForEach.length()))
						){
					self.addHtml("<!-- ADDED BY FOREACH SUBROW ==>>  --></td></tr><tr><td><!-- <== ADDED BY FOREACH SUBROW -->");
				}
				self.continueTask();
			});
		});
	}

}

