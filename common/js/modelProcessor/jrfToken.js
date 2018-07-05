var jrfToken=class jrfToken{ //this kind of definition allows to hot-reload
	loadOwnProperties(){
		
	}
	constructor(tag,reportElem,model){
		var self=this;
		//debugger;
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
		obj.initVars=obj.getAttrVal("initVar");
		obj.initVarsReuse=obj.getAttrVal("initVarReuse");
		obj.pushVars=obj.getAttrVal("pushVar");
		obj.setVars=obj.getAttrVal("setVar");
		obj.inFormat=obj.getAttrVal("informat");
		obj.outFormat=obj.getAttrVal("format");
		obj.ifCondition=obj.getAttrVal("if",reportElem,true,true);
		obj.processOrder=obj.getAttrVal("processOrder");
		obj.visibility=obj.getAttrVal("visibility");
		obj.datetimeSource=obj.getAttrVal("atDateTime",reportElem,true,true);
		obj.postProcess=obj.getAttrVal("postprocess");
		obj.datetime=undefined;
		obj.moreParams=obj.getAttrVal("aditionalparameters",reportElem,false);
		obj.otherParams=newHashMap();
		obj.ifConditionResult=true;
		obj.autoAddPostHtml=true;
		obj.loadOwnProperties();
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
			auxRptElem=self.reportElem;
		}
		if (isDefined(auxRptElem.getKey)){
			sKey=auxRptElem.getKey();
		}
		if (sKey=="NOTIFLOPD-120"){
			log("Review this");
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
				stackLastProcess.push({tagApplier:tagApplier,htmlBufferIndex:htmlBufferIndex});
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
			self.endApplyToken();
			self.continueTask();
		});
		self.addStep("PostProcess all token and return...",function(){
			self.variables.popVarEnv();
			self.continueTask();
		});
		self.continueTask();
	}
	
	applyInitVars(){
		var self=this;
		if (self.initVars!=""){
			var arrVars=self.initVars.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=arrVarParts[0].trim();
				self.variables.initVar(varName);
				var vValue="empty";
				if (arrVarParts.length>1){
					vValue=arrVarParts[1];
					self.variables.setVar(varName,vValue);
				}
				log("Initialized Value ["+varName+"] with value ["+vValue+"]");
			}
		}
		if (self.initVarsReuse!=""){
			var arrVars=self.initVarsReuse.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=arrVarParts[0].trim();
				if (self.variables.getVars(varName)==""){ // the variable does not exists
					self.variables.initVar(varName);
				};
				var vValue="empty";
				if (arrVarParts.length>1){
					vValue=arrVarParts[1];
					self.variables.pushVar(varName,vValue);
				}
				var actValue=self.variables.getVar(varName);
				log("Initialized reusing Value ["+varName+"] with value ["+vValue+"], actual value["+actValue+"]");
			}
		}
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
				if (isString(varValue)||isArray(varValue)) varValue=varValue.saRemoveInnerHtmlTags();

				log("Looking for Value ["+varName+"] to set:["+varValue+"]");
				var vVar=self.variables.getVars(varName);
				try {
				    log(varName+" Variable Stack Elements:"+vVar.length());
				}
				catch(err) {
					log(varName+" Error retrieving variable:["+varName+"]... trying again to debug");
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
					varValue=varValue.saRemoveInnerHtmlTags();
					varValue=varValue.saToString();
				}
				log("Looking for Value ["+varName+"] pushed:["+varValue+"]");
				var vVar=self.variables.getVars(varName);
				if (vVar==""){
					log("The var ["+varName+"] does not exists");
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
				if (isString(self.datetimeSource)||(isArray(self.datetimeSource))){
					self.datetimeSource=self.datetimeSource.saToString().trim();
				}
				if ((typeof self.datetimeSource==="object")&&(self.datetimeSource.constructor.name=="Date")){
					auxDateTime=self.datetimeSource;
				} else {
					auxDateTime=toDateNormalDDMMYYYYHHMMSS(self.datetimeSource);
					self.dateTimeSource=auxDateTime;
				}
				self.datetime=auxDateTime;
			}
			var hsParams=self.otherParams;
			hsParams.clear();
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
			var sContentDebug=self.topHtmlBuffer(self.indInnerContentHtmlBuffer).saToString();
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
			if (self.visibility=="hidden"){
				var sHtml=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
				//self.indTokenHtmlBuffer=self.pushHtmlBuffer();
				//sHtml=self.replaceVars(sHtml);
				self.addHtml("");
			} else if (self.visibility=="hideable"){
				var sHtml=self.popHtmlBuffer(self.indInnerContentHtmlBuffer);
				//self.indTokenHtmlBuffer=self.pushHtmlBuffer();
				//sHtml=self.replaceVars(sHtml);
				var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
				self.addHtml(`
				             <button onclick="modelInteractiveFunctions.elemShowHide('`+newId+`')">Show/Hide</button>
							 <div id='`+newId+`' style="display: none">`
						     +   sHtml.saToString()
							 +`</div>`
							 );
			}
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
		if (self.ifCondition!=""){
			debugger;
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
					sValue=sValue.saRemoveInnerHtmlTags();
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
				} else if (sFormat.toLowerCase().indexOf("fixed")>=0) {
					var sValue=self.replaceVars(sValAux);
					sValue=sValue.saRemoveInnerHtmlTags();
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
		var sTextToLog=sText.saRemoveInnerHtmlTags().saTrim().saToString();
		//if (sTextToLog=="{{ AST_HHAccumFaseImplementacion }} + {{  AST_HHDespliegue }}"){
			//debugger;
		//}
		log("Replace Vars of:"+sTextToLog);
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
		if (isString(sText)){
			arrInnerText=[sText];
		} else {
			arrInnerText=sText;
		}
		var sInnerText=arrInnerText.saRemoveInnerHtmlTags(""); // remove inner tags
		if ((sInnerText.saExists("{{"))){ // its valid for {{ and for  {{{
			sInnerText=otherParams.self.replaceVars(sInnerText,otherParams);
		}
		var vValuesProcessed=[];
		var vValueAux;
		otherParams.vValues.forEach(function(vValue){
			if (isString(vValue)||isArray(vValue)){
				vValue=otherParams.self.variables.getVar(vValue);
				if (isArray(vValue)) vValue=vValue.saToString().trim();
				if ($.isNumeric(vValue)){
					vValue=parseFloat(vValue);
				}
			}
			vValuesProcessed.push(vValue);
		});
		var vValue=executeFunction(vValuesProcessed,sInnerText,otherParams.self.model.functionCache);
		return vValue;
	}
	getStringReplaced(sText,otherParams){
		var arrInnerText;
		if (isString(sText)){
			arrInnerText=[sText];
		} else {
			arrInnerText=sText;
		}
		var sInnerText=arrInnerText.saRemoveInnerHtmlTags("").saToString().trim();
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
			var vInnerVarValue=otherParams.self.variables.getVar(sInnerText);
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
