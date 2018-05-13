var jrfForEach=class jrfForEach{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		var self=this;
		model.extendToken(self,tag,reportElem);
		self.autoAddPostHtml=false;
		self.type=self.getAttrVal("type");
		self.subType=self.getAttrVal("subtype");
		self.where=self.getAttrVal("where");
		self.processedItemNumber=0;
		self.innerVarName=self.getAttrVal("as").trim();
		self.source=self.getAttrVal("source").trim();
		self.sourceJson=self.getAttrVal("sourcejson").trim();
		self.sourceFormula=self.getAttrVal("sourceFormula").trim();
		self.whereCondition=self.getAttrVal("where").trim();

		if (self.type=="root"){
			self.elemsInForEach=self.model.report.childs;
		} else if (self.type=="child"){
			self.elemsInForEach=self.reportElem.getChilds();
		} else if (self.type=="advchild"){
			self.elemsInForEach=self.reportElem.getAdvanceChilds();
		} else if (self.type=="array"){
			log("Proccessing array");
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
		if (self.type=="array"){
			// getting array from source, sourcejson, sourceformula
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
				self.elemsInForEach=JSON.parse(sAux);
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
				self.elemsInForEach=JSON.parse(self.sourceJson);
			} else if (self.sourceFormula!=""){
				var sAux=self.replaceVars(self.sourceFormula);
				self.elemsInForEach=self.replaceVarsAndExecute(sAux);
			}
			var hsAux=newHashMap();
			for (var i=0;i<self.elemsInForEach.length;i++){
				hsAux.push(self.elemsInForEach[i]);
			}
			self.elemsInForEach=hsAux;
		}
		
//		var nItem=0;
		var rootBackUp=self.model.processingRoot;
		
		self.elemsInForEach.walk(function(eachElem){
			var newParent;
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
				var bWhereResult=true;
				if (self.whereCondition!=""){
					var sWhere=self.replaceVars(self.whereCondition);
					bWhereResult=self.replaceVarsAndExecute(sWhere);
				}
				if (bWhereResult){
					self.processAllChilds(self.tag.getChilds(),newParent);
				} else {
					self.continueTask();
				}
			});
			self.addStep("Continue...",function(){
				if (bAllRoots) self.model.processingRoot=rootBackUp;
				self.addPostHtml();
				if ((self.subType=="row")&&(self.processedItemNumber==(self.elemsInForEach.length-1))){
					self.addHtml("</td></tr><tr><td>");
				}
				self.addHtml("<!-- END INNER LOOP OF ITEM "+ (self.processedItemNumber) + " IN FOREACH JRF TOKEN -->");
				self.processedItemNumber++;
				self.continueTask();
			});
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

