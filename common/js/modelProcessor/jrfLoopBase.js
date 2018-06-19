var jrfLoopBase=class jrfLoopBase{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
		self.type=self.getAttrVal("type");
		self.subType=self.getAttrVal("subtype");
//		self.where=self.getAttrVal("where",undefined,false);
		self.innerVarName=self.getAttrVal("as");
		self.source=self.getAttrVal("source");
		self.recursive=self.getAttrVal("recursive");
		self.sourceJson=self.getAttrVal("sourcejson");
		self.sourceJS=self.getAttrVal("sourcejs");
		self.sourceFormula=self.getAttrVal("sourceformula");
		self.whereCondition=self.getAttrVal("where",undefined,false);
		self.initialize();
	}
	processSourceArrayElements(){
		var self=this;
		var elemsInForEach;
		if (self.source!=""){
			var sAux=self.source;
			var arrAux=sAux.split(",");
			sAux="";
			for (var i=0;i<arrAux.length;i++){
				if (i>0){
					sAux+=",";
				}
				sAux+='"'+arrAux[i]+'"';
			}
			sAux="["+sAux+"]";
			elemsInForEach=JSON.parse(sAux);
		} else if (self.sourceJson!=""){
			var fncAdjustText=function(sText,search,replace){
				var sAux=sText;
				while (sAux.indexOf(search)>=0){
					sAux=replaceAll(sAux,search,replace);
				}
				return sAux;
			}
			self.sourceJson=fncAdjustText(self.sourceJson,'\t','');
			self.sourceJson=fncAdjustText(self.sourceJson,'\n','');
			self.sourceJson=fncAdjustText(self.sourceJson,'\r','');
			self.sourceJson=fncAdjustText(self.sourceJson,String.fromCharCode(160),'');
			self.sourceJson=fncAdjustText(self.sourceJson,' ,',',');
			self.sourceJson=fncAdjustText(self.sourceJson,', ',',');
			self.sourceJson=fncAdjustText(self.sourceJson,"'",'"');
			self.sourceJson=fncAdjustText(self.sourceJson,'" ','"');
			self.sourceJson=fncAdjustText(self.sourceJson,' "','"');
			elemsInForEach=JSON.parse(self.sourceJson);
		} else if (self.sourceFormula!=""){
			var sAux=self.replaceVars(self.sourceFormula);
			sAux=replaceAll(sAux,";",",");
			sAux=replaceAll(sAux,"'",'"');
			elemsInForEach=self.replaceVarsAndExecute(sAux);
		} else if (self.sourceJS!=""){
			elemsInForEach=self.sourceJS;
		}
		return elemsInForEach;
	}
	getElementsInForEach(){
		var self=this;
		if (self.type=="root"){
			return self.model.report.childs;
		} else if (self.type=="child"){
			return self.reportElem.getChilds();
		} else if (self.type=="advchild"){
			return self.reportElem.getAdvanceChilds();
		} else if (self.type=="array"){
			log("Proccessing array");
			var elemsInForEach=self.processSourceArrayElements();
			var hsAux=newHashMap();
			for (var i=0;i<elemsInForEach.length;i++){
				hsAux.push(elemsInForEach[i]);
			}
			return hsAux;
		} else if (self.type=="list"){
			log("Proccessing array");
			var elemsInForEach=self.processSourceArrayElements();
			if (Array.isArray(elemsInForEach)){
				var hsAux=newHashMap();
				for (var i=0;i<elemsInForEach.length;i++){
					hsAux.push(elemsInForEach[i]);
				}
				return hsAux;
			} 
			return elemsInForEach;
		}
		return newHashMap();
	}
	filter(elemsInForEach){
		var self=this;
		if (self.whereCondition=="") return elemsInForEach;
		debugger;
		var hsResult=newHashMap();
		elemsInForEach.walk(function(eachElem,deep,key){
			var sWhere=self.replaceVars(self.whereCondition);
			bWhereResult=self.replaceVarsAndExecute(sWhere);
			if (bWhereResult){
				hsResult.add(key,eachElem);
			}
		});
		return hsResult;
	}
	
	apply(){
		var self=this;
		var bAllRoots=false;
		if (self.reportElem==self.model.report){
			bAllRoots=true;
		}
		var elemsInForEach=self.getElementsInForEach();
		elemsInForEach=self.filter(elemsInForEach);
		
//		var nItem=0;
		var rootBackUp=self.model.processingRoot;
		// counting total elements
		elemsInForEach.walk(function(eachElem){
			var newParent;
			var processedItemNumber=0;
			var processedItemJumped=0;
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
				processedItemNumber++;
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

