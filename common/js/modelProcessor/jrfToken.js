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
		obj.applyInFormat=self.applyInFormat;
		obj.applyOutFormat=self.applyOutFormat;
		obj.applyInitVars=self.applyInitVars;
		obj.applyPushVars=self.applyPushVars;
		obj.applySetVars=self.applySetVars;
		
		obj.initVars=obj.getAttrVal("initVar");
		obj.pushVars=obj.getAttrVal("pushVar");
		obj.setVars=obj.getAttrVal("setVar");
		obj.inFormat=obj.getAttrVal("informat");
		obj.outFormat=obj.getAttrVal("format");
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
		var nChild=0;
		auxList.walk(function(childTag){
			self.addHtml("<!-- START "+childTag.id +" CHILD ("+nChild+") LIST ITEM IN JRF TOKEN ["+self.tokenName+"] -->");
			self.addHtml(self.model.applyTag(childTag,auxRptElem));
			self.addHtml("<!-- END "+childTag.id +" CHILD ("+nChild+") LIST ITEM IN JRF TOKEN ["+self.tokenName+"] -->");
			nChild++;
		});
		
	}
	encode(){
		var self=this;
		self.pushHtmlBuffer();
		self.variables.pushLocalVarEnv();
		self.addHtml("<!-- START PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
		self.addHtml(self.tag.getPreviousHTML());
		self.addHtml("<!-- END PREVIOUSHTML IN JRF TOKEN ["+self.tokenName+"] -->");
		self.startApplyToken();
		self.apply();
		self.endApplyToken();
		self.variables.popLocalVarEnv();
		return self.popHtmlBuffer();
	}
	
	applyInitVars(){
		var self=this;
		if (self.initVars!=""){
			var arrVars=self.initVars.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=arrVarParts[0];
				self.variables.initVarLocal(varName);
				if (arrVarParts.length>1){
					self.variables.setVar(varName,arrVarParts[1]);
				}
			}
		}
	}
	applySetVars(){
		var self=this;
		var sValAux=self.getHtmlBuffer();

		if (self.setVars!=""){ 
			var arrVars=self.pushVars.split(",");
			for (var i=0;i<arrVars.length;i++){
				var arrVarParts=arrVars[i].split("=");
				var varName=arrVarParts[0];
				var varValue;
				if (arrVarParts.length>0){
					varValue=arrVarParts[1];
				} else {
					varValue=sValAux;
				}
				var vVar=self.variables.getVars(varName);
				if (vVar.length()==0){
					vVar.push(varValue);
				} else {
					vVar.top().value=varValue;
				}
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
				var varName=arrVarParts[0];
				var varValue;
				if (arrVarParts.length>0){
					varValue=arrVarParts[1];
				} else {
					varValue=sValAux;
				}
				var vVar=self.variables.getVars(varName);
				vVar.push(varValue);
			}
		}
	}
	startApplyToken(){
		var self=this;
		self.pushHtmlBuffer();
		self.applyInitVars();
	}
	endApplyToken(){
		var self=this;
		self.applyInFormat();
		self.applySetVars();
		self.applyPushVars();
		self.applyOutFormat();
		var sAux="";
		sAux=self.popHtmlBuffer();
		self.addHtml(sAux);
		if (self.autoAddPostHtml){
			self.addPostHtml();
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
	
	applyInFormat(){
		var self=this;
		var sValAux=self.popHtmlBuffer();
		self.pushHtmlBuffer();
		if (self.inFormat=="markdown"){
			sValAux=self.model.markdownConverter.makeHtml(sValAux); 
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
					sValAux=normalFormatNumber(sValAdjusted/3600); 
				}
			}
		}
		self.addHtml(sValAux);
		return sValAux;
	}

}
