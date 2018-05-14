var jrfToken=class jrfToken{ //this kind of definition allows to hot-reload
	constructor(model){
		var self=this;
		self.model=model;
	}
	extendObj(obj,tag,reportElem){
		var self=this;
		obj.tokenName=obj.constructor.name;
		obj.model=self.model;
		obj.tag=tag;
		obj.reportElem=reportElem;
		obj.variables=self.model.variables;
		obj.pushHtmlBuffer=function(){self.model.pushHtmlBuffer();};
		obj.popHtmlBuffer=function(){return self.model.popHtmlBuffer();};
		obj.getHtmlBuffer=function(){return self.model.html;};
		obj.addHtml=function(sHtml){self.model.addHtml(sHtml);};
		obj.getAttrVal=self.getAttrVal;
		obj.encode=self.encode;
		obj.processAllChilds=self.processAllChilds;
		obj.addPostHtml=self.addPostHtml;
		obj.startApplyToken=self.startApplyToken;
		obj.endApplyToken=self.endApplyToken;
		obj.applyIfCondition=self.applyIfCondition;
		obj.applyInFormat=self.applyInFormat;
		obj.applyOutFormat=self.applyOutFormat;
		obj.applyInitVars=self.applyInitVars;
		obj.applyPushVars=self.applyPushVars;
		obj.applySetVars=self.applySetVars;
		obj.executeFunction=self.executeFunction;
		obj.replaceVars=self.replaceVars;		
		obj.replaceVarsComplex=self.replaceVarsComplex;		
		obj.replaceVarsAndExecute=self.replaceVarsAndExecute;		
		obj.initVars=obj.getAttrVal("initVar");
		obj.pushVars=obj.getAttrVal("pushVar");
		obj.setVars=obj.getAttrVal("setVar");
		obj.inFormat=obj.getAttrVal("informat");
		obj.outFormat=obj.getAttrVal("format");
		obj.ifCondition=obj.getAttrVal("if").trim();
		obj.ifConditionResult=true;
		obj.autoAddPostHtml=true;
	}
	processAllChilds(childList,reportElement){
		var self=this;
		var auxRptElem=reportElement;
		if (isUndefined(auxRptElem)){
			auxRptElem=self.reportElem;
		}
		var auxList=childList;
		if (isUndefined(auxList)){
			auxList=self.tag.getChilds();
		}
		var nChildWalker=0;
		var processChild=function(childTag,nChild){
			self.addHtml("<!-- START "+childTag.id +" CHILD ("+nChild+") LIST ITEM IN JRF TOKEN ["+self.tokenName+"] -->");
			self.addStep("Applying Tag to model..",function(){
				self.model.applyTag(childTag,auxRptElem);
			})
			self.addStep("Pushing the HTML..",function(){
				self.addHtml("<!-- END "+childTag.id +" CHILD ("+nChild+") LIST ITEM IN JRF TOKEN ["+self.tokenName+"] -->");
				self.continueTask();
			})
			self.continueTask();
		}
		auxList.walk(function(childTag){
			self.addStep("Processing Child...",function(){
				processChild(childTag,nChildWalker);
			});
			nChildWalker++;
		});
		self.continueTask();
	}
	encode(){
		var self=this;
		self.addStep("Pre-Encode part...",function(){
			self.pushHtmlBuffer();
			self.variables.pushVarEnv();
			self.addHtml("<!-- START PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
			self.addHtml(self.tag.getPreviousHTML());
			self.addHtml("<!-- END PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
			self.startApplyToken();
			self.continueTask();
		});
		self.addStep("Encode part...",function(){
			if (self.ifConditionResult){
				self.apply(); // the apply function not returns anything... only writes text to buffer
			}
			self.continueTask();
		});
		self.addStep("Post-Encode part...",function(){
			self.endApplyToken();
			self.continueTask();
		});
		self.addStep("PostProcess all token and return...",function(){
			var sHtml=self.popHtmlBuffer();
//			sHtml=self.replaceVars(sHtml);
			self.addHtml(sHtml);
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
				if (arrVarParts.length>1){
					self.variables.setVar(varName,arrVarParts[1]);
				}
				log("Initialized Value ["+varName+"] ");
			}
		}
	}
	applySetVars(){
		var self=this;
		var sValAux=self.getHtmlBuffer();

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
				log("Looking for Value ["+varName+"] to set:["+varValue+"]");
				var vVar=self.variables.getVars(varName);
				try {
				    log("Variable Stack Elements:"+vVar.length());
				}
				catch(err) {
					log("Error retrieving variable:["+varName+"]... trying again to debug");
					vVar=self.variables.getVars(varName);
				}
				
				if (vVar.length()>0){// replace as a pop/push
					vVar.pop();
				}
				vVar.push(varValue);

				log("Value ["+varName+"] setted:["+varValue+"]");
			}
		}
	}
	applyPushVars(){
		var self=this;
		var sValAux=self.getHtmlBuffer();

		if (self.pushVars!=""){
			var arrVars=self.pushVars.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=self.replaceVars(arrVarParts[0].trim());
				var varValue;
				if (arrVarParts.length>1){
					varValue=self.replaceVars(arrVarParts[1]);
				} else {
					varValue=sValAux;
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
	}
	startApplyToken(){
		var self=this;
		self.pushHtmlBuffer();
		// process the if parameter 
		self.applyIfCondition();
		if (self.ifConditionResult){
			self.applyInitVars();
		}
	}
	endApplyToken(){
		var self=this;
		var sAux="";
		if (self.ifConditionResult){
			self.applyInFormat();
			self.applySetVars();
			self.applyPushVars();
			self.applyOutFormat();
			sAux=self.popHtmlBuffer();
			self.addHtml(sAux);
			if (self.autoAddPostHtml){
				self.addPostHtml();
			}
		} else {
			sAux=self.popHtmlBuffer();
			self.addHtml(sAux);
		}
	}
	addPostHtml(){
		var self=this;
		self.addHtml("<!-- START POSTHTML IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
		self.addHtml(self.tag.getPostHTML());
		self.addHtml("<!-- END POSTHTML  IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
	}

	getAttrVal(attrName,objSrc){
		var self=this;
		var idAttr=attrName.toLowerCase();
		if (self.tag.getAttributes().exists(idAttr)){
			var attr=self.tag.getAttributeById(idAttr);
			if (isDefined(attr)){
				var vAux=attr.value;
				if (isUndefined(vAux)){
					vAux="";
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
		if (self.ifCondition!=""){
			var sProcesed=self.replaceVars(self.ifCondition);
			sProcesed=executeFunction([],sProcesed);
			self.ifConditionResult=sProcesed;			
		}
	}
	
	applyInFormat(){
		var self=this;
		var sValAux=self.popHtmlBuffer();
		self.pushHtmlBuffer();
		if (self.inFormat!=""){
			var sFormats=self.replaceVars(self.inFormat);
			var arrFormats=sFormats.split(",");
			arrFormats.forEach(function(sFormat){
				var arrParts=sFormat.split("=")
				var sFormatId=arrParts[0];
				if (sFormatId=="markdown"){
					sValAux=self.model.markdownConverter.makeHtml(sValAux); 
				} else if (sFormatId=="fixed"){
					sValAux=self.replaceVars(sValAux);
					sValAux=self.model.removeInnerTags(sValAux).trim();
					if (sValAux=="") return;
					var nDigits=2;
					if (arrParts.length>1){
						nDigits=arrParts[1];
					}
					var sFncFormula=`
						""; // to close the var result= instruction inserted by executefunction
						var value=_arrRefs_[0];
						var result=parseFloat(value).toFixed(`+nDigits+`);
						return result;
						log("Parse done... the rest is not executed")
						// execute function inserts the las ";" automatically
						`;
					sValAux=replaceAll(sValAux,"\n"," ").trim();
					sValAux=executeFunction([sValAux],sFncFormula);
				}
			});
		}
		self.addHtml(sValAux);
	}
	applyOutFormat(){
		var self=this;
		var sValAux=self.popHtmlBuffer();
		self.pushHtmlBuffer();
		if (self.outFormat!=""){
			var arrFormats=self.outFormat.split(",");
			var sFormat;
			for (var i=0;i<arrFormats.length;i++){
				sFormat=arrFormats[i];
				if (sFormat=="money"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAux=inEuros(sValAdjusted,true); 
				} else if (sFormat=="hh"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAux=(parseFloat(sValAdjusted).toFixed(2) * 22.1).toFixed(2); 
				} else if (sFormat=="hours"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAux=normalFormatNumber(sValAdjusted) + " h"; 
				} else if (sFormat=="%"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAux=normalFormatNumber(sValAdjusted) + " %"; 
				}
			}
		}
		self.addHtml(sValAux);
		return sValAux;
	}
	replaceVarsAndExecute(sText){
		var self=this;
		var oReplaced=self.replaceVarsComplex(sText);
		var vValue=executeFunction(oReplaced.values,oReplaced.text);
		return vValue;
	}
	replaceVars(sText){
		var self=this;
		var oScripts=self.replaceVarsComplex(sText,"{{{","}}}",false);
		var sResult=oScripts.text;
		for (var i=0;i<oScripts.values.length;i++){
			var sScript=oScripts.values[i];
			var sValue=self.replaceVarsAndExecute(sScript);
			sValue=(sValue+"").trim();
			var sRef="_arrRefs_["+i+"]";
			sResult=replaceAll(sResult,sRef,sValue);
			sResult=sResult.trim();
		}
		log("executed {{{ }}}");
		log(sResult);
		log("now let´s replace {{ }}");
		var oSimple=self.replaceVarsComplex(sResult);
		var vValue=oSimple.text;
		if (oSimple.values.length>0){
			vValue=executeFunction(oSimple.values,oSimple.text);
		}
		return vValue;
	}
	replaceVarsComplex(inText,theOpenTag,theCloseTag,bReplaceVarsByValue){
		var self=this;
		var bReplaceVars=true;
		var openTag="{{";
		var closeTag="}}";
		var sText="";
		if (isDefined(bReplaceVarsByValue)){
			bReplaceVars=bReplaceVarsByValue;
		}
		if (isDefined(theOpenTag)) openTag=theOpenTag;
		if (isDefined(theCloseTag)) closeTag=theCloseTag;
		if (isDefined(inText)){
			sText=inText;
			if (!isString(sText)){
				sText=""+sText;
			}
		} else {
			log("You are using a undefined text.... this may be a big error!");
		}
		var vValues=[];
		var sVarRef="";
		var iVar=0;
		var openInd=sText.lastIndexOf(openTag);
		var closeInd;
		while (openInd>=0){
			var closeInd=sText.indexOf(closeTag,openInd+closeTag.length);
			var sInnerText=sText.substring(openInd+closeTag.length,closeInd).trim();
			sInnerText=self.model.removeInnerTags(sInnerText);
			if (!bReplaceVars){
				vValues.push(sInnerText);
				sVarRef="_arrRefs_["+iVar+"]";
				iVar++;
			} else {
				var vInnerVarValue=self.variables.getVar(sInnerText);
				if (isObject(vInnerVarValue)){
					vValues.push(vInnerVarValue);
					sVarRef="_arrRefs_["+iVar+"]";
					iVar++;
				} else {
					sVarRef=vInnerVarValue;
				}
			}
			sText=sText.substring(0,openInd)+
					sVarRef+
				  sText.substring(closeInd+closeTag.length,sText.length);
			openInd=sText.lastIndexOf(openTag);
		}
		return {text:sText,values:vValues};
	}
}
