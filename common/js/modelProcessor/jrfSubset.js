var jrfSubset=class jrfSubset extends jrfToken{//this kind of definition allows to hot-reload
	loadOwnProperties(){
//		debugger;
		var self=this;
//		self.autoAddPostHtml=false;
		self.name=self.getAttrVal("name");
		self.nameRest=self.getAttrVal("nameRest");
		self.type=self.getAttrVal("type");
//		self.where=self.getAttrVal("where",undefined,false);
		self.innerVarName=self.getAttrVal("as",undefined,false);
		self.resultVarName=self.getAttrVal("resultvarname");
		self.restVarName=self.getAttrVal("restvarname");
		
		self.bWithRest=false;
		self.hsResult;
		self.hsRest;
		
		self.recursiveField=self.getAttrVal("recursivefield",undefined,false);
		
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
			if (isArray(self.sourceJson)) self.sourceJson=self.sourceJson.saToString();
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
	includeRecursiveElements(parent,recursiveField,childKeyFunctionName,hsActualValues){
		var self=this;
		var hsResults=newHashMap();
		if (isDefined(parent["get"+recursiveField+"s"])){
			hsResults=parent["get"+recursiveField+"s"]();
		}
		var vKey;
		var fncProcessChild=function(child){
			var vKey=child[childKeyFunctionName]();
			if (!hsActualValues.exists(vKey)){
				hsActualValues.add(vKey,child);
				self.includeRecursiveElements(child,recursiveField,childKeyFunctionName,hsActualValues);
			}
		}
		self.parallelizeProcess(hsResults,function(srcItem){
			if (isDynamicObject(srcItem)){
				srcItem.getFactory().workOnSteps(srcItem,fncProcessChild);
			} else {
				fncProcessChild(srcItem);
			}
		},1);
	}
	
	getElementsInForEach(){
		var self=this;
		var hsResults=newHashMap();
		if (self.type=="root"){
			hsResults = self.model.report.childs;
		} else if (self.type=="child"){
			hsResults = self.reportElem.getChilds();
		} else if (self.type=="advchild"){
			hsResults = self.reportElem.getAdvanceChilds();
		} else if (self.type=="array"){
			log("Proccessing array");
			//debugger;
			var elemsInForEach=self.processSourceArrayElements();
			var hsAux=newHashMap();
			for (var i=0;i<elemsInForEach.length;i++){
				hsAux.push(elemsInForEach[i]);
			}
			hsResults = hsAux;
		} else if (self.type=="list"){
			log("Proccessing list...HashMap");
			//debugger;
			var elemsInForEach=self.processSourceArrayElements();
			if (Array.isArray(elemsInForEach)){
				var hsAux=newHashMap();
				for (var i=0;i<elemsInForEach.length;i++){
					hsAux.push(elemsInForEach[i]);
				}
				hsResults = hsAux;
			} else {
				hsResults = elemsInForEach;
			}
		}
		if ((self.recursiveField!=="")&&(self.recursiveField!="empty")){
			var sRecurField=self.replaceVars(self.recursiveField).saToString().trim();
			if (sRecurField!=""){
				self.addStep("Recursive elements in subset",function(){
					self.listProcess(hsResults,function(item){
						self.includeRecursiveElements(item,sRecurField,"getKey",hsResults);
					},1);
				});
			}
		}
		return hsResults;
	}
	listProcess(listItems,fncProcess,nThreadsMax){
		var self=this;
		self.parallelizeProcess(listItems,function(srcItem,objCallResult,itemKey){
			if (isDynamicObject(srcItem)){
				srcItem.factory.workOnSteps(srcItem,function(item){
					fncProcess(item,0,item.id);
				});
			} else {
				fncProcess(srcItem,0,itemKey);
			}
		},nThreadsMax);
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
			self.addStep("Pushing variables environment",function(){
				self.variables.pushVarEnv();
			});
			var iCounter=0;
			var iSelectedCounter=0;
			sWhere=self.whereCondition;
			if (sWhere.indexOf("{{{")>=0){
				sWhere=self.replaceVars(sWhere).saToString().trim();
			}
			if (sWhere.indexOf("useFilter")>=0){
				//debugger;
				sWhere=self.model.filters.useFilter(sWhere);
			}
			sWhere=self.adjustSyntax(sWhere).saToString().trim();
			sWhere=`'';
				var `+self.innerVarName+`={{`+self.innerVarName+`}};
				var innerItem={{`+self.innerVarName+`}};
				result=` +sWhere;
			self.addStep("Efectively applying filter",function(){
				self.listProcess(elemsInForEach,function(eachElem,objResult,key){
					self.addStep("Initializing variables",function(){
						if (self.innerVarName!=""){
							self.initVariables(self.innerVarName,undefined,eachElem);
						}
						self.variables.pushVar("counter",iCounter);
						self.variables.pushVar("counter_selected",iSelectedCounter);
					});
					self.addStepMayRetry("Executing where clause","AsyncFieldException",function(){
						debugger;
						var bWhereResult=self.replaceVarsAndExecute(sWhere);
						return bWhereResult;
					});
					self.addStep("Processing Result and pop variables",function(bWhereResult){
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
				},1);
			});
			self.addStep("Poping variables environment and return",function(){
				self.variables.popVarEnv();
				return self.hsResult;
			});
		} else {
			self.hsResult=elemsInForEach;
		}
		return self.hsResult;
	}
	order(elemsInForEach){
		var self=this;
		if (self.orderFormula=="") {
			return elemsInForEach;
		}
		var hsResult=newHashMap();
		var arrElems=[];
		var sFormulaBody=self.replaceVars(self.orderFormula);
		var sFormulaBody=sFormulaBody.saToString();
		var sFncFormula=`
			""; // to close the var result= instruction inserted by executefunction
			var elemA=_arrRefs_[0];
			var elemB=_arrRefs_[1];
			`+sFormulaBody+`;
			`;
		var arrElems=elemsInForEach.toArray();
		var totalLength=arrElems.length;
		var workList=new Array(arrElems.length);

		var fncSelectItem=function(i,j){
			var itemI=arrElems[i];
			var itemJ=arrElems[j];
			if (isDynamicObject(itemI)){
				self.addStep("load item "+i,function(){
					itemI.fullLoad();
				});
			}
			if (isDynamicObject(itemJ)){
				self.addStep("load item "+j,function(){
					itemJ.fullLoad();
				});
			}
			self.addStep("Compare pair "+i+"/"+j,function(){
				if (arrElems[i].id!=itemI.id){
					throw "The item " + i + " is changed during comparison "+itemI.id+" --> "+ arrElems[i].id;
				}
				if (arrElems[j].id!=itemJ.id){
					throw "The item " + i + " is changed during comparison "+itemJ.id+" --> "+ arrElems[j].id;
				}
				var vValue=executeFunction([itemI,itemJ],sFncFormula);
				return vValue;
			});
			self.addStep("Unlock and return Result index",function(vValue){
				if (isDynamicObject(itemI)){
					itemI.unlock();
				}
				if (isDynamicObject(itemJ)){
					itemJ.unlock();
				}
				if (vValue<=0){
					return i;
				} else {
					return j;
				}
			});
		}
		self.addStep("Another Way to do a merge sort",function(){
			// preparing the cycles
			var blockWidths=[];
			var auxWidth=2;
			while (auxWidth<totalLength){
				blockWidths.push(auxWidth);
				auxWidth*=2;
			}
			self.parallelizeProcess(blockWidths,function(blockWidth){
				var nBlocks=Math.floor(totalLength/blockWidth);
				if ((nBlocks*blockWidth)<totalLength){
					nBlocks++;
				}
				self.parallelizeProcess(nBlocks,function(initIndex){
					var iStart=initIndex*blockWidth; //0           4         16
 					var iEnd=iStart+(blockWidth-1);  //3=0+4-1     7=4+4-1   23=16+8-1
					if ((iEnd+1)>totalLength){
						iEnd=(totalLength-1);
					}
					var nItems=(iEnd-iStart);
					if (nItems<=0){
						log("nothing to do.... only one item or none")
					} else if ((iEnd-iStart)==1){ // iEnd and iStart are index to process example elems[0] and elems[1]
						log("only compare 2 items");
						self.addStep("Comparing Items",function(){
							fncSelectItem(iStart,iEnd);
						});
						self.addStep("Comparing Items result",function(indexSelected){
							if (indexSelected==iEnd){
								var vAux=arrElems[iStart];
								arrElems[iStart]=arrElems[iEnd];
								arrElems[iEnd]=vAux;
							}
						});
					} else {// there are more than 2 items 4 8 16.... now 
						// identify 2 lists
						var iL1=iStart;  // bw = 4   0, 0+2-1  , 4 4+2-1  8 8+4-1 891011
						var jL1=iStart+(blockWidth/2)-1;
						var iL2=jL1+1; 
						var jL2=iEnd;
						var nL1=(jL1-iL1)+1;
						var nL2=(jL2-iL2)+1;
						var iWork=iL1;
						var fncContinue=function(){
							return (nL1>0)||(nL2>0);
						}
						self.loopProcess(fncContinue,function(){
							if ((nL1==0)||(nL2==0)) {
								if (nL2==0){
									var iAux=iWork;
									while(iAux<jL2){
										arrElems[iAux]=arrElems[iL1];
										iAux++;
										iL1++;
									}
								}
								var iAux=iStart;
								while(iAux<iWork){
									arrElems[iAux]=workList[iAux];
									iAux++;
								}
								nL1=0;
								nL2=0;
							} else {
								self.addStep("Comparing Items",function(){
									fncSelectItem(iL1,iL2);
								});
								self.addStep("Comparing Items result",function(indexSelected){
									if (indexSelected==iL1){
										workList[iWork]=arrElems[iL1];
										iWork++;
										iL1++;
										nL1--;
									} else if (indexSelected==iL2){
										workList[iWork]=arrElems[iL2];
										iWork++;
										iL2++;
										nL2--;
									}
								});
							}
						});
					}
				},10);
			},1);
			self.addStep("Preparing and Returning the result of sort",function(){
				var elemCounter=0;
				arrElems.forEach(function(elem){
					hsResult.push(elem);
					elemCounter++;
				});
				if (elemCounter!=totalLength){
					logError("Error in Sort.... the number of elements differs initial:"+totalLength+" final:"+elemCounter);
				}
				return hsResult;
			});
		});
	}
	bounds(elemsInForEach){
		var self=this;
//		var startAt=self.replaceVars(self.boundStartAt).saRemoveInnerHtmlTags().saToString().trim();
//		var limit=self.replaceVars(self.boundLimit).saRemoveInnerHtmlTags().saToString().trim();
		var startAt=self.replaceVars(self.boundStartAt).saToString().trim();
		var limit=self.replaceVars(self.boundLimit).saToString().trim();
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
	getElementsInSubset(){
		var self=this;
		var elemsInForEach;
		self.addStep("Retrieving bulk subset elements",function(){
			return self.getElementsInForEach();
		});
		self.addStep("Applying filter",function(elemsRetrieved){
			elemsInForEach=elemsRetrieved;
			elemsInForEach=self.filter(elemsInForEach);
			return elemsInForEach;
		});
		self.addStep("Applying Order",function(elemsFiltered){
			elemsInForEach=elemsFiltered;
			elemsInForEach=self.order(elemsInForEach);
			return elemsInForEach;
		});
		self.addStep("Applying Bounds and Return",function(elemsOrdered){
			elemsInForEach=elemsOrdered;
			elemsInForEach=self.bounds(elemsInForEach);
			return elemsInForEach;
		});
	}
	apply(){
		//debugger;
		var self=this;
		self.addStep("Getting elements for subset.", function(){
			self.getElementsInSubset();
		});
		self.addStep("Processing results",function(retrElements){
			var elemsInForEach=retrElements;
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
		});
	}

}

