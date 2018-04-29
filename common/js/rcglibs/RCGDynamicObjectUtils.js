if (typeof math==="undefined"){
	if (isInNodeJS()){
		math = require('mathjs');
	} else {
		windows["math"]=math;
	}
}
/*
All of the libs are allready loaded
var BaseUtils=require("./BaseUtils.js");
var StringUtils=require("./StringUtils.js");
var LogUtils=require("./LogUtils.js");
var ChronoUtils=require("./ChronoUtils.js");
var HashMapUtils=require("./HashMapUtils.js");
*/
class RCGDynamicObject{
	constructor(theFactory,name,arrAttributeList,arrAttributes,arrAttributesPercs){
		var self=this;
		var factory=theFactory;
		self.factory=factory;
		self.parentFactorys=[];
		self.parentFactorys.push(factory);
		self.extend=factory.extend;
		self.getParentAttribute=factory.getParentAttribute;
		self.getParentMethod=factory.getParentMethod;
		self.executeParentMethod=factory.executeParentMethod;
		self.name=name;
		self.global=global;
		self.attrTypes=newHashMap(); // lista de names de attributes, type, etc
		self.attributes=newHashMap();  // lista total de attributes del theObject
		self.functions=newHashMap();  // lista de functions asociadas al theObject
		self.list=newHashMap();
		self.getById=factory.getById;									
		self.get=factory.get;
		self.findByAttribute=factory.findByAttribute;
		self.internal_buildId=factory.internal_buildId;			
		self.internal_getMaxId=factory.internal_getMaxId;		
		self.internal_getId=factory.internal_getId;
		self.internal_getName=factory.internal_getName;
		self.getNewId=factory.getNewId;
		self.internal_addIndividualAttr=factory.internal_addIndividualAttr;
		self.addAttribute=factory.addAttribute;
		self.addAttributeList=factory.addAttributeList;			
		self.addAttributeWithPerc=factory.addAttributeWithPerc;		
		self.internal_getFactory=factory.internal_getFactory;			
		self.internal_setID=factory.internal_setID;		
		self.updateAttributesFunctions=factory.updateAttributesFunctions;
		self.newObject=factory.newObject;
		self.new=factory.new;							
		self.processAllAttributes=factory.processAllAttributes;						
		self.traceItem=factory.traceItem;
		self.trace=factory.trace;
		self.swing=factory.swing;
		self.configFromExcel=factory.configFromExcel;
		self.loadFromExcel=factory.loadFromExcel;
		self.loadFromExceAsync=factory.loadFromExceAsync;
		self.generateTypes=factory.generateTypes;
		self.internal_execFunction=factory.internal_execFunction;
		self.clear=factory.clear;
		var auxAttslist=[];
		var auxAttsValues=[];
		var auxAttsPercs=[];
		if (isDefined(arrAttributeList)){
			auxAttslist=arrAttributeList;
		}
		if (isDefined(arrAttributes)){
			auxAttsValues=arrAttributes;
		}
		if (isDefined(arrAttributesPercs)){
			auxAttsPercs=arrAttributesPercs;
		}
		self.processAllAttributes(auxAttslist,auxAttsValues,auxAttsPercs);
	}
}

class factoryObjects{
	constructor(){
		var self=this;
		self.nfactorys=0;
		self.hsFactoriesGlobal=newHashMap();
		
	}
	getFactoryGlobal(name){
		return this.hsFactoriesGlobal.getValue(name);
	}
	addfactoryGlobal(factory){
		this.hsFactoriesGlobal.add(factory.name,factory);
	}
/*		,attrTypes:factoryHashMaps.newHashMap()  // lista de types de Attribute
		,attributes:factoryHashMaps.newHashMap()  // lista total de attributes del theObject
		,functions:factoryHashMaps.newHashMap()  // lista de functions asociadas al theObject
		,list:factoryHashMaps.newHashMap()
*/		
	newFactory(name,isGlobal,arrAttributeList,arrAttributes,arrAttributesPercs){
		var self=this;
		var obj=new RCGDynamicObject(self,name,arrAttributeList,arrAttributes,arrAttributesPercs);
		self.nfactorys++;
		if (isDefined(isGlobal)&&isGlobal){
			this.addfactoryGlobal(obj);
		}
		return obj;
	}
	clear(){
			this.list.clear();
	}
	internal_getId(){
			return this.id;
		}
	internal_getName(){
			return this.name;
		}
	getById(id){
			var node=this.list.find(id);
			if (node!=""){
				return node.value;
			}
			return node;
			//return getFromListaById(this.list,id);re
		}
	get(ind){
			var node=this.list.findByInd(ind);
			if (node!=""){
				return node.value;
			}
			return node;
		}
	internal_buildId(sIdBase,nId){
			var sNewId="";
			if (sIdBase!=""){
/*				if (nId==0){
					sNewId=sIdBase;
				} else {
					*/
					sNewId=sIdBase+"_"+fillCharsLeft(6,nId);
//				}
			} else {
				sNewId=fillCharsLeft(6,nId);
			}
			return sNewId;
		}
	internal_getMaxId(sIdBase,iLowerLimit,iHigherLimit){
	//			log("GetMaxID:"+sIdBase+"[" + iLowerLimit + "," + iHigherLimit+"]");
				if (iLowerLimit>=iHigherLimit) {
					return iHigherLimit;
				}
				var nId=Math.floor((iHigherLimit-iLowerLimit)/2)+iLowerLimit;
				var sNewId=this.internal_buildId(sIdBase,nId);
				if (this.getById(sNewId)=="") {
					return this.internal_getMaxId(sIdBase,iLowerLimit,nId);
				} else {
					return this.internal_getMaxId(sIdBase,nId+1,iHigherLimit);
				}
			}
	getNewId(idBase){
			var nId=1;
			var sIdBase="";
			if (typeof idBase!=="undefined"){
				sIdBase=idBase;
			}
			var sNewId=sIdBase;
			var iLimSup=this.list.length();
			var iLimInf=0;
			var me=this;
			var iLastId=this.internal_getMaxId(sIdBase,0,iLimSup);
			nId=iLastId-1;
			sNewId=this.internal_buildId(sIdBase,iLastId);
			while (this.getById(sNewId)!="") {
				nId++;
				sNewId=this.internal_buildId(sIdBase,nId);
			}
	//		log("LastID:"+iLastId +" new ID:"+ sNewId);
			return sNewId;
		}
	processFormula(sFormula,theObject){
			var auxMathData=this["math_"+sOperation];
			if (auxMathData.code==""){
				var expr=this["get"+sOperation]()+"";
				expr=replaceAll(expr,"“",'"');
				expr=replaceAll(expr,"”",'"');
				var node = math.parse(expr);      // parse expression into a node tree
				var symbols= math.extractSymbols(node);
				var code = node.compile();        // compile the node tree
				auxMathData.nodeMath=node;
				auxMathData.code=code;
				auxMathData.symbols=symbols;
		//		var result = code.eval([scope]);  // evaluate the code with an optional scope
			}
			var scope=math.genScope(auxMathData.symbols,theObject);
			var result=auxMathData.code.eval(scope);
			return result;
		}

