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
		obj.pushHtmlBuffer=function(){return self.model.pushHtmlBuffer();};
		obj.popHtmlBuffer=function(index){return self.model.popHtmlBuffer(index);};
		obj.getHtmlBuffer=function(){return self.model.html;};
		obj.addHtml=function(sHtml){self.model.addHtml(sHtml);};
		obj.changeBrackets=self.changeBrackets;
		obj.indHtmlBuffer=0;
		obj.indTokenHtmlBuffer=0;
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
		obj.applyInitVarsReuse=self.applyInitVarsReuse;
		obj.applyPushVars=self.applyPushVars;
		obj.applySetVars=self.applySetVars;
		obj.executeFunction=self.executeFunction;
		obj.replaceVars=self.replaceVars;		
		obj.replaceVarsComplex=self.replaceVarsComplex;		
		obj.replaceVarsAndExecute=self.replaceVarsAndExecute;		
		obj.initVars=obj.getAttrVal("initVar");
		obj.initVarsReuse=obj.getAttrVal("initVarReuse");
		obj.pushVars=obj.getAttrVal("pushVar");
		obj.setVars=obj.getAttrVal("setVar");
		obj.inFormat=obj.getAttrVal("informat");
		obj.outFormat=obj.getAttrVal("format");
		obj.ifCondition=obj.getAttrVal("if");
		obj.processOrder=obj.getAttrVal("processOrder");
		obj.visibility=obj.getAttrVal("visibility");
		obj.ifConditionResult=true;
		obj.autoAddPostHtml=true;
	}
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
		self.indHtmlBuffer=self.pushHtmlBuffer();
		if (self.model.report.config.htmlDebug){
			self.addHtml("<!-- " + self.changeBrackets(self.tag.getTagText())+" -->");
			self.addHtml("<!-- " + self.changeBrackets(self.model.traceTag(self.tag))+ " -->");
		}

		self.addStep("Pre-Encode part...",function(){
			self.variables.pushVarEnv();
			if (self.model.report.config.htmlDebug) self.addHtml("<!-- START PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
			self.addHtml(self.tag.getPreviousHTML());
			if (self.model.report.config.htmlDebug) self.addHtml("<!-- END PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
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
			if ((self.visibility!="")&&(self.visibility=="hidden")){
					var sHtml=self.popHtmlBuffer(self.indHtmlBuffer);
					//sHtml=self.replaceVars(sHtml);
					self.addHtml("");
			}
			self.variables.popVarEnv();
			self.continueTask();
		});
		self.continueTask();
	}
	
	applyInitVars(){
		var self=this;
		if (self.initVars!=""){
			if (initVars.indexOf("srcVersions")>=0){
				debugger;
			}
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
		return sValAux;
	}
	startApplyToken(){
		var self=this;
		self.indTokenHtmlBuffer=self.pushHtmlBuffer();
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
			var sValAux=self.popHtmlBuffer(self.indTokenHtmlBuffer);
			self.indTokenHtmlBuffer=self.pushHtmlBuffer();

			sValAux=self.applyInFormat(sValAux);
			sValAux=self.applySetVars(sValAux);
			sValAux=self.applyPushVars(sValAux);
			sValAux=self.applyOutFormat(sValAux);
//			sAux=self.popHtmlBuffer();
//			self.addHtml(sAux);
			self.addHtml(sValAux);
			if (self.autoAddPostHtml){
				self.addPostHtml();
			}
//		} else {
//			sAux=self.popHtmlBuffer();
//			self.addHtml(sAux);
		}
	}
	addPostHtml(){
		var self=this;
		if (self.model.report.config.htmlDebug) self.addHtml("<!-- START POSTHTML IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
		//self.addHtml(self.replaceVars(self.tag.getPostHTML()));
		self.addHtml(self.tag.getPostHTML());
		if (self.model.report.config.htmlDebug) self.addHtml("<!-- END POSTHTML  IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
	}

	getAttrVal(attrName,objSrc,bReplaceVars){
		var self=this;
		var idAttr=attrName.toLowerCase();
		if (self.tag.getAttributes().exists(idAttr)){
			var attr=self.tag.getAttributeById(idAttr);
			if (isDefined(attr)){
				var vAux=attr.value;
				if (isUndefined(vAux)){
					vAux="";
				}
				if (isDefined(bReplaceVars)&&(!bReplaceVars)){
					log ("not replace Vars");
				} else {
					vAux=self.replaceVars(vAux);
				}
				if (typeof vAux==="string") {
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
		if (self.ifCondition!=""){
			var sProcesed=executeFunction([],self.ifCondition,self.model.functionCache);
			self.ifConditionResult=sProcesed;			
		}
	}
	
	applyInFormat(sValAux){
		var self=this;
		if (self.inFormat!=""){
//			var sFormats=self.replaceVars(self.inFormat);
			var arrFormats=self.inFormat.split(",");
			arrFormats.forEach(function(sFormat){
				var arrParts=sFormat.split("=")
				var sFormatId=arrParts[0];
/*				if (sFormatId=="markdown"){
					sValAux=sValAux.wiki2html(); 
				} else 
*/				if (sFormatId=="fixed"){
					sValAux=self.replaceVars(sValAux);
					sValAux=self.model.removeInnerTags(sValAux,true).trim();
					if (sValAux=="") return;
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
					sValAux=replaceAll(sValAux,"\n"," ").trim();
					sValAux=executeFunction([sValAux],sFncFormula,self.model.functionCache);
				}  
			});
		}
		return sValAux;
//		self.addHtml(sValAux);
	}
	applyOutFormat(sValAux){
		var self=this;
//		var sValAux=self.popHtmlBuffer(self.indTokenHtmlBuffer);
//		self.indTokenHtmlBuffer=self.pushHtmlBuffer();
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
				} else if (sFormat=="SecondsToHours"){
					var floatVal=parseFloat(sValAux);
					floatVal=(floatVal/(60*60)).toFixed(2);
					var sValAdjusted=replaceAll(floatVal+"",",",".");
					sValAux=normalFormatNumber(sValAdjusted) + " h"; 
				} else if (sFormat=="%"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAux=normalFormatNumber(sValAdjusted) + " %"; 
				}
			}
		}
//		self.addHtml(sValAux);
		return sValAux;
	}
	replaceVarsAndExecute(sText){
		var self=this;
		var oReplaced=self.replaceVarsComplex(sText);
		var vValue=executeFunction(oReplaced.values,oReplaced.text,self.model.functionCache);
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
		log("executed {{{"+sText+" }}}");
		log(sResult);
		log("now let´s replace {{  "+sText+"  }}");
		var oSimple=self.replaceVarsComplex(sResult);
		var vValue=oSimple.text;
		if (oSimple.values.length>0){
			vValue=executeFunction(oSimple.values,oSimple.text,self.model.functionCache);
		}
		log("Replaced: <<"+sText+">> ->> <<"+vValue+">>");
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
			sInnerText=self.model.removeInnerTags(sInnerText,true);
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
