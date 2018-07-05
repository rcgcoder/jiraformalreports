var jrfSubset=class jrfSubset extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
//		debugger;
		var self=this;
//		self.autoAddPostHtml=false;
		self.name=self.getAttrVal("name");
		self.nameRest=self.getAttrVal("nameRest");
		self.type=self.getAttrVal("type");
//		self.where=self.getAttrVal("where",undefined,false);
		self.innerVarName=self.getAttrVal("as",false);
		self.resultVarName=self.getAttrVal("resultvarname");
		self.restVarName=self.getAttrVal("restvarname");
		
		self.bWithRest=false;
		self.hsResult;
		self.hsRest;
		
		self.source=self.getAttrVal("source");
		self.sourceJson=self.getAttrVal("sourcejson");
		self.sourceJS=self.getAttrVal("sourcejs",undefined,false);
		self.sourceFormula=self.getAttrVal("sourceformula",undefined,false);
		
		self.whereCondition=self.getAttrVal("where",undefined,false);
		self.orderFormula=self.getAttrVal("order",undefined,false);
		self.boundStartAt=self.getAttrVal("start",undefined,false);
		self.boundLimit=self.getAttrVal("limit",undefined,false);
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
			self.sourceJson=replaceAll(self.sourceJson,'\t','');
			self.sourceJson=replaceAll(self.sourceJson,'\n','');
			self.sourceJson=replaceAll(self.sourceJson,'\r','');
			self.sourceJson=replaceAll(self.sourceJson,String.fromCharCode(160),'');
			self.sourceJson=replaceAll(self.sourceJson,' ,',',');
			self.sourceJson=replaceAll(self.sourceJson,', ',',');
			self.sourceJson=replaceAll(self.sourceJson,"'",'"');
			self.sourceJson=replaceAll(self.sourceJson,'" ','"');
			self.sourceJson=replaceAll(self.sourceJson,' "','"');
			if (isArray(self.sourceJson)) self.sourceJson=self.sourceJson.saToString()
			elemsInForEach=JSON.parse(self.sourceJson);
		} else if (self.sourceFormula!=""){
			var sAux=self.replaceVarsAndExecute(self.sourceFormula); // replace the name of variable for the value
			if (isString(sAux)||isArray(sAux)){
				sAux=replaceAll(sAux,";",",");
				sAux=replaceAll(sAux,"'",'"');
				elemsInForEach=self.replaceVarsAndExecute(sAux);
			} else {
				elemsInForEach=sAux;
			}
		} else if (self.sourceJS!=""){
			elemsInForEach=self.replaceVarsAndExecute(self.sourceJS);
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
			//debugger;
			var elemsInForEach=self.processSourceArrayElements();
			var hsAux=newHashMap();
			for (var i=0;i<elemsInForEach.length;i++){
				hsAux.push(elemsInForEach[i]);
			}
			return hsAux;
		} else if (self.type=="list"){
			log("Proccessing list...HashMap");
			//debugger;
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
		self.hsResult=newHashMap();
		if (isDefined(self.restVarName)&&(self.restVarName!="")){
			self.hsRest=newHashMap();
			self.bWithRest=true;
		}
		if (self.whereCondition!="") {
			//debugger;
			var sWhere="";
			var bWhereResult=false;
			self.variables.pushVarEnv();
			var iCounter=0;
			var iSelectedCounter=0;
			sWhere=self.whereCondition;
			if (sWhere.indexOf("useFilter")>=0){
				//debugger;
				sWhere=self.model.filters.useFilter(sWhere);
			}
			sWhere=self.adjustSyntax(sWhere);
			
			elemsInForEach.walk(function(eachElem,deep,key){
				if (self.innerVarName!=""){
					self.initVariables(self.innerVarName);
				}
				self.variables.pushVar("counter",iCounter);
				self.variables.pushVar("counter_selected",iSelectedCounter);
				bWhereResult=self.replaceVarsAndExecute(sWhere);
				if (bWhereResult){
					iSelectedCounter++;
					self.hsResult.add(key,eachElem);
				} else if (self.bWithRest){
					self.hsRest.add(key,eachElem);
				}
				self.variables.popVar("counter_selected");
				self.variables.popVar("counter");
				iCounter++;
				if (self.innerVarName!=""){
					self.variables.popVar(self.innerVarName);
				}
			});
			self.variables.popVarEnv();
		} else {
			self.hsResult=elemsInForEach;
		}

		return self.hsResult;
	}
	order(elemsInForEach){
		var self=this;
		if (self.orderFormula=="") return elemsInForEach;
		var hsResult=newHashMap();
		var arrElems=[];
		elemsInForEach.walk(function(elem){
			arrElems.push(elem);
		});
		var sFormulaBody=self.replaceVars(self.orderFormula);
		var sFormulaBody=sFormulaBody.saToString();
		var sFncFormula=`
			""; // to close the var result= instruction inserted by executefunction
			var elemA=_arrRefs_[0];
			var elemB=_arrRefs_[1];
			`+sFormulaBody+`;
			`;
		arrElems.sort(function(a,b){
			var vValue=executeFunction([a,b],sFncFormula);
			return vValue;
		});	
		arrElems.forEach(function(elem){
			hsResult.push(elem);
		});
		return hsResult;
	}
	bounds(elemsInForEach){
		var self=this;
		var startAt=self.boundStartAt;
		var limit=self.boundLimit;
		if ((startAt=="")&&(limit=="")) return elemsInForEach;
		var hsResult=newHashMap();
		if (startAt==""){
			startAt=0; 
		} else {
			startAt=parseInt(""+startAt);
		}
		if (limit==""){
			limit=-1; 
		} else {
			limit=parseInt(""+limit);
		}
		var counter=0;
		var iPos=0;
		elemsInForEach.walk(function(elem){
			if (iPos>=startAt){
				if ((limit<0)||(counter<limit)){
					hsResult.push(elem);
					counter++;
				}
			}
			iPos++;
		});
		return hsResult;
	}
	apply(){
//		debugger;
		var self=this;
		var elemsInForEach=self.getElementsInForEach();
		elemsInForEach=self.filter(elemsInForEach);
		elemsInForEach=self.order(elemsInForEach);
		elemsInForEach=self.bounds(elemsInForEach);
		if (self.name!="") elemsInForEach.name=self.name;
		var varName=self.resultVarName;
		if (varName!=""){
			self.variables.pushVar(varName,elemsInForEach,-1); //if variable does not exists... it puts in parent block
		}
		if (self.bWithRest){
			varName=self.restVarName;
			self.variables.pushVar(varName,self.hsRest,-1); //if variable does not exists... it puts in parent block
			
		}
		return elemsInForEach;
	}

}