	internal_addIndividualAttr(vNameAttributeDetail){
			this.attributes.add("attr_"+vNameAttributeDetail,function(){return "";});
			this.functions.add("get"+vNameAttributeDetail,function(){
					var valAttr=this["attr_"+vNameAttributeDetail];
					return valAttr;
				});
			this.functions.add("set"+vNameAttributeDetail,function(valAttr){
					this["attr_"+vNameAttributeDetail]=valAttr;
				});
		}
		
	addAttribute(vNameAttribute,vDescription,vDataType){
			if (typeof vNameAttribute==="undefined") return;
			if (typeof vNameAttribute==="string"){
				if (!this.attrTypes.exists(vNameAttribute)){
					this.attrTypes.add(vNameAttribute,{type:"Value",name:vNameAttribute,description:vDescription,subType:vDataType});
				}
				this.internal_addIndividualAttr(vNameAttribute);
				var bWithoutMinMaxMargins=true;
				var bFormula=(vDataType=="Formula");
				if ((vDataType=="Number")||
					(vDataType=="Date")||
					(vDataType=="Formula")||
					(vDataType=="%")||
					(vDataType=="DateMonthDay")
					){
					bWithoutMinMaxMargins=false;
				}
				if (!bWithoutMinMaxMargins){
					this.internal_addIndividualAttr(vNameAttribute+"Min");
					this.internal_addIndividualAttr(vNameAttribute+"Max");
					this.internal_addIndividualAttr(vNameAttribute+"Margins");
				}
				this.functions.add("get"+vNameAttribute,function(param1){ // machaca la funcion por defecto
					var valAttr=this["attr_"+vNameAttribute];
					var valMin="";
					var valMax="";
					var nMargins=0; 
					if (!bWithoutMinMaxMargins){
						valMin=this["attr_"+vNameAttribute+"Min"];
						valMax=this["attr_"+vNameAttribute+"Max"];
						nMargins=this["get"+vNameAttribute+"Margins"](); 
					}

					if (typeof valAttr==="object") return valAttr;
					if ((valMin=="")&&(valMax=="")) {
						if (typeof valAttr==="string") return valAttr;
					}
					nMargins=1+((nMargins/2)-nMargins);
					if (valAttr==""){
						valMin=valMin*nMargins;
						valMax=valMax*nMargins;
						if ((valMin!="")&&(valMax!="")){
							return rndMinMax(valMin,valMax,true);
						} else if (valMax!=""){
							return rndMinMax(0,valMax*(1+(Math.random()*nMargins)),true);
						} else {
							return rndMinMax(valMin,valMin*10,true);
						}
					} else {
						return valAttr*nMargins;
					}
				});
				this.functions.add("set"+vNameAttribute,function(value){
					if (bFormula){
						this["attr_"+vNameAttribute]={formula:value,nodeMath:"",code:"",symbols:""};
					} else if ((typeof value==="object") && (value.isObjValue==true)){
						this["attr_"+vNameAttribute]=value.value;
						if (!bWithoutMinMaxMargins){
							this["attr_"+vNameAttribute+"Min"]=value.min;
							this["attr_"+vNameAttribute+"Max"]=value.max;
							this["attr_"+vNameAttribute+"Margins"]=value.margins;
						}
					} else if ((vDataType!="Text")&&(bWithoutMinMaxMargins)){ //es un theObject
						this["attr_"+vNameAttribute]=value;
						var factory=this.factory;
						var nameTypeSingular=factory.name.substring(0,this.factory.name.length-1);
						var sNameFunction="add"+nameTypeSingular;
						var fncAdd=value[sNameFunction];
						if (typeof fncAdd!=="undefined"){
							value[sNameFunction](this);
						} else {
							sNameFunction="set"+nameTypeSingular;
							var fncSet=value[sNameFunction];
							if (typeof fncSet!=="undefined"){
								value[sNameFunction](this);
							}
						}
					} else {
						this["attr_"+vNameAttribute]=value;
						if (!bWithoutMinMaxMargins){
							this["attr_"+vNameAttribute+"Min"]="";
							this["attr_"+vNameAttribute+"Max"]="";
						}
					}
				});
				if (bFormula){
					this.functions.add("eval"+vNameAttribute,function(theObject){ 
						var valAttr=this["attr_"+vNameAttribute];
/*						var typeAttr=theObject.factory.attrTypes.getValue(vNameAttribute);
						if (typeAttr.type=="List"){
							valAttr=this["get"+vNameAttribute+"s"]();
							if (valAttr.length()>0){
								valAttr=valAttr.getFirst().value.id;
							} else {
								valAttr="";
							}
						}*/
						if (valAttr=="") return "";
						if (valAttr.formula=="") return "";
						if (valAttr.code==""){
							var expr=valAttr.formula+"";
							expr=replaceAll(expr,"“",'"');
							expr=replaceAll(expr,"”",'"');
							var node = math.parse(expr);      // parse expression into a node tree
							var symbols= math.extractSymbols(node);
							var code = node.compile();        // compile the node tree
							valAttr.nodeMath=node;
							valAttr.code=code;
							valAttr.symbols=symbols;
							//var result = code.eval([scope]);  // evaluate the code with an optional scope
						}
						var scope=math.genScope(valAttr.symbols,theObject); // param1 es un theObject 
						return valAttr.code.eval(scope);						
					});
				}
			} else if (Array.isArray(vNameAttribute)){
				for (var i=0;i<vNameAttribute.length;i++){
					if (typeof vNameAttribute[i]==="string"){
						this.addAttribute(vNameAttribute[i]);
					} else {
						this.addAttribute(vNameAttribute[i].name,vNameAttribute[i].description,vNameAttribute[i].type);
					}
				}
			}
		}
	addAttributeList(vNameAttribute,vDescription,vDataType){
			if (typeof vNameAttribute==="undefined") return;
			var me=this;
			if (typeof vNameAttribute==="string"){
				if (!this.attrTypes.exists(vNameAttribute)){
					this.attrTypes.add
								(vNameAttribute,
									{type:"List"
									,name:vNameAttribute
									,description:vDescription
									,subType:vDataType});
				}

				this.attributes.add("list_"+vNameAttribute+"s",function(){return newHashMap();});
				this.functions.add("add"+vNameAttribute,function(objVal){
					this["list_"+vNameAttribute+"s"].add(objVal.id,objVal);
					if (typeof objVal["listParents_"+me.name] === "undefined"){ //name de la factory
						objVal["listParents_"+me.name]=newHashMap();
					}
					var nodAux=objVal["listParents_"+me.name].find(this.id);
					if (nodAux==""){
						objVal["listParents_"+me.name].add(this.id,this);
					}
					return objVal;
				});
				this.functions.add("count"+vNameAttribute+"s",function(){
					return this["list_"+vNameAttribute+"s"].nNodes;
				});
				this.functions.add("get"+vNameAttribute+"s",function(){
					return this["list_"+vNameAttribute+"s"];
				});
				this.functions.add("get"+vNameAttribute,function(indice){
					return this["list_"+vNameAttribute+"s"].findByInd(indice);
				});
				this.functions.add("get"+vNameAttribute+"ById",function(id){
					//return getFromListaById(this["List"+vNameAttribute+"s"],id);
					return this["list_"+vNameAttribute+"s"].getValue(id);
				});
			} else if (Array.isArray(vNameAttribute)){
				for (var i=0;i<vNameAttribute.length;i++){
					if (typeof vNameAttribute[i]==="string"){
						this.addAttribute(vNameAttribute[i]);
					} else {
						this.addAttributeList(vNameAttribute[i].name,vNameAttribute[i].description,vNameAttribute[i].type);
					}
				}
			}
		}
	addAttributeWithPerc(vNameAttribute,vDescription,vDataType){
			if (typeof vNameAttribute==="undefined") return;
			if (typeof vNameAttribute==="string"){
				this.addAttribute(vNameAttribute); // attribute, min, max Margins
			} else if (Array.isArray(vNameAttribute)){
				for (var i=0;i<vNameAttribute.length;i++){
					this.addAttributeWithPerc(vNameAttribute[i].name,vNameAttribute[i].description,vNameAttribute[i].type);
				}
			} else if (typeof vNameAttribute==="object"){
				var objReference=/*{
						  typeDoc:refTypeDoc
						  ,phase:refPhase
						  ,subPhase:refSubPhase
					  }*/ vNameAttribute.reference;
				var sNameAttr=vNameAttribute.nameAttribute;
				if (!this.attrTypes.exists(sNameAttr)){
					this.attrTypes.add(sNameAttr,
							{type:"Reference",
							name:sNameAttr,
							reference:objReference,
							description:vDescription,
							subType:vDataType});
				}
				this.addAttribute(sNameAttr,vDescription,vDataType); //attribute mas min,max,Margins
				this.addAttribute(sNameAttr+"Perc",vDescription,vDataType); // perc min max Margins
				this.internal_addIndividualAttr(sNameAttr+"TypeDocumentReference");
				this.internal_addIndividualAttr(sNameAttr+"PhaseReference");
//				this.internal_addIndividualAttr(sNameAttr+"PhaseReference");
				this.internal_addIndividualAttr(sNameAttr+"subPhaseReference");
				this.internal_addIndividualAttr(sNameAttr+"WeightPaper");
				this.internal_addIndividualAttr(sNameAttr+"WeightDigital");
				this.internal_addIndividualAttr(sNameAttr+"CostPaper");
				this.internal_addIndividualAttr(sNameAttr+"CostDigital");
				this.internal_addIndividualAttr(sNameAttr+"workHumanPaper");
				this.internal_addIndividualAttr(sNameAttr+"workHumanDigital");
				this.functions.add("set"+sNameAttr+"Margins",function(value){
					this["attr_"+sNameAttr+"Margins"]=value;
					this["attr_"+sNameAttr+"PercMargins"]=value;
				});
				//this["set"+sNameAttr+"Margins"](0);
				this.functions.add("set"+sNameAttr+"Ref",function(newValue){
					/* new Value tiene que ser un theObject Reference
					{typeDoc,phase,subPhase}
					*/
					if (newValue==""){
						this["set"+sNameAttr+"TypeDocumentReference"]("");
						this["set"+sNameAttr+"PhaseReference"]("");
						this["set"+sNameAttr+"SubPhaseReference"]("");
					} else {
						var typeDoc=newValue.typeDoc;
						var phase=newValue.phase;
						var subPhase=newValue.subPhase;
						if (typeDoc!=""){
							var objTypeDoc=typesDocument.getValue(typeDoc);
							if (typeDoc==""){
								log("El type de documento:"+typeDoc+" no existe en la lista de types");
								alert("El type de documento:"+typeDoc+" no existe en la lista de types");
								typesDocument.trace();
							}
							typeDoc=objTypeDoc;
						}
						if (phase!=""){
							var proc=this.getProcedure();
							var phases=proc.getPhases();
							var arrPhases=[];
							phases.list.walk(function(objPhase){
								var bSelected=false;
								if (objPhase.getType()==phase){
									if (subPhase==""){
										bSelected=true;
									} else if (subPhase==objPhase.getSubType()){
										bSelected=true;
									}
								}
								if ((bSelected)&&(typeDoc!="")){
									if (objPhase.getTypeResultado().name!=typeDoc.name){
										bSelected=false;
									}
								}
								if (bSelected){
									arrPhases.push(objPhase);
								}
								if (arrPhases.length<=0){
									log("Existe un error en la identificacion de la phase:"+phase+" subPhase:"+subPhase);
									alert("Existe un error en la identificacion de la phase:"+phase+" subPhase:"+subPhase);
								} else {
									phase=arrPhases;
								}
							});
						}
						this["set"+sNameAttr+"TypeDocumentReference"](typeDoc);
						this["set"+sNameAttr+"PhaseReference"](phase);
						this["set"+sNameAttr+"SubPhaseReference"](subPhase);
					}
				});
				this.functions.add("set"+sNameAttr+"Perc",function(newValue){
					var value=newValue;
					var valueMin="";
					var valueMax="";
					if ((typeof value==="object") && (value.isObjValue==true)){
						this["attr_"+sNameAttr+"Margins"]=value.margins;
						value=value.value;
						valueMin=value.min;
						valueMax=value.max;
					}
					this["attr_"+sNameAttr+"Perc"]=value;
					this["attr_"+sNameAttr+"PercMin"]=valueMin;
					this["attr_"+sNameAttr+"PercMax"]=valueMax;
					/*
					var valRef=this["attr_"+sNameRef];
					var valRefMin=this["attr_"+sNameRef+"Min"];
					var valRefMax=this["attr_"+sNameRef+"Max"];
					if (valRef!=""){
						if (value!=""){
							this["attr_"+sNameAttr]=value*valRef;
							this["attr_"+sNameAttr+"Min"]="";
							this["attr_"+sNameAttr+"Max"]="";
						} else {
							this["attr_"+sNameAttr]="";
							this["attr_"+sNameAttr+"Min"]=valueMin*valRef;
							this["attr_"+sNameAttr+"Max"]=valueMax*valRef;
						}
					} else {
						if (value!=""){
							this["attr_"+sNameAttr]="";
							this["attr_"+sNameAttr+"Min"]=value*valRefMin;
							this["attr_"+sNameAttr+"Max"]=value*valRefMax;
						} else {
							this["attr_"+sNameAttr]="";
							this["attr_"+sNameAttr+"Min"]=valueMin*valRefMin;
							this["attr_"+sNameAttr+"Max"]=valueMax*valRefMax;
						}
					}
					*/
				});
				this.functions.add("set"+sNameAttr,function(newValue){
					var value=newValue;
					var valueMin="";
					var valueMax="";
					if ((typeof value==="object") && (value.isObjValue==true)){
						this["attr_"+sNameAttr+"Margins"]=value.margins;
						value=value.value;
						valueMin=value.min;
						valueMax=value.max;
					}
					this["attr_"+vNameAttribute]=value;
					this["attr_"+vNameAttribute+"Min"]=valueMin;
					this["attr_"+vNameAttribute+"Max"]=valueMax;
					/*
					var valRef=this["attr_"+sNameRef];
					var valRefMin=this["attr_"+sNameRef+"Min"];
					var valRefMax=this["attr_"+sNameRef+"Max"];
					if (valRef!=""){
						if (value!=""){
							this["attr_"+vNameAttribute+"Perc"]=value/valRef;
							this["attr_"+vNameAttribute+"PercMin"]="";
							this["attr_"+vNameAttribute+"PercMax"]="";
						} else {
							this["attr_"+vNameAttribute+"Perc"]="";
							this["attr_"+vNameAttribute+"MinPerc"]=valueMin/valRef;
							this["attr_"+vNameAttribute+"Maxperc"]=valueMax/valRef;
						}
					} else {
						if (value!=""){
							this["attr_"+vNameAttribute+"Perc"]="";
							this["attr_"+vNameAttribute+"PercMin"]=value/valRefMax;
							this["attr_"+vNameAttribute+"PercMax"]=value/valRefMin;
						} else {
							this["attr_"+vNameAttribute]="";
							this["attr_"+vNameAttribute+"PercMin"]=valueMin/valRefMax;
							this["attr_"+vNameAttribute+"PercMax"]=valueMax/valRefMin;
						}
					}
					*/
				});
				this.functions.add("get"+sNameAttr,function(newValue){
					// sobreescribe el GET normal.... 
					var numResult="";
					var percResult="";
					var lstDocsResult=newHashMap();
					var lstDocsOrigin=newHashMap();
					var bWithoutDocs=true;
					
					// primero se evalua si hay algun Value fijado Value o [min,max]
					var valAttr=this["attr_"+sNameAttr];
					var valMin=this["attr_"+sNameAttr+"Min"];
					var valMax=this["attr_"+sNameAttr+"Max"];
					var nMargins=this["attr_"+sNameAttr+"Margins"]; 
					if (nMargins==""){
						nMargins=1;
					} else {
						//0,25 1+(0,12-0,25)=   0,12 ->-0,12
						nMargins=1+((nMargins/2)-nMargins)+(Math.random()*nMargins);
					}
					
					
					if (valAttr!=""){
						valAttr*=nMargins;
						numResult=valAttr;
					} else if ((valMin!="")&&(valMax!="")){
						numResult=rndMinMax(valMin*nMargins,valMax*nMargins,true);
					} else if (valMax!=""){
						numResult=rndMinMax(0,valMax*nMargins,true);
					} else if (valMin!=""){
						numResult=rndMinMax(valMin,valMin*nMargins*10,true);
					}
					
					var perc=1.0;
					if (numResult==""){
						// Sin no hay algun Value fijado Value o [min,max]... se mira a ver si hay un percent
						valAttr=this["attr_"+sNameAttr+"Perc"];
						valMin=this["attr_"+sNameAttr+"PercMin"];
						valMax=this["attr_"+sNameAttr+"PercMax"];
						if ((valAttr+""+valMin+""+valMax)==""){
							//log("no se ha establecido correctamente un percent en el field "+sNameAttr+"... se consideran todos");
						} else {
							if (valAttr!=""){
								perc=valAttr*nMargins;
							} else if ((valMin!="")&&(valMax!="")){
								perc=rndMinMax(valMin*nMargins,valMax*nMargins,true);
							} else if (valMax!=""){
								perc=rndMinMax(0,valMax*nMargins,true);
							} else if (valMin!=""){
								perc=rndMinMax(valMin,valMin*nMargins*10,true);
							}
						}
						percResult=perc;
					}
					
					// ya tenemos el percent y/o el Number... ahora hay que obtener la lista de documents.
					
					var proc=this.getProcedure();
					var nDocs=0;
					var nDocsOrigin=0;
					var typeDoc=this["get"+sNameAttr+"PhaseReference"]();
					var sPhase=this["get"+sNameAttr+"PhaseReference"]();
					var subPhase=this["get"+sNameAttr+"SubPhaseReference"]();

					if (!((sPhase=="")&&(typeDoc==""))){ // si esta definido algun elemento de Reference
						var fncAddDoc=function(auxDoc){
							lstDocsOrigin.add(auxDoc.id,auxDoc);
							nDocsOrigin++;
							if (percResult!=""){
								if (Math.random()<=percResult){
									lstDocsResult.add(auxDoc.id,auxDoc);
									nDocs++;
									bWithoutDocs=false;
								}
							}
						}
						if (sPhase!=""){
							var arrPhases=proc.getPhases().getValueByAttr("getType",arrPhases);
							for (var i=0;i<arrPhases.length;i++){
								var phase=arrPhases[i];
								if ((subPhase=="")
									||
									((subPhase!="")&&
									 (phase.getSubType()==subPhase))
									){
									var docs=phase.getDocuments();
									docs.walk(function(auxDoc){
										if (typeDoc==""){
											fncAddDoc(auxDoc);
										} else if (auxDoc.theObject.getType().id==typeDoc){
											fncAddDoc(auxDoc);
										}
									});
								}
							}
						} else {
							var docs=proc.getDocuments();
							docs.walk(function(auxDoc){
								if (typeDoc==""){
									fncAddDoc(auxDoc);
								} else if (auxDoc.theObject.getType().id==typeDoc){
									fncAddDoc(auxDoc);
								}
							});
						}
						lstDocsOrigin.swing();
						if (percResult!=""){
							numResult=nDocs;
						} else if (numResult!="") {
							if (numResult>nDocsOrigin){
								numResult=nDocsOrigin;
								percResult=1.0;
								lstDocsResult.documents=lstDocsOrigin; // se cogen todos
								bWithoutDocs=false;
							} else { // hay que coger un Number aleatorio
								percResult=numResult/nDocsOrigin;
								nDocs=0;
								lstDocsOrigin.walk(function(auxDoc){
									if (Math.random()<=percResult){
										lstDocsResult.add(auxDoc.id,auxDoc);
										nDocs++;
									}
								});
								lstDocsResult.swing();
								numResult=nDocs;
								bWithoutDocs=false;
							}
						} else {
							numResult=nDocsOrigin;
							percResult=1.0;
							lstDocsResult.documents=lstDocsOrigin; // se cogen todos
							bWithoutDocs=false;
						}
					}
					lstDocsResult.swing();
					lstDocsOrigin.swing();
					var objResult={
						number:numResult,
						percent:percResult,
						documents:lstDocsResult,
						documentsreference:lstDocsOrigin,
						withoutDocuments:bWithoutDocs
					};
					return objResult;
				});
			}
		}
	internal_getFactory(){
				return this.factory;
			}
	internal_setID(id){
				var factory=this.getFactory();
				var nodThis=factory.list.remove(this.id); // eliminamos del arbol el node 
				this.id=id;
				nodThis.key=id;
				factory.list.addNode(factory.list.root,nodThis);
				factory.list.nNodes++;
			}
	updateAttributesFunctions(factory){
			chronoStartFunction();

			if (this.attributes.nNodes>0){
				var nodAux=this.attributes.getFirst();
				while (nodAux!=""){
					if (nodAux.brothers.length>0){
						factory[nodAux.key]=nodAux.brothers[nodAux.brothers.length-1].value();
					} else {
						factory[nodAux.key]=nodAux.value();
					}
					nodAux=nodAux.next;
				}
			}
			if (this.functions.nNodes>0){
				var nodAux=this.functions.getFirst();
				while (nodAux!=""){
					if (nodAux.brothers.length>0){
						factory[nodAux.key]=nodAux.brothers[nodAux.brothers.length-1].value;
					} else {
						factory[nodAux.key]=nodAux.value;
					}
					nodAux=nodAux.next;
				}
			}
			chronoStopFunction();
		}
	newObject(sName){
			chronoStartFunction();
			var me=this;
			var sNewID=this.getNewId();
			var newObj={};
			newObj.id=sNewID;
			newObj.setID=this.internal_setID;
			newObj.execFunction=this.internal_execFunction;
			newObj.name=sName;
			newObj.factory=this;
			newObj.getFactory=this.internal_getFactory;
			newObj.getId=this.internal_getId;
			newObj.getName=this.internal_getName;
			newObj.generateTypes=this.generateTypes;
			
			this.list.add(newObj.id,newObj);
	/*		newObj.addAttributeList=this.objaddAttributeList;
			newObj.addAttribute=this.objaddAttribute;
			newObj.addAttributeWithPerc=this.objaddAttributeWithPerc;
	*/		

			this.updateAttributesFunctions(newObj);
			chronoStopFunction();
			return newObj;
		}
	new(name,id){
			chronoStartFunction();
			var objNew=this.newObject(name);
			if (typeof id!=="undefined"){
				objNew.setID(id);
			}
			if (isDefined(this.childConstructor)){
				objNew.theConstructor=this.childConstructor;
				objNew.theConstructor();
			} else {
				objNew.factory.executeParentMethod("childConstructor");
			}
			chronoStopFunction();
			return objNew;
		}
	processAllAttributes(attrsList,attrsValue,attrsPercs){
			this.addAttributeList(attrsList);
			this.addAttribute(attrsValue);
			this.addAttributeWithPerc(attrsPercs);
		}
	internal_execFunction(sNameFunction){
				if (typeof this["get"+sNameFunction+"Min"]!=="undefined"){
					return this["get"+sNameFunction+"Min"]();
				} else {
					return "";
				}
			}
	traceItem(obj,iDeep){
			var sCad=fillCharsLeft(3*iDeep,""," ");
			log(sCad+obj.id+"-"+obj.name);
			if (typeof obj.theObject!=="undefined"){
				obj=obj.theObject;
			}
			obj.factory.attrTypes.walk(function(attribute,iDeep){
				var sCad=fillCharsLeft(3*iDeep,""," ");
				var attrName=attribute.name;
				var attrType=attribute.type;
				
				if (attrType=="List"){
					var list=obj["get"+attrName+"s"]();
					log (sCad+"Attribute:"+attrName+" ["+attrType+"]:"+list.length());
					list.walk(obj.factory.traceItem,iDeep+1);
				} else if (attrType=="Reference"){
					var attrReference=attribute.reference;
					var vValue=obj["get"+attrName]();
					var vValueMin=obj.execFunction("get"+attrName+"Min");
					var vValueMax=obj.execFunction("get"+attrName+"Max");
					var vValueMargins=obj.execFunction("get"+attrName+"Margins");
					var vPercValue=obj["get"+attrName+"Perc"]();
					var vPercValueMin=obj["get"+attrName+"PercMin"]();
					var vPercValueMax=obj["get"+attrName+"PercMax"]();
					var vPercValueMargins=obj["get"+attrName+"PercMargins"]();
					log (sCad+"Attribute:"+attrName+" ["+attrType+"]:"+
								vValue+ "["+vValueMin+" -> "+vValueMax+"] "+ (vValueMargins*100).toFixed(2)+"%"
								+" percs:"+(attrReference==""?"":attrReference+" ")+(vPercValue*100).toFixed(2)+"%"
								+" ["+(vPercValueMin*100).toFixed(2)+"%"
								+" -> "+(vPercValueMax*100).toFixed(2)+"%] "
								+ (vPercValueMargins*100).toFixed(2)+"%");
				} else if (attrType=="Value"){
					var vValue=obj["get"+attrName]();
					var vValueMin=obj.execFunction("get"+attrName+"Min");
					var vValueMax=obj.execFunction("get"+attrName+"Max");
					var vValueMargins=obj.execFunction("get"+attrName+"Margins");
					if (typeof vValue.name!=="undefined"){
						vValue=vValue.id+" - "+vValue.name;
					}
					if ((vValue+""+vValueMin+""+vValueMax+""+ vValueMargins)!=""){
						log (sCad+"Attribute:"+attrName+" ["+attrType+"]:"+
									vValue+ "["+vValueMin+" -> "+vValueMax+"] "+ (vValueMargins*100).toFixed(2)+"%");
					}
				} else {
					log (sCad+"Attribute:"+attrName+" has no type:"+attrType);
				}
			},iDeep+1);
		}
	trace(iDeep){
			var iDeepAux=0;
			if (typeof iDeep!=="undefined"){
				iDeepAux=iDeep;
			}
			log("walk factory:"+this.name);
			this.list.walk(this.traceItem,iDeepAux);
			log("end walk factory:"+this.name);
		}
	getCell(row,col){
			var sCell=excelColRowToA1(col,row);
			var desired_cell = this[sCell];
			if (desired_cell){
				return desired_cell.v;
			}
			return "";
		}
	swing(){
			this.attrTypes.swing();
			this.list.swing();
			var me=this;
			this.attrTypes.walk(function(attribute){
				if (attribute.type=="List"){
					me["get"+attribute.name+"s"]().swing();
				}
			});
			
		}
	findByAttribute(attributeName,refValue,bCaseInsensitive,bWithoutAccents){
			var sValue=prepareComparation(refValue,bCaseInsensitive,bWithoutAccents);
			var arrResults=[];
			var item=this.list.getFirst();
			var sAux;
			while (item!=""){
				sAux=item.value["get"+attributeName]();
				sAux=prepareComparation(sAux,bCaseInsensitive,bWithoutAccents);
				if (sAux==sValue){
					arrResults.push(item.value);
				}
				item=item.next;
			}
			return arrResults;
		}
	configFromExcel(excelWorkBook){
			  var shtAct = excelWorkBook.Sheets[this.name];
			  shtAct.getCell=this.factory.getCell;
			  var iRow=4;
			  var iCol=0;
			  var sVal=shtAct.getCell(iRow,iCol);
			  var iColId=-1;
			  var iColname=-1;
			  var sPrevField="";
			  
			  var fieldReferences=newHashMap();

			  
			  while (sVal!=""){
				  if (sVal=="id"){
					  // si la columna es el id la marcamos.... los fields id y name existen por defecto en los elementos de las factorys
					  //iColId=iCol;
				  } else if (sVal=="name"){
					  // si la columna es el name la marcamos
					  //iColname=iCol;
				  } else {
					  // es el name de un field.... hay que identificar el type.
					  var sAttrType=shtAct.getCell(0,iCol);
					  var sAttrSubType=shtAct.getCell(1,iCol);
					  var sAttrDescription=shtAct.getCell(2,iCol);
					  var sAttrSubField=shtAct.getCell(3,iCol);
					  var sAttrName=sVal;
					  if (sAttrName=="AyudaAutomatizacion"){
						  log("Configurando:"+sAttrName);
					  }
					  if ((sAttrType=="Value")&& (sVal!=sPrevField)){
						 this.addAttribute(sAttrName,sAttrDescription,sAttrSubType);
						 if (sAttrSubType=="%"){
							 this.addAttribute(sAttrName+"Perc",sAttrDescription,sAttrSubType);
						 }
					  } else if ((sAttrType=="List")&& (sVal!=sPrevField)){
						 this.addAttributeList(sAttrName,sAttrDescription,sAttrSubType);
					  } else if (sAttrType=="Reference"){
//						 this.addAttributeWithPerc(sAttrName,sAttrDescription,sAttrSubType);
						 var field=fieldReferences.getValue(sAttrName);
						 if (field==""){
							field={
									type:sAttrType
									,field:sAttrName
									,subFields:newHashMap()
									};
							fieldReferences.add(sAttrName,field);
						 }
					     field.subFields.add(sAttrSubField,{
										subType:sAttrSubType
										,description:sAttrDescription
										});
					  }
				  }
				  iCol++;
				  sPrevField=sVal;
				  sVal=shtAct.getCell(iRow,iCol);
			  }
			  fieldReferences.traceAll();
			  fieldReferences.walk(function(fieldRef){
				    log("----- subFields de "+fieldRef.field+"-----");
					fieldRef.subFields.traceAll();
			  });
			  if (fieldReferences.nNodes>0){
				  var objRef=fieldReferences.getValue("NumDocumentsResult");
				  if (objRef!=""){
					  var subFields=objRef.subFields;
					  // primero obtenemos la Reference
					  var refTypeDoc="";
					  var objAux=subFields.getValue("TypeDocumentReference");
					  if (objAux!=""){
						  refTypeDoc=objAux;
					  }
					  var refPhase="";
					  objAux=subFields.getValue("PhaseReference");
					  if (objAux!=""){
						  refPhase=objAux;
					  }
					  var refSubPhase="";
					  objAux=subFields.getValue("SubPhaseReference");
					  if (objAux!=""){
						  refSubPhase=objAux;
					  }
					  var objReference={
						  typeDoc:refTypeDoc
						  ,phase:refPhase
						  ,subPhase:refSubPhase
					  }
					  var objNewField={nameAttribute:objRef.field
										,reference:objReference};
					  this.addAttributeWithPerc(objNewField,"temporal description","%");
					  fieldReferences.remove("NumDocumentsResult");
				 }
				 var me=this;
				 fieldReferences.walk(function(objRef){
					  var objNewField={nameAttribute:objRef.field
										,reference:""};
					  me.addAttributeWithPerc(objNewField,"temporal description","%");
				 });
			  }
			  this.list.clear();
			  this.attrTypes.swing();
			  this.attrTypes.traceAll();
			  this.updateAttributesFunctions(this);
		}
	loadFromExcel(excelWorkBook,sNameSheet){
			  var shtNameAux = this.name;
			  if (typeof sNameSheet!=="undefined"){
				  shtNameAux=sNameSheet;
			  }
			  var shtAct = excelWorkBook.Sheets[shtNameAux];
			  shtAct.getCell=this.factory.getCell;
			  var iRowFields=4;
			  var iRow=6;
			  var iCol=0;
			  var sVal=shtAct.getCell(iRow,iCol); // sVal es el ID
			  var sValName=shtAct.getCell(iRow,iCol+1); // name
			  var sIdField="";
			  var fixedField="";
			  if (shtAct.getCell(0,0)!=""){
				  var sIdField=shtAct.getCell(0,0);
				  var sValueField=shtAct.getCell(1,0);
				  var infoField=this.attrTypes.getValue(sIdField);
				  if (infoField==""){
					  log("El field "+sIdField+" no existe en la configuración de la factory " + factory.name);
					  alert("El field "+sIdField+" no existe en la configuración de la factory " + factory.name);
				  }
				  var sType=infoField.type;
				  var sSubType=infoField.subType;
				  fixedField={
						type:sType
						,subType:sSubType
						,field:sIdField
						,subFields:newHashMap()
						};
				 fixedField.subFields.add("",sValueField);
			  }
			  while ((sVal!="")||(sValName!="")){
				  sIdField=shtAct.getCell(iRowFields,iCol);
				  var sId="";
				  var sName="";
				  var fields=newHashMap();
				  if (fixedField!=""){
					  fields.add(fixedField.field,fixedField);
				  }
				  var arrValues=[];
				  while (sIdField!=""){
					  if (sVal!="") {
						  if (sIdField=="id"){
							  sId=sVal;
	//						  fields.add("id",sVal);
						  } else if (sIdField=="name"){
							  sName=sVal;
	//						  fields.add("name",sVal);
						  } else {
							  var field=fields.getValue(sIdField);
							  var sSubField=shtAct.getCell(iRowFields-1,iCol);
							  
							  var infoField=this.attrTypes.getValue(sIdField);
							  if (infoField==""){
								  log("El field "+sIdField+" no existe en la configuración de la factory " + factory.name);
								  alert("El field "+sIdField+" no existe en la configuración de la factory " + factory.name);
							  }
							  if (infoField.type=="Reference"){
								  log("Es una Reference");
							  }
							  var sType=infoField.type;
							  var sSubType=infoField.subType;
							  
							  if (field==""){
								  field={
										type:sType
										,subType:sSubType
										,field:sIdField
										,subFields:newHashMap()
										};
								  fields.add(sIdField,field);
							  } else {
								  sType=field.type;
								  sSubType=field.subType;
							  }
							  field.subFields.add(sSubField,sVal);
						  }
					  }
					  iCol++;
					  sIdField=shtAct.getCell(iRowFields,iCol);
					  sVal=shtAct.getCell(iRow,iCol);
				  }
//				  if ((sId!="")||(sName!="")){
				 if (sId==""){
					 sId=this.getNewId(this.name);
				 }
				 if (sName==""){
					 sName=this.name+"_"+sId;
				 }
				 var obj=this.new(sName,sId);
				 var node=fields.getFirst();
				 var idField;
				 var idSubField;
				 var vValue;
				 var field;
				 var subFields;
				 var subNode;
				 var type;
				 var subType;
				 
				 var bOnlyOneResult;
				 var bOneResultPerRequest;
				 var typeDocReference;
				 var phaseReference;
				 var subPhaseReference;
				 typeDocReference="";
				 phaseReference="";
				 subPhaseReference="";
				 while (node!=""){
					 bOnlyOneResult=false;
					 bOneResultPerRequest=true;
					 typeDocReference="";
					 phaseReference="";
					 subPhaseReference="";

					 idField=node.key;
					 idSubField="";
					 field=node.value;
					 type=field.type;
					 subType=field.subType;
					 subFields=field.subFields;
					 subNode=subFields.getFirst();
					 
					 
					 while (subNode!=""){
						 idSubField=subNode.key;
						 vValue=subNode.value;
						 if (vValue!=""){
							if (type=="Value"){
								if (subType=="Number"){
									obj["set"+idField+idSubField](parseFloat(vValue));
								}else if ((subType=="DateMonthDay")){
									obj["set"+idField+idSubField](vValue);
								}else if ((subType=="%")){
									obj["set"+idField+idSubField](vValue);
								}else if ((subType=="Formula")){
									obj["set"+idField+idSubField](vValue);
								}else if ((subType=="Text")||(subType=="")){
									obj["set"+idField+idSubField](vValue);
								} else if (subType.indexOf("[")<0) { // no es un array
									var oFactory=this.factory.getFactoryGlobal(subType+"s");
									if (oFactory!=""){
										var objRef=oFactory.getById(vValue);
										if (idField=="FormatoElectronico"){
											log(idField);
										}
										if (objRef==""){
											log("Error en fila ("+iCol+","+iRow+") al procesar la relacion con:"+vValue);
											alert("Error en fila ("+iCol+","+iRow+") al procesar la relacion con:"+vValue);
										} else {
											obj["set"+idField+idSubField](objRef);
										}
									} else {
										log("Error en fila ("+iCol+","+iRow+") al procesar no se localiza la factory:"+subType+"s");
										alert("Error en fila ("+iCol+","+iRow+") al procesar no se localiza la factory:"+subType+"s");
									}
								} else { // es un array JSON
									var arrValues=JSON.parse(subType);
									var bFound=false;
									var iVal=0;
									while ((!bFound)&&(iVal<arrValues.length)){
										if (arrValues[iVal]==vValue){
											bFound=true;
										}
										iVal++;
									}
									if (!bFound){
										log("Error en fila ("+iCol+","+iRow+") al procesar no se localiza el type:"+vValue+" en "+subType);
										alert("Error en fila ("+iCol+","+iRow+") al procesar no se localiza el type:"+vValue+" en "+subType);
									} else {
										obj["set"+idField+idSubField](vValue);
									}
								}
							} else if (type=="Reference"){
								obj["set"+idField+idSubField](vValue);
							}
						 }
						 subNode=subNode.next;
					 }
					 node=node.next;
				  }
				  iRow++;
				  iCol=0;
				  sVal=shtAct.getCell(iRow,iCol); // sVal es el ID
				  sValName=shtAct.getCell(iRow,iCol+1); // name
			  }
			  this.swing();
			  this.trace();
			  var me=this;
			  if (typeof sNameSheet==="undefined"){
				  this.attrTypes.walk(function(attAux){
					  if ((attAux.type=="Value")&&(typeof attAux.subType!=="undefined")){
						  if ((attAux.subType!="Number")
							  && (attAux.subType!="DateMonthDay")
							  && (attAux.subType!="Text")
							  && (attAux.subType.indexOf("[")<0)){ // es un theObject
							  var shtDetalle=me.name + "_" + attAux.subType;
							  var arrSheets=excelWorkBook.SheetNames;
							  var i=0;
							  for (var i=0;(i<arrSheets.length);i++){
								  var shtName=arrSheets[i];
								  if (shtName.indexOf(shtDetalle)>=0){ // la hoja tiene el text
									  me.loadFromExcel(excelWorkBook,shtName);
								  }
							  }
								  
						  }
					  }
				  });
			  }
		}

