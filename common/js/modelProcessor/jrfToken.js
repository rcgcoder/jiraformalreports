var TokenFunctionCalls=0;
var TokenFunctionCallsCached=0;
var jrfToken=class jrfToken{ //this kind of definition allows to hot-reload
	loadOwnProperties(){
  		
	}
	constructor(tag,reportElem,model){
		var self=this;
		self.model=model;
		System.webapp.getTaskManager().extendObject(self);
		self.extendObj(self,tag,reportElem);
	}
	extendObj(obj,tag,reportElem){
		var self=this;
		obj.tokenName=obj.constructor.name;
		obj.model=self.model;
		obj.tag=tag;
		tag.token=obj;
		obj.reportElem=reportElem;
		obj.variables=self.model.variables;
		obj.changeBrackets=self.changeBrackets;
		obj.indStartTokenHtmlBuffer=0;
		obj.indPreviosContentHtmlBuffer=0;
		obj.indInnerContentHtmlBuffer=0;
		obj.indPostContentHtmlBuffer=0;
		obj.initVarsLevel=obj.getAttrVal("initVarLevel",reportElem,false);
		obj.initVars=obj.getAttrVal("initVar",reportElem,false);
		obj.initVarsReuse=obj.getAttrVal("initVarReuse",reportElem,false);
		obj.pushVars=obj.getAttrVal("pushVar",reportElem,false);
		obj.setVars=obj.getAttrVal("setVar",reportElem,false);
		obj.inFormat=obj.getAttrVal("informat");
		obj.outFormat=obj.getAttrVal("format");
		obj.ifCondition=obj.getAttrVal("if",reportElem,false);
		obj.processOrder=obj.getAttrVal("processOrder");
		obj.visibility=obj.getAttrVal("visibility",reportElem,false);
		obj.datetimeSource=obj.getAttrVal("atDateTime",reportElem,false);
		obj.postProcess=obj.getAttrVal("postprocess");
		obj.activateVar=obj.getAttrVal("activate");
		obj.consolidateHtml=obj.getAttrVal("consolidateResult");
		if (obj.consolidateHtml=="") {
			obj.consolidateHtml=false;
		} else {
			obj.consolidateHtml=(obj.consolidateHtml.saToString().trim().toLowerCase()=="true");
		}
		obj.activeVar;
		obj.datetime=undefined;
		obj.moreParams=obj.getAttrVal("aditionalparameters",reportElem,false);
		obj.otherParams=newHashMap();
		obj.ifConditionResult=true;
		obj.autoAddPostHtml=true;
		obj.loadOwnProperties();
		obj.pushClosureLevel=self.pushClosureLevel;
		obj.popClosureLevel=self.popClosureLevel;
		obj.getClosureLevel=self.getClosureLevel;
	}
	pushClosureLevel(){
		var self=this;
		var hsLevels=self.variables.getVars("ClosureLevel");
		self.variables.pushVar("ClosureLevel",self.variables.localVars.length()-1 );
	}
	popClosureLevel(){
		var self=this;
		var hsLevels=self.variables.getVars("ClosureLevel");
		var iAct=hsLevels.pop();
	}
	getClosureLevel(iLevelRef){
		var self=this;
		var hsLevels=self.variables.getVars("ClosureLevel");
		var iAct;
		if (isUndefined(iLevelRef)){
			iAct=hsLevels.top();
		} else if ((iLevelRef>=0)&&(iLevelRef<hsLevels.length())){
			iAct=hsLevels.findByInd(iLevelRef);
		} else if ((iLevelRef<0)&&(Math.abs(iLevelRef)<hsLevels.length())){
			iAct=hsLevels.findByInd((hsLevels.length()-1)+iLevelRef);
		} else {
			iAct=hsLevels.top();
			log("The closure level "+iLevelRef+ " is out of bounds ["+(-1*(hsLevels.length()-1))+","+(hsLevels.length()-1)+"]. Using top level "+iAct);
		}
		return iAct;
	}
	
	pushHtmlBuffer(){return this.model.pushHtmlBuffer();};
	popHtmlBuffer(index){return this.model.popHtmlBuffer(index);};
	topHtmlBuffer(index){return this.model.topHtmlBuffer(index);};
	getHtmlBuffer(){return this.model.html;};
	addHtml(sHtml){this.model.addHtml(sHtml);};
	processAllChilds(childList,reportElement){
		var self=this;
		var sKey="";
		var auxRptElem=reportElement;
		if (isUndefined(auxRptElem)){
			if (isDefined(self.activeVar)){
				auxRptElem=self.activeVar;
			} else {
				auxRptElem=self.reportElem;
			}
		}
		var auxList=childList;
		if (isUndefined(auxList)){
			auxList=self.tag.getChilds();
		}
		var nChildWalker=0;
		var stackLastProcess=[];

		auxList.walk(function(childTag){
			var htmlBufferIndex=self.pushHtmlBuffer();

			var tagApplier=self.model.prepareTag(childTag,auxRptElem);
			if (tagApplier.processOrder.toLowerCase()==="last"){
				self.addStep("Post Processing Child....."+sKey,function(){
					var postHtmlBufferIndex=self.pushHtmlBuffer();
					stackLastProcess.push({tagApplier:tagApplier,htmlBufferIndex:postHtmlBufferIndex});
					self.continueTask();
				});
			} else {
				self.addStep("Processing Child..."+sKey,function(){
					tagApplier.encode();
//					self.model.applyTag(childTag,auxRptElem);
				});
			}
			nChildWalker++;
		});
		self.addStep("Processing last processOrder tags",function(){
			while(stackLastProcess.length>0){
				//debugger;
				var objTag=stackLastProcess.pop();
				var tagApplier=objTag.tagApplier;
				var htmlBufferIndex=objTag.htmlBufferIndex;
				// backup the rest of htmlbuffer
				var htmlBufferBackup=self.popHtmlBuffer(htmlBufferIndex);
				self.addStep("Processing Child..."+sKey,function(){
					tagApplier.encode();
//					self.model.applyTag(childTag,auxRptElem);
				});
				self.addStep("Pusshing the saved rest of html buffer ..."+sKey,function(){
					var htmlBufferIndex=self.pushHtmlBuffer();
					self.addHtml(htmlBufferBackup);
					self.continueTask();
				});
			}
			self.continueTask();
		});
		self.continueTask();
	}
	changeBrackets(sText){
		var sResult=replaceAll(sText,"{{{","{ { {");
		sResult=replaceAll(sResult,"}}}","} } }");
		sResult=replaceAll(sResult,"{{","{ {");
		sResult=replaceAll(sResult,"}}","} }");
		return sResult;
	}

	encode(){
		var self=this;

/*		obj.indStartTokenHtmlBuffer=0;
		obj.indPreviosContentHtmlBuffer=0;
		obj.indInnerContentHtmlBuffer=0;
		obj.indPostContentHtmlBuffer=0;
*/		
		
		
		self.indStartTokenHtmlBuffer=self.pushHtmlBuffer();
		//log(self.topHtmlBuffer(self.indHtmlBuffer-2));
		if (self.model.report.config.htmlDebug){
			self.addHtml("<!-- " + self.changeBrackets(self.tag.getTagText())+" -->");
			self.addHtml("<!-- " + self.changeBrackets(self.model.traceTag(self.tag))+ " -->");
		}

		self.addStep("Pre-Encode part...",function(){
			self.variables.pushVarEnv();
			self.pushClosureLevel();
			self.indPreviosContentHtmlBuffer=self.pushHtmlBuffer();
			if (self.model.report.config.htmlDebug) self.addHtml("<!-- START PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
			self.addHtml(self.tag.getPreviousHTML());
			if (self.model.report.config.htmlDebug) self.addHtml("<!-- END PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
			self.indInnerContentHtmlBuffer=self.pushHtmlBuffer();
			self.startApplyToken();
			self.continueTask();
		});
		self.addStep("Encode part...",function(){
			if (self.ifConditionResult){
				//log(self.topHtmlBuffer(self.indHtmlBuffer-2));
				self.apply(); // the apply function not returns anything... only writes text to buffer
				//log(self.topHtmlBuffer(self.indHtmlBuffer-2));
			}
			self.continueTask();
		});
		self.addStep("Post-Encode part...",function(){
			//log(self.topHtmlBuffer(self.indHtmlBuffer-2));
			//debugger;
			self.endApplyToken();
			self.continueTask();
		});
		self.addStep("PostProcess all token and return...",function(){
			self.popClosureLevel();
			self.variables.popVarEnv();
			self.continueTask();
		});
		self.continueTask();
	}
	initVariables(sVarsInit,sVarsReuse,defaultValue){
		var self=this;
		var vDefValue="empty";
		if (isDefined(defaultValue)) vDefValue=defaultValue;
		var nVarsLevel;
		var bDefinedLevel=false;
		if (isDefined(self.initVarsLevel)&&(self.initVarsLevel!="")){
			//debugger;
			var vAux=self.replaceVars(self.initVarsLevel).saToString().trim();
			if ($.isNumeric(vAux)){
				nVarsLevel=Math.floor(parseFloat(vAux));
				nVarsLevel=self.getClosureLevel(nVarsLevel);
			} else if (vAux.toLowerCase()=="global") {
				nVarsLevel=0;
			}
		}
		
		if (isDefined(sVarsInit)&&(sVarsInit!="")){
			var arrVars=sVarsInit.split(",");
			for (var i=0;i<arrVars.length;i++){
				var vActualVar=arrVars[i];
				vActualVar=replaceAll(vActualVar,"==","equalThan");
				var arrVarParts=vActualVar.split("=");
				arrVarParts.forEach(function(sValue,index){
					arrVarParts[index]=replaceAll(sValue,"equalThan","==");
				});
				var varName=arrVarParts[0].trim();
				varName=self.replaceVars(varName).saToString().trim();
				self.variables.initVar(varName,nVarsLevel);
				var vValue=vDefValue;
				if (arrVarParts.length>1){
					vValue=arrVarParts[1];
				}
				if (isString(vValue)||(isArray(vValue))){
					var sFormula=vValue.saToString().trim();
					if ((sFormula.indexOf("{{{")==0)&&(sFormula.indexOf("}}}")==(sFormula.length-3))){
						sFormula=sFormula.substring(3,sFormula.length-3);
						vValue=self.replaceVarsAndExecute(sFormula);
					} else {
						vValue=self.replaceVars(sFormula).saToString().trim();
					}
				}
				self.variables.setVar(varName,vValue);
				log("Initialized Value ["+varName+"] with value ["+vValue+"]"+ (isDefined(nVarsLevel)?" at level"+nVarsLevel:""));
			}
		}
		if (isDefined(sVarsReuse)&&(sVarsReuse!="")){
			//debugger;
			var arrVars=sVarsReuse.split(",");
			for (var i=0;i<arrVars.length;i++){
				var vActualVar=arrVars[i];
				vActualVar=replaceAll(vActualVar,"==","equalThan");
				var arrVarParts=vActualVar.split("=");
				arrVarParts.forEach(function(sValue,index){
					arrVarParts[index]=replaceAll(sValue,"equalThan","==");
				});
				var varName=arrVarParts[0].trim();
				varName=self.replaceVars(varName).saToString().trim();
				if (self.variables.getVars(varName)==""){ // the variable does not exists
					self.variables.initVar(varName,nVarsLevel);
		
					
					var vValue=vDefValue;
					if (arrVarParts.length>1){
						vValue=arrVarParts[1];
					}
					if (isString(vValue)||(isArray(vValue))){
						var sFormula=vValue.saToString().trim();
						if ((sFormula.indexOf("{{{")==0)&&(sFormula.indexOf("}}}")==(sFormula.length-3))){
							sFormula=sFormula.substring(3,sFormula.length-3);
							vValue=self.replaceVarsAndExecute(sFormula);
						} else {
							vValue=self.replaceVars(sFormula).saToString().trim();
						}
					}
					self.variables.setVar(varName,vValue);
				};
				var actValue=self.variables.getVar(varName);
				log("Initialized reusing Value ["+varName+"] with value ["+vValue+"], actual value["+actValue+"]");
			}
		}
		
	}
	
	applyInitVars(){
		var self=this;
		self.initVariables(self.initVars,self.initVarsReuse);
	}
	applySetVars(sValAux){
		var self=this;
		
		log(self.tokenName+" - Apply Set Vars:<"+self.setVars+">");
//		var sValAux=self.getHtmlBuffer();
		
		if (self.setVars!=""){ 
			var arrVars=self.setVars.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=self.replaceVars(arrVarParts[0].trim());
				var varValue;
				if (arrVarParts.length>1){
					varValue=self.replaceVars(arrVarParts[1]);
				} else {
					varValue=sValAux;
				}
				//if (isString(varValue)||isArray(varValue)) varValue=varValue.saRemoveInnerHtmlTags();

				log("Looking for Value ["+varName+"] to set:["+varValue+"]");
				var vVar=self.variables.getVars(varName);
				try {
				    log(varName+" Variable Stack Elements:"+vVar.length());
				}
				catch(err) {
					loggerFactory.getLogger().enabled=true
					log(varName+" Error retrieving variable:["+varName+"]... trying again launch exception to debug");
					loggerFactory.getLogger().enabled=false;
					vVar=self.variables.getVars(varName);
				}
				
				if (vVar.length()>0){// replace as a pop/push
					vVar.pop();
				}
			    log(varName+" Popped --- Variable Stack Elements:"+vVar.length());
				vVar.push(varValue);
			    log(varName+" Pusshed:"+varValue +" --- Variable Stack Elements:"+vVar.length());

				log("Value ["+varName+"] setted:["+varValue+"] -- get ["+self.variables.getVar(varName)+"]");
			}
		}
		return sValAux;
	}
	applyPushVars(sValAux){
		var self=this;
//		var sValAux=self.getHtmlBuffer();
		if (self.pushVars!=""){
			var arrVars=self.pushVars.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=self.replaceVars(arrVarParts[0].trim());
				varName=varName.saToString();
				var varValue;
				if (arrVarParts.length>1){
					varValue=self.replaceVars(arrVarParts[1]);
				} else {
					varValue=sValAux;
				}
				if (isString(varValue)||isArray(varValue)) {
					//varValue=varValue.saRemoveInnerHtmlTags();
					varValue=varValue.saToString();
				}
				log("Looking for Value ["+varName+"] pushed:["+varValue+"]");
				var vVar=self.variables.getVars(varName);
				if (vVar==""){
					logError("The var ["+varName+"] ("+arrVarParts[0].trim()+") does not exists check the model");
					// repeat the search();
					vVar=self.variables.getVars(varName);
				}
				vVar.push(varValue);
				log("Value ["+varName+"] pushed:["+varValue+"]");
			}
		}
		return sValAux;
	}
	startApplyToken(){
		var self=this;
//		//self.indTokenHtmlBuffer=self.pushHtmlBuffer();
		// process the if parameter 
		self.applyIfCondition();
		if (self.ifConditionResult){
			var auxDateTime;
			if (self.datetimeSource!=""){
				var auxDtSource=self.datetimeSource
				if (isString(auxDtSource)||(isArray(auxDtSource))){
					//debugger;
					auxDtSource=self.replaceVarsAndExecute(auxDtSource);
				}
				if ((typeof auxDtSource==="object")&&(auxDtSource.constructor.name=="Date")){
					auxDateTime=auxDtSource;
				} else {
					auxDateTime=toDateNormalDDMMYYYYHHMMSS(auxDtSource);
					//self.dateTimeSource=auxDateTime;
				}
				self.datetime=auxDateTime;
			}
			var hsParams=self.otherParams;
			hsParams.clear();
			hsParams.add("model",self.model);
			if (self.moreParams!=""){
				var splitParams=self.moreParams.split(",");
				splitParams.forEach(function(aParam){
					var paramParts=aParam.split("=");
					var paramName=paramParts[0].trim();
					//debugger;
					paramName=self.replaceVars(paramName,undefined,true);
					paramName=paramName.saToString().trim();
					var paramValue=undefined;
					if (paramParts.length>1){
						paramValue=paramParts[1].trim();
						paramValue=self.replaceVars(paramValue,undefined,true);
						paramValue=paramValue.saToString().trim();
					}
					hsParams.add(paramName,paramValue);
				});
			}
			self.applyInitVars();
			if (self.activateVar!=""){
				//debugger;
				self.activeVar=self.variables.getVar(self.activateVar.saToString().trim());
			}
		}
	}
	endApplyToken(){
		var self=this;
		var sAux="";
		if (self.ifConditionResult){
			if (self.autoAddPostHtml){
				self.indPostContentHtmlBuffer=self.pushHtmlBuffer();
				self.addPostHtml();
			}
//			var sContentDebug=self.topHtmlBuffer(self.indInnerContentHtmlBuffer).saToString();
//			if (self.postProcess==""){
				var sContent=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
				sContent=self.replaceVars(sContent,undefined,true);
				self.addHtml(sContent);
/*			} else if (self.postProcess=="false"){
//				debugger;
				if (self.tag.countParentsChild()>0){
					var hsParents=self.tag.getListParentsChild();
					var fncChangePostProcess=function(theParentTag){
						theParentTag.token.postProcess="false";
						if (theParentTag.countParentsChild()>0){
							var hsParentsAux=theParentTag.getListParentsChild();
							hsParentsAux.walk(fncChangePostProcess);
						}
					}
					hsParents.walk(fncChangePostProcess);
				}
			}
			*/
//			loggerFactory.getLogger().enabled=false;
			var sValAux=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
			//self.indTokenHtmlBuffer=self.pushHtmlBuffer();

			sValAux=self.applyInFormat(sValAux);
			sValAux=self.applySetVars(sValAux);
			sValAux=self.applyPushVars(sValAux);
			sValAux=self.applyOutFormat(sValAux);
//			sAux=self.popHtmlBuffer();
//			self.addHtml(sAux);
			self.addHtml(sValAux);		
//		} else {
//			sAux=self.popHtmlBuffer();
//			self.addHtml(sAux);
		}
		if (self.visibility!=""){
			var visiType=self.replaceVars(self.visibility,undefined,true);
			visiType=visiType.saToString().split("=");
			var visiParams="";
			if (visiType.length>1){
				visiParams=visiType[1].split(":");
			}
			visiType=visiType[0].toLowerCase();
			if (visiType=="hidden"){
				var sHtml=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
				//self.indTokenHtmlBuffer=self.pushHtmlBuffer();
				//sHtml=self.replaceVars(sHtml);
				self.addHtml("");
			} else if ((visiType=="hideable")
					||(visiType=="openwindow")){
				//debugger;
				var sHtml=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
				//self.indTokenHtmlBuffer=self.pushHtmlBuffer();
				//sHtml=self.replaceVars(sHtml);
				var newId=modelInteractiveFunctions.addInteractiveContent(sHtml);
				var capHidden="Show";
				var capShowed="Hide";
				if (visiParams!=""){
					capHidden=visiParams[0];
					if (visiParams.length==2){
						capShowed=visiParams[1];
					} else {
						capShowed="Hide "+capHidden;
					}
				}
				var btnId="btn"+(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
				var theEvent="modelInteractiveFunctions.elemShowHide('"+newId+"',window,'"+btnId+"','"+capHidden+"','"+capShowed+"')";
				var withDiv=true;
				if (visiType=="openwindow"){
					theEvent="modelInteractiveFunctions.openNewWindow('"+newId+"',window,'"+btnId+"','"+capHidden+"','"+capShowed+"')";
					withDiv=false;
				} 
				if (self.model.report.config.interactiveResult){
					self.addHtml('<button id="'+btnId+'" onclick="'+theEvent+'">'+capHidden+'</button>');
					if (withDiv){
						self.addHtml('<div id="'+newId+'" style="display: none"></div>');
					}
				}
			}
		}
		if (self.consolidateHtml){
			var sHtml=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
			sHtml=sHtml.saToString();
			if (sHtml!="") self.addHtml(sHtml);
		}

	}
	addPostHtml(){
		var self=this;
		//debugger;
		if (self.model.report.config.htmlDebug) self.addHtml("<!-- START POSTHTML IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
		//self.addHtml(self.replaceVars(self.tag.getPostHTML()));
		self.addHtml(self.tag.getPostHTML());
		if (self.model.report.config.htmlDebug) self.addHtml("<!-- END POSTHTML  IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
	}
	adjustSyntax(sJsCode){
		var vAux=replaceAll(sJsCode,"greaterThan",">");
		vAux=replaceAll(vAux,"lessThan","<");
		vAux=replaceAll(vAux,"greaterOrEqualThan",">=");
		vAux=replaceAll(vAux,"lessOrEqualThan","<=");
		vAux=replaceAll(vAux,"equalThan","==");
		return vAux;
	}
	getAttrVal(attrName,objSrc,bReplaceVars,bExecuteIfExists){
		var self=this;
		var idAttr=attrName.toLowerCase();
		if (self.tag.getAttributes().exists(idAttr)){
			var attr=self.tag.getAttributeById(idAttr);
			if (isDefined(attr)){
				var vAux=attr.value;
				if (isUndefined(vAux)){
					vAux="";
				}
				vAux=self.adjustSyntax(vAux);
				//if (bExecuteIfExists) debugger;
				if (isDefined(bReplaceVars)&&(!bReplaceVars)){
					log ("not replace Vars");
				} else if (isDefined(bExecuteIfExists)&&(bExecuteIfExists)){
					vAux=self.replaceVarsAndExecute(vAux);
				} else {
					vAux=self.replaceVars(vAux);
				}
				if (isArray(vAux)){
					vAux=vAux.saTrim();
					while (vAux.saIndexOf("  ")>=0) vAux=replaceAll(vAux,"  "," ");
					vAux=vAux.saToString();
				}
				if (isString(vAux)) {
					vAux=vAux.trim();
					while (vAux.indexOf("  ")>=0) vAux=replaceAll(vAux,"  "," ");				
				} 
				return vAux;
			}
/*		} else if (self.model.report.allFieldNames.exists(idAttr)){
			var sNewId=self.model.report.allFieldNames.getValue(idAttr);
			return self.getAttrVal(sNewId);
*/		}
		return "";
	}
	applyIfCondition(){
		var self=this;
//		self.ifCondition=self.getAttrVal("if",self.reportElem,true,true);
		self.ifConditionResult=false;
		if (isBoolean(self.ifCondition)){
			//debugger;
			self.ifConditionResult=self.ifCondition;
		} else if (self.ifCondition==""){
			self.ifConditionResult=true;
		} else if (self.ifCondition!=""){
			var bProcessed;
			if (isString(self.ifCondition)||(isArray(self.ifCondition))){
				bProcessed=self.replaceVarsAndExecute(self.ifCondition);
			} else {
				bProcessed=self.ifCondition;
			}
			self.ifConditionResult=bProcessed;
			if (!bProcessed){
				log("If condition = false... avoiding tag");
			}
		}
	}
	
	applyInFormat(sValAux){
		var self=this;
		if (self.inFormat!=""){
//			var sFormats=self.replaceVars(self.inFormat);
			var arrFormats=self.inFormat.split(",");
			var sValue;
			arrFormats.forEach(function(sFormat){
				var arrParts=sFormat.split("=")
				var sFormatId=arrParts[0];
/*				if (sFormatId=="markdown"){
					sValAux=sValAux.wiki2html(); 
				} else 
*/				if (sFormatId=="fixed"){
					//debugger;
					sValue=self.replaceVars(sValAux);
					//sValue=sValue.saRemoveInnerHtmlTags();
					sValue=replaceAll(sValue,"\n"," ");
					sValue=sValue.saToString();
					if (sValue=="") return;
					var nDigits=2;
					if (arrParts.length>1){
						nDigits=arrParts[1];
					}
					var sFncFormula=`
						""; // to close the var result= instruction inserted by executefunction
						var value=_arrRefs_[0];
						var result=parseFloat(value).toFixed(`+nDigits+`);

						log("Parse done... the rest is return result")
						// execute function inserts the last ";" automatically
						`;
					sValAux=executeFunction([sValue],sFncFormula,self.model.functionCache);
				}  
			});
		}
		return sValAux;
//		self.addHtml(sValAux);
	}
	applyOutFormat(sValAux){
		var self=this;
//		var sValAux=self.popHtmlBuffer(self.indTokenHtmlBuffer);
//		//self.indTokenHtmlBuffer=self.pushHtmlBuffer();
		if (self.outFormat!=""){
			var arrFormats=self.outFormat.split(",");
			var sFormat;
			for (var i=0;i<arrFormats.length;i++){
				sFormat=arrFormats[i];
				if (sFormat=="money"){
					var sValAdjusted=replaceAll(sValAux,",",".");
					sValAdjusted=sValAdjusted.saToString();
					sValAux=inEuros(sValAdjusted,true); 
				} else if (sFormat=="hours"){
					var sValAdjusted=replaceAll(sValAux,",",".");
					sValAdjusted=sValAdjusted.saToString();
					sValAux=normalFormatNumber(sValAdjusted) + " h"; 
				} else if (sFormat=="SecondsToHours"){
					var floatVal=parseFloat(sValAux);
					floatVal=(floatVal/(60*60)).toFixed(2);
					var sValAdjusted=replaceAll(floatVal+"",",",".");
					sValAdjusted=sValAdjusted.saToString();
					sValAux=normalFormatNumber(sValAdjusted) + " h"; 
				} else if (sFormat=="%"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAdjusted=sValAdjusted.saToString();
					sValAux=normalFormatNumber(sValAdjusted) + " %"; 
				} else if (sFormat=="date"){
					var sValAdjusted=sValAux.saToString().trim();
					var dtAux=new Date(sValAdjusted);
					sValAux=formatDate(dtAux,4); 
				} else if (sFormat.toLowerCase().indexOf("fixed")>=0) {
					var sValue=self.replaceVars(sValAux);
					//sValue=sValue.saRemoveInnerHtmlTags();
					sValue=sValue.saToString();
					sValue=sValue.trim();
					if (!isDate(sValue)){
						var arrParts=sFormat.split("=");
						var nDigits=0;
						if (arrParts.length>1){
							nDigits=parseInt(arrParts[1]);
						}
						sValue=replaceAll(sValue+"","\n"," ");
						sValue=replaceAll(sValue,",",".");
						sValue=sValue.saToString();
						if ($.isNumeric(sValue)){
							sValue=Math.round(parseFloat(sValue),nDigits);
//						} else {
//							
						}						
						sValAux=sValue; 
					}
				}
			}
		}
//		self.addHtml(sValAux);
		return sValAux;
	}
	newReplaceParams(inOtherParams){
		var self=this;
		var otherParams;
		if (isDefined(inOtherParams)){
			otherParams=inOtherParams;
		} else {
			otherParams={
				hsValues:newHashMap(),
				vValues:[],
				self:self,
				bReplaceVars:false,
				bInExecution:false
			};
		}
		return otherParams;
	}
	replaceVarsAndExecute(sText){
		//debugger;
		var self=this;
		var otherParams=self.newReplaceParams();
//		var sFncBody=self.replaceVars(sText,otherParams);
		var vValue=self.getStringReplacedScript(sText,otherParams);// executeFunction(otherParams.vValues,sFncBody,self.model.functionCache);
		return vValue;
	}
	replaceVars(sText,inOtherParams,bReplaceVars){
		var self=this;
//		var sTextToLog=sText.saRemoveInnerHtmlTags().saTrim().saToString();
		//if (sTextToLog=="{{ AST_HHAccumFaseImplementacion }} + {{  AST_HHDespliegue }}"){
			//debugger;
		//}
//		log("Replace Vars of:"+sTextToLog);
	//	debugger;
		var iReplaced=0;
		var otherParams=self.newReplaceParams(inOtherParams);
		if (isDefined(bReplaceVars)){
			otherParams.bReplaceVars=bReplaceVars;
		}
		var sResult=sText;
		if (sResult.saExists("{{{")){
			//debugger;
			var bAntReplaceVars=otherParams.bReplaceVars;
			var bAntInExecution=otherParams.bInExecution;
			otherParams.bReplaceVars=false;
			otherParams.bInExecution=true;
			sResult=self.replaceVarsComplexArray(sResult,"{{{","}}}",otherParams,self.getStringReplacedScript);
			otherParams.bReplaceVars=bAntReplaceVars;
			otherParams.bInExecution=bAntInExecution;
			
//			sTextToLog=sTextToLog.substring(0,15)+"..." + " -> " + sResult.saToString();
//			log("Fase 0 Replaced {{{ }}} result:"+sTextToLog);
		}
//		log(sResult);
//		log("now let´s replace {{  "+sResult+"  }}");
		if (sResult.saExists("{{")){
			//debugger; 
/*			var bReplaceAnt=
			if (isUndefined(inOtherParams)){
				otherParams.bReplaceVars=true;
			}
*/			sResult=self.replaceVarsComplexArray(sResult,"{{","}}",otherParams,self.getStringReplaced);
/*			if (oSimple.values.length>0){
				vValue=executeFunction(oSimple.values,vValue,self.model.functionCache);
			}
			var vAux=vValue;
			if (isString(vAux)||isArray(vAux)){
				vAux=vAux.saRemoveInnerHtmlTags().saTrim().saToString();
				vValue=vAux;
			} else if (isObject(vAux)) {
				vAux="Object of type:"+vValue.constructor.name;	
			}
			sTextToLog=sTextToLog.substring(0,15)+"..." + " -> " + vAux;
*/			
//			sTextToLog=sTextToLog.substring(0,15)+"..." + " -> " + sResult.saToString();
//			log("Fase 2  {{ }} Final Result:"+sTextToLog);
		}
		return sResult;
	}
	getStringReplacedScript(sText,otherParams){ //sText is {{{ sText }}} may have {{ }} items
		var arrInnerText;
		TokenFunctionCalls++;

		if (otherParams.vValues.length>8){
			debugger;
			logError("Too much variables in formula... something is wrong");
		}
		if (isString(sText)){
			arrInnerText=[sText];
		} else {
			arrInnerText=sText;
		}
//		var sInnerText=arrInnerText.saRemoveInnerHtmlTags(""); // remove inner tags
		var sInnerText=arrInnerText;
		var functionCache="";
		var theHash="";
		if (!sInnerText.saExists("{{{")){
			var sCacheText=sInnerText.saToString();
			var hash = sha256.create();
			hash.update(sCacheText);
			theHash=hash.hex();
			functionCache=otherParams.self.model.functionCache.getValue(theHash);
		}
		var auxValues=[];
		if (functionCache=="") {
			if ((sInnerText.saExists("{{"))){ // its valid for {{ and for  {{{
				sInnerText=otherParams.self.replaceVars(sInnerText,otherParams);
			}
			auxValues=otherParams.vValues.slice(); // copy the array
			functionCache={body:sInnerText,lastCall:"",vValues:auxValues,method:""};
			if (theHash!=""){
				otherParams.self.model.functionCache.add(theHash,functionCache);
			}
		} else {
			auxValues=functionCache.vValues;
			TokenFunctionCallsCached++;
		}
		if ((TokenFunctionCalls >0) && (TokenFunctionCalls % 1000 ==0)){
			logError("Calls:"+TokenFunctionCalls+" cached:"+TokenFunctionCallsCached+" percent:"+((TokenFunctionCallsCached/TokenFunctionCalls)*100).toFixed(2)+"%"
					 +" functions Cached:"+otherParams.self.model.functionCache.length()
					 +" Stack status"+(otherParams.self.model.htmlStack.saLength()/otherParams.self.model.htmlStack.length)+" chars per row "+otherParams.self.model.htmlStack.length);
		}
		var vValuesProcessed=[];
		var vValueAux;
		auxValues.forEach(function(vValue){
			if (isString(vValue)||isArray(vValue)){
				var varDetail=otherParams.self.extractNameAndDate(vValue);
				vValue=otherParams.self.variables.getVar(varDetail.name,varDetail.date);
				if (isArray(vValue)) vValue=vValue.saToString().trim();
				if ($.isNumeric(vValue)){
					vValue=parseFloat(vValue);
				}
			}
			vValuesProcessed.push(vValue);
		});
		var vValue=executeFunction(vValuesProcessed,functionCache,otherParams.self.model.functionCache);
		var hsFunctionCaches=otherParams.self.model.functionCache;
		var nSecsMax= (60*1000);
		var tsNow=(new Date).getTime();		
		if (isUndefined(hsFunctionCaches.lastClear)){
			hsFunctionCaches.lastClear=tsNow;
		} else if ((tsNow- hsFunctionCaches.lastClear)>nSecsMax) {
			//debugger;
			log("Removing Old Function Definitions:" + hsFunctionCaches.length());

			var hsClearHashes=newHashMap();
			hsFunctionCaches.walk(function(itmFunction,iDeep,sKey){
				if ((tsNow-itmFunction.lastCall)>nSecsMax) {
					hsClearHashes.add(sKey,sKey);
				}
			});
			hsClearHashes.walk(function(sKey){
				hsFunctionCaches.remove(sKey);
			});
			log("Removed " +hsClearHashes.length()+ "  Old Function Definitions. Stay in cache:" + hsFunctionCaches.length());
			hsFunctionCaches.lastClear=tsNow;
		}
		return vValue;
	}
	extractNameAndDate(sText){
		var self=this;
		var result={name:"",date:undefined};
		var findComma=sText.saIndexOf(",",false,true);
		var sVarName="";
		var atDatetime=undefined;
		if (!findComma.bLocated){
			sVarName=findComma.arrPrevious.saTrim();
		} else {
//			//debugger;
			sVarName=findComma.arrPrevious.saTrim();
			atDatetime=findComma.arrPosterior.saTrim();
			atDatetime=self.variables.getVar(atDatetime);
		}
		result.name=sVarName;
		result.date=atDatetime;
		return result;
	}
	getStringReplaced(sText,otherParams){
		var arrInnerText;
		if (isString(sText)){
			arrInnerText=[sText];
		} else {
			arrInnerText=sText;
		}
//		var sInnerText=arrInnerText.saRemoveInnerHtmlTags("").saToString().trim();
		var sInnerText=arrInnerText.saToString().trim();
		var sVarRef;
		var iVar;
		if (!otherParams.bReplaceVars){
			if (otherParams.hsValues.exists(sInnerText)){
				iVar=otherParams.hsValues.getValue(sInnerText);
			} else {
				otherParams.vValues.push(sInnerText);
				iVar=otherParams.vValues.length-1;
				otherParams.hsValues.add(sInnerText,iVar);
			}
			sVarRef="_arrRefs_["+iVar+"]";
		} else {
			var varDetail=otherParams.self.extractNameAndDate(sInnerText);
			var vInnerVarValue=otherParams.self.variables.getVar(varDetail.name,varDetail.date);
			if (isObject(vInnerVarValue)){
				if (otherParams.hsValues.exists(sInnerText)){
					iVar=otherParams.hsValues.getValue(sInnerText);
				} else {
					otherParams.vValues.push(vInnerVarValue);
					iVar=otherParams.vValues.length-1;
					otherParams.hsValues.add(sInnerText,iVar);
				}
				sVarRef="_arrRefs_["+iVar+"]";
			} else {
				sVarRef=vInnerVarValue;
			}
		}
		return sVarRef;
	}
	
	replaceVarsComplexArray(inText,theOpenTag,theCloseTag,otherParams,replaceFnc){
		var self=this;
		var bReplaceVars=true;
		var openTag="{{";
		var closeTag="}}";
		var sText="";
		if (isDefined(otherParams)){
			if (isDefined(otherParams.bReplaceVars)){
				bReplaceVars=otherParams.bReplaceVars;
			}
		}
		if (isDefined(theOpenTag)) openTag=theOpenTag;
		if (isDefined(theCloseTag)) closeTag=theCloseTag;
		if (isDefined(inText)){
			sText=inText;
			if (!isArray(sText)&&(!isString(sText))){
				sText=""+sText;
			} 
			if (isString(sText)){
				sText=[sText];
			}
		} else {
			log("You are using a undefined text.... this may be a big error!");
			sText=[""];
		}
		var objResult=sText.saReplaceInnerText(openTag,closeTag,replaceFnc,true,otherParams);
		return objResult.arrPrevious.concat(objResult.arrPosterior);
	}
}
