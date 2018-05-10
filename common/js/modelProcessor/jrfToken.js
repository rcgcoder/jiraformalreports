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
		obj.addHtml=function(sHtml){self.model.addHtml(sHtml);};
		obj.getAttrVal=self.getAttrVal;
		obj.encode=self.encode;
		obj.processAllChilds=self.processAllChilds;
		obj.addPostHtml=self.addPostHtml;
		obj.startApplyToken=self.startApplyToken;
		obj.endApplyToken=self.endApplyToken;
		obj.processInFormat=self.processInFormat;
		obj.processOutFormat=self.processOutFormat;

		
		obj.inFormat=obj.getAttrVal("informat");
		obj.outFormat=obj.getAttrVal("format");
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
	startApplyToken(){
		var self=this;
		if ((self.inFormat!="")||(self.outFormat!="")){
			self.pushHtmlBuffer();
		}
	}
	endApplyToken(){
		var self=this;
		if ((self.inFormat!="")||(self.outFormat!="")){
			self.processInFormat();
			self.processOutFormat();
			var sAux="";
			sAux=self.popHtmlBuffer();
			self.addHtml(sAux);
		}
		self.addPostHtml();
	}
	addPostHtml(){
		var self=this;
		self.addHtml("<!-- START POSTHTML IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
		self.addHtml(self.tag.getPostHTML());
		self.addHtml("<!-- END POSTHTML  IN FORMULA JRF TOKEN ["+self.tokenName+"] -->");
	}

	getAttrVal(idAttr,objSrc){
		var self=this;
		if (self.tag.getAttributes().exists(idAttr)){
			var attr=self.tag.getAttributeById(idAttr.toLowerCase());
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
	
	processInFormat(sValue){
		var self=this;
		var sValAux=sValue;
		if (isUndefined(sValAux)){
			sValAux=self.popHtmlBuffer();
			self.pushHtmlBuffer();
		}
		if (self.inFormat=="markdown"){
			sValAux=self.model.markdownConverter.makeHtml(sValAux); 
		}
		self.addHtml(sValAux);
		return sValAux;
	}
	processOutFormat(sValue){
		var self=this;
		var sValAux=sValue;
		if (isUndefined(sValAux)){
			sValAux=self.popHtmlBuffer();
			self.pushHtmlBuffer();
		}
		if (self.outFormat!=""){
			var arrFormats=self.outFormat.split(",");
			for (var i=0;i<arrFormats.length;i++){
				sFormat=arrFormats[i];
				if (sFormat=="money"){
					var sValAdjusted=replaceAll(sValAux+"",",",".");
					sValAux=inEuros(sValAdjusted,true); 
				} else if (sFormat=="hh"){
					sValAux=normalFormatNumber(sValAux); 
				}
			}
		}
		self.addHtml(sValAux);
		return sValAux;
	}

}