	loadFromExcelAsync(excelWorkBook,sNameSheet,parameters /*
																	{iRowIni:initial row,
																	 iColEmptyEnd:if column is empty end loading
																	 iColId:
																	 iColName:
																	 duos:[{nameAttribute:
																			 ,iColAttribute:
																			 }
																			]
																			*/
									,callback,fncRow,barrier){
			var fncEndCallback=callback;
			if (typeof barrier!=="undefined"){
				barrier.start(this);
			}

			var bCustomFunction=false;
			if (typeof fncRow!=="undefined"){
				bCustomFunction=true;
			}
			var iRow=parameters.iRowIni;
			var iColEmptyEnd=parameters.iColEmptyEnd;
			
			var shtNameAux = this.name;
			if (typeof sNameSheet!=="undefined"){
				shtNameAux=sNameSheet;
			}
			
			var iColId=-1;
			if (typeof parameters.iColId!=="undefined"){
				iColId=parameters.iColId;
			}
			
			var iColName=-1;
			if (typeof parameters.iColName!=="undefined"){
				iColName=parameters.iColName;
			}
			
			
			var shtAct = excelWorkBook.Sheets[shtNameAux];
			shtAct.getCell=factoryObjects.getCell;
			var self=this;
			var fncAsyncLoadRows=function(iRowAct){
				var vEmpty=shtAct.getCell(iRowAct,iColEmptyEnd); // sVal es el ID
				if (vEmpty==""){
					return true; //stop loading
				}
				var sId; //undefined
				if (iColId>=0) {
					sId=shtAct.getCell(iRowAct,iColId); // id
				}
				var sName;
				if (iColName>=0){
					sName=shtAct.getCell(iRowAct,iColName); // name
				}
				
				var newObj;
				if ((iColName>=0)||(iColId>=0)){
					newObj=self.new(sName,sId);
					for (var i=0;i<parameters.duos.length;i++) {
						var vAux=shtAct.getCell(iRowAct,parameters.duos[i].iColAttribute); 
						newObj["set"+parameters.duos[i].nameAttribute](vAux);
					}
				}
				if (bCustomFunction){
					fncRow(shtAct,iRowAct,newObj);
				}
			}
			var fncEndAsyncLoadRows=function(iIndAct,nPerformance,nDuration,iIndMax
												,sAuxUnits,nPerfTotal,nDurationTotal,nPerc,tEstimated){
				self.swing();
				if (typeof barrier!=="undefined"){
					setTimeout(function(){barrier.finish(self);});
				}
				if (typeof fncEndCallback!=="undefined"){
					fncEndCallback(iIndAct,nPerformance,nDuration,iIndMax,sAuxUnits,nPerfTotal,nDurationTotal,nPerc,tEstimated);
				}
			}
			processOffline(iRow,vUndef,fncAsyncLoadRows,"Rows ("+this.name+")",fncEndAsyncLoadRows,vUndef,3);
		}
	
	extend(objLib){
		var objBase=this;
    	objBase.parentFactorys.push(objLib);
		objBase.childConstructor=objLib.childConstructor;
/*		if (isDefined(objBase.childConstructor)){
			var fncOldChildConstructor=objBase.childConstructor;
			objBase.childConstructor=function(){
				fncOldChildConstructor();
				objLib.childConstructor();
			}
		} else {
		}
		*/
		
	}
	
	getParentAttribute(sAttName){
		var self=this;
		if(isUndefined(self.parentFactorys)) return "";
		for (var i=(self.parentFactorys.length-1);i>=0;i--){
			var factory=self.parentFactorys[i];
			if (isDefined(factory[sAttName])){
				return {object:factory,attribute:factory[sAttName]};
			}
		}
		return "";
	}
	getParentMethod(sMethodName){
		var self=this;
		var result=self.getParentAttribute(sMethodName);
		if (isMethod(result.attribute)){
			result.method=result.attribute;
			return result;
		}
		return "";
	}
	executeParentMethod(sMethodName,arrParameters){
		var fncParent=this.getParentMethod(sMethodName);
		var objResult="";
		if (fncParent!=""){
			objResult=fncParent.object[sMethodName].apply(this,arrParameters);
		}
		return objResult;
	}
	
	generateTypes(objParent){
		this.list.walk(function(dynObjType){
			if (isDefined(dynObjType.buildType)){
				dynObjType.buildType(objParent);
			} else {
				dynObjType.factory.executeParentMethod("buildType",[objParent]);
			}
		});
	}


/*	newpercent(sCampoReference,snewCampo){
		return {nameCamporeference:sCampoReference,
				nameAttribute:snewCampo
				};
	}
	newValue(Value,min,max,margins){
		return {isObjValue:true,
				Value:Value,
				min:min,
				max:max,
				margins:margins
				};
	}*/
}



function initMath(){
	var text=function(Value){
		return ""+Value;
	}
	var fncExists=function(Value, arrValues) {
		for (var i=0;i<arrValues._size[0];i++){
			if (arrValues._data[i]==Value){
				return true;
			}
		}
		return false;
	}
	var extractSymbols=function(initNode){
		var hsSymbols=newHashMap();
		var fncExtractSymbol=function(node){
			if (node.type=="SymbolNode"){
				if (!hsSymbols.exists(node.name)){
					hsSymbols.add(node.name,node.name);
				}
			}
			if (typeof node.args!=="undefined"){
				for (var i=0;i<node.args.length;i++){
					var arg=node.args[i];
					fncExtractSymbol(arg);
				}
			}
			if (typeof node.content!=="undefined"){
					fncExtractSymbol(node.content);
			}
		}
		fncExtractSymbol(initNode);
		return hsSymbols;
	}
	var genScope=function(hsSymbols,theObject){
		var newScope={};
		hsSymbols.walk(function(symbol){
			if (symbol=="TiempoTramitacion"){
			//	log(symbol);
			}
			var vSymbol="";
			var typeAttr=theObject.factory.attrTypes.getValue(symbol);
			if (typeAttr.type=="Value"){
				vSymbol=theObject["get"+symbol]();
				if (typeAttr.subType=="Date"){
					var DateAux=onlyDate(vSymbol);
					vSymbol=DateAux;
				} else if (!((typeAttr.subType=="Date")||
 							 (typeAttr.subType=="Number")||
							 (typeAttr.subType=="DateMonthDay")||
							 (typeAttr.subType.indexOf("[")>=0)|| //  es un array
							 (typeAttr.subType=="%"))){
					vSymbol=vSymbol.id;
				}
			} else if (typeAttr.type=="List") {
				vSymbol=theObject["get"+symbol+"s"]();
				var vLast=vSymbol.getLast();
				if (vLast!=""){
					vSymbol=vLast.key;
				}
			} else if (typeof theObject["get"+symbol]==="function"){
				vSymbol=theObject["get"+symbol]();
			} else {
				vSymbol="";
			}
			newScope[symbol]=vSymbol;
		});
		return newScope;
	}
	math.import({	
		  exists:fncExists
		  ,text:text
		  ,genScope:genScope
		  ,extractSymbols:extractSymbols
		});
}
initMath();


if (typeof baseDynamicObjectFactory==="undefined"){
	if (isInNodeJS()){
		global.baseDynamicObjectFactory=new factoryObjects();	
	} else {
		window["baseDynamicObjectFactory"]=new factoryObjects();
	}
}

class RCGDynamicObjectUtils{
	newDynamicObjectFactory(arrAttributeList,arrAttributes,arrAttributesPercs,globalName){
		var sName="";
		var isGlobal=false;
		if (isDefined(globalName)){
			isGlobal=true;
			sName=globalName;
		}
		var obj=baseDynamicObjectFactory.newFactory(sName,isGlobal,arrAttributeList,arrAttributes,arrAttributesPercs);
		return obj;
	}
	newDynamicObjectFactoryFromFile(sDefinitionFile,globalName){
		var objBase=newDynamicObjectFactory(undefined,undefined,undefined,globalName);
    	var vLib=require("../"+sDefinitionFile);
    	var objLib=new vLib(objBase);
    	objBase.extend(objLib);
		return objBase;
	}
}

registerClass(RCGDynamicObjectUtils);
