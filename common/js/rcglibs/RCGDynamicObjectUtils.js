'use strict';
var math = require('mathjs');
/*
All of the libs are allready loaded
var BaseUtils=require("./BaseUtils.js");
var StringUtils=require("./StringUtils.js");
var LogUtils=require("./LogUtils.js");
var ChronoUtils=require("./ChronoUtils.js");
var HashMapUtils=require("./HashMapUtils.js");
*/
class DynamicObject{
	constructor(theFactory,nombre,arrAtributosListado,arrAtributos,arrAtributosPorcs){
		var self=this;
		var factoria=theFactory;
		self.factoria=factoria;
		self.parentFactorys=[];
		self.parentFactorys.push(factoria);
		self.extend=factoria.extend;
		self.getParentAttribute=factoria.getParentAttribute;
		self.getParentMethod=factoria.getParentMethod;
		self.executeParentMethod=factoria.executeParentMethod;
		self.nombre=nombre;
		self.global=global;
		self.tiposAtributos=newHashMap(); // lista de nombres de atributos, tipo, etc
		self.atributos=newHashMap();  // lista total de atributos del Objeto
		self.funciones=newHashMap();  // lista de funciones asociadas al objeto
		self.listado=newHashMap();
		self.getById=factoria.getById;									
		self.get=factoria.get;
		self.findByAttribute=factoria.findByAttribute;
		self.interno_construyeId=factoria.interno_construyeId;			
		self.interno_getMaxId=factoria.interno_getMaxId;		
		self.interno_getId=factoria.interno_getId;
		self.interno_getNombre=factoria.interno_getNombre;
		self.getNewId=factoria.getNewId;
		self.interno_addIndividualAttr=factoria.interno_addIndividualAttr;
		self.addAtributo=factoria.addAtributo;
		self.addAtributoLista=factoria.addAtributoLista;			
		self.addAtributoWithPorc=factoria.addAtributoWithPorc;		
		self.interno_getFactoria=factoria.interno_getFactoria;			
		self.interno_setID=factoria.interno_setID;		
		self.updateAtributosFunciones=factoria.updateAtributosFunciones;
		self.newObject=factoria.newObject;
		self.nuevo=factoria.nuevo;							
		self.procesarTodosAtributos=factoria.procesarTodosAtributos;						
		self.trazaItem=factoria.trazaItem;
		self.traza=factoria.traza;
		self.balancear=factoria.balancear;
		self.configFromExcel=factoria.configFromExcel;
		self.loadFromExcel=factoria.loadFromExcel;
		self.loadFromExceAsync=factoria.loadFromExceAsync;
		self.generarTipos=factoria.generarTipos;
		self.interno_execFunction=factoria.interno_execFunction;
		self.vaciar=factoria.vaciar;
		var auxAttsListado=[];
		var auxAttsValor=[];
		var auxAttsPorcs=[];
		if (isDefined(arrAtributosListado)){
			auxAttsListado=arrAtributosListado;
		}
		if (isDefined(arrAtributos)){
			auxAttsValor=arrAtributos;
		}
		if (isDefined(arrAtributosPorcs)){
			auxAttsPorcs=arrAtributosPorcs;
		}
		self.procesarTodosAtributos(auxAttsListado,auxAttsValor,auxAttsPorcs);
	}
}

class FactoriaObjetos{
	constructor(){
		var self=this;
		self.nFactorias=0;
		self.hsFactoriasGlobales=newHashMap();
		
	}
	getFactoriaGlobal(nombre){
		return this.hsFactoriasGlobales.getValor(nombre);
	}
	addFactoriaGlobal(factoria){
		this.hsFactoriasGlobales.add(factoria.nombre,factoria);
	}
/*		,tiposAtributos:factoriaHashMaps.newHashMap()  // lista de Tipos de Atributo
		,atributos:factoriaHashMaps.newHashMap()  // lista total de atributos del Objeto
		,funciones:factoriaHashMaps.newHashMap()  // lista de funciones asociadas al objeto
		,listado:factoriaHashMaps.newHashMap()
*/		
	nuevaFactoria(nombre,isGlobal,arrAtributosListado,arrAtributos,arrAtributosPorcs){
		var self=this;
		var obj=new DynamicObject(self,nombre,arrAtributosListado,arrAtributos,arrAtributosPorcs);
		self.nFactorias++;
		if (isDefined(isGlobal)&&isGlobal){
			this.addFactoriaGlobal(obj);
		}
		return obj;
	}
	vaciar(){
			this.listado.vaciar();
	}
	interno_getId(){
			return this.id;
		}
	interno_getNombre(){
			return this.nombre;
		}
	getById(id){
			var nodo=this.listado.find(id);
			if (nodo!=""){
				return nodo.valor;
			}
			return nodo;
			//return getFromListaById(this.listado,id);re
		}
	get(ind){
			var nodo=this.listado.findByInd(ind);
			if (nodo!=""){
				return nodo.valor;
			}
			return nodo;
		}
	interno_construyeId(sIdBase,nId){
			var sNewId="";
			if (sIdBase!=""){
/*				if (nId==0){
					sNewId=sIdBase;
				} else {
					*/
					sNewId=sIdBase+"_"+fillLetrasLeft(6,nId);
//				}
			} else {
				sNewId=fillLetrasLeft(6,nId);
			}
			return sNewId;
		}
	interno_getMaxId(sIdBase,iLimiteInferior,iLimiteSuperior){
	//			log("GetMaxID:"+sIdBase+"[" + iLimiteInferior + "," + iLimiteSuperior+"]");
				if (iLimiteInferior>=iLimiteSuperior) {
					return iLimiteSuperior;
				}
				var nId=Math.floor((iLimiteSuperior-iLimiteInferior)/2)+iLimiteInferior;
				var sNewId=this.interno_construyeId(sIdBase,nId);
				if (this.getById(sNewId)=="") {
					return this.interno_getMaxId(sIdBase,iLimiteInferior,nId);
				} else {
					return this.interno_getMaxId(sIdBase,nId+1,iLimiteSuperior);
				}
			}
	getNewId(idBase){
			var nId=1;
			var sIdBase="";
			if (typeof idBase!=="undefined"){
				sIdBase=idBase;
			}
			var sNewId=sIdBase;
			var iLimSup=this.listado.length();
			var iLimInf=0;
			var me=this;
			var iLastId=this.interno_getMaxId(sIdBase,0,iLimSup);
			nId=iLastId-1;
			sNewId=this.interno_construyeId(sIdBase,iLastId);
			while (this.getById(sNewId)!="") {
				nId++;
				sNewId=this.interno_construyeId(sIdBase,nId);
			}
	//		log("LastID:"+iLastId +" nuevo ID:"+ sNewId);
			return sNewId;
		}
	procesaFormula(sFormula,objeto){
			var auxMathData=this["math_"+sOperacion];
			if (auxMathData.codigo==""){
				var expr=this["get"+sOperacion]()+"";
				expr=replaceAll(expr,"“",'"');
				expr=replaceAll(expr,"”",'"');
				var node = math.parse(expr);      // parse expression into a node tree
				var symbols= math.extractSymbols(node);
				var code = node.compile();        // compile the node tree
				auxMathData.nodoMath=node;
				auxMathData.codigo=code;
				auxMathData.simbolos=symbols;
		//		var result = code.eval([scope]);  // evaluate the code with an optional scope
			}
			var scope=math.genScope(auxMathData.simbolos,objeto);
			var result=auxMathData.codigo.eval(scope);
			return result;
		}

	interno_addIndividualAttr(vNombreAtributoDetail){
			this.atributos.add("attr_"+vNombreAtributoDetail,function(){return "";});
			this.funciones.add("get"+vNombreAtributoDetail,function(){
					var valAttr=this["attr_"+vNombreAtributoDetail];
					return valAttr;
				});
			this.funciones.add("set"+vNombreAtributoDetail,function(valAttr){
					this["attr_"+vNombreAtributoDetail]=valAttr;
				});
		}
		
	addAtributo(vNombreAtributo,vDescripcion,vTipoDato){
			if (typeof vNombreAtributo==="undefined") return;
			if (typeof vNombreAtributo==="string"){
				if (!this.tiposAtributos.exists(vNombreAtributo)){
					this.tiposAtributos.add(vNombreAtributo,{tipo:"Valor",nombre:vNombreAtributo,descripcion:vDescripcion,subTipo:vTipoDato});
				}
				this.interno_addIndividualAttr(vNombreAtributo);
				var bSinMinMaxHorq=true;
				var bFormula=(vTipoDato=="Formula");
				if ((vTipoDato=="Numero")||
					(vTipoDato=="Fecha")||
					(vTipoDato=="Formula")||
					(vTipoDato=="%")||
					(vTipoDato=="FechaDiaMes")
					){
					bSinMinMaxHorq=false;
				}
				if (!bSinMinMaxHorq){
					this.interno_addIndividualAttr(vNombreAtributo+"Min");
					this.interno_addIndividualAttr(vNombreAtributo+"Max");
					this.interno_addIndividualAttr(vNombreAtributo+"Horq");
				}
				this.funciones.add("get"+vNombreAtributo,function(param1){ // machaca la funcion por defecto
					var valAttr=this["attr_"+vNombreAtributo];
					var valMin="";
					var valMax="";
					var nHorquilla=0; 
					if (!bSinMinMaxHorq){
						valMin=this["attr_"+vNombreAtributo+"Min"];
						valMax=this["attr_"+vNombreAtributo+"Max"];
						nHorquilla=this["get"+vNombreAtributo+"Horq"](); 
					}

					if (typeof valAttr==="object") return valAttr;
					if ((valMin=="")&&(valMax=="")) {
						if (typeof valAttr==="string") return valAttr;
					}
					nHorquilla=1+((nHorquilla/2)-nHorquilla);
					if (valAttr==""){
						valMin=valMin*nHorquilla;
						valMax=valMax*nHorquilla;
						if ((valMin!="")&&(valMax!="")){
							return rndMinMax(valMin,valMax,true);
						} else if (valMax!=""){
							return rndMinMax(0,valMax*(1+(Math.random()*nHorquilla)),true);
						} else {
							return rndMinMax(valMin,valMin*10,true);
						}
					} else {
						return valAttr*nHorquilla;
					}
				});
				this.funciones.add("set"+vNombreAtributo,function(value){
					if (bFormula){
						this["attr_"+vNombreAtributo]={formula:value,nodoMath:"",codigo:"",simbolos:""};
					} else if ((typeof value==="object") && (value.isObjValor==true)){
						this["attr_"+vNombreAtributo]=value.valor;
						if (!bSinMinMaxHorq){
							this["attr_"+vNombreAtributo+"Min"]=value.min;
							this["attr_"+vNombreAtributo+"Max"]=value.max;
							this["attr_"+vNombreAtributo+"Horq"]=value.horquilla;
						}
					} else if ((vTipoDato!="Texto")&&(bSinMinMaxHorq)){ //es un objeto
						this["attr_"+vNombreAtributo]=value;
						var factoria=this.factoria;
						var nombreTipoSingular=factoria.nombre.substring(0,this.factoria.nombre.length-1);
						var sNombreFuncion="add"+nombreTipoSingular;
						var fncAdd=value[sNombreFuncion];
						if (typeof fncAdd!=="undefined"){
							value[sNombreFuncion](this);
						} else {
							sNombreFuncion="set"+nombreTipoSingular;
							var fncSet=value[sNombreFuncion];
							if (typeof fncSet!=="undefined"){
								value[sNombreFuncion](this);
							}
						}
					} else {
						this["attr_"+vNombreAtributo]=value;
						if (!bSinMinMaxHorq){
							this["attr_"+vNombreAtributo+"Min"]="";
							this["attr_"+vNombreAtributo+"Max"]="";
						}
					}
				});
				if (bFormula){
					this.funciones.add("eval"+vNombreAtributo,function(objeto){ 
						var valAttr=this["attr_"+vNombreAtributo];
/*						var tipoAttr=objeto.factoria.tiposAtributos.getValor(vNombreAtributo);
						if (tipoAttr.tipo=="Listado"){
							valAttr=this["get"+vNombreAtributo+"s"]();
							if (valAttr.length()>0){
								valAttr=valAttr.getPrimero().valor.id;
							} else {
								valAttr="";
							}
						}*/
						if (valAttr=="") return "";
						if (valAttr.formula=="") return "";
						if (valAttr.codigo==""){
							var expr=valAttr.formula+"";
							expr=replaceAll(expr,"“",'"');
							expr=replaceAll(expr,"”",'"');
							var node = math.parse(expr);      // parse expression into a node tree
							var symbols= math.extractSymbols(node);
							var code = node.compile();        // compile the node tree
							valAttr.nodoMath=node;
							valAttr.codigo=code;
							valAttr.simbolos=symbols;
							//var result = code.eval([scope]);  // evaluate the code with an optional scope
						}
						var scope=math.genScope(valAttr.simbolos,objeto); // param1 es un objeto 
						return valAttr.codigo.eval(scope);						
					});
				}
			} else if (Array.isArray(vNombreAtributo)){
				for (var i=0;i<vNombreAtributo.length;i++){
					if (typeof vNombreAtributo[i]==="string"){
						this.addAtributo(vNombreAtributo[i]);
					} else {
						this.addAtributo(vNombreAtributo[i].nombre,vNombreAtributo[i].descripcion,vNombreAtributo[i].tipo);
					}
				}
			}
		}
	addAtributoLista(vNombreAtributo,vDescripcion,vTipoDato){
			if (typeof vNombreAtributo==="undefined") return;
			var me=this;
			if (typeof vNombreAtributo==="string"){
				if (!this.tiposAtributos.exists(vNombreAtributo)){
					this.tiposAtributos.add
								(vNombreAtributo,
									{tipo:"Lista"
									,nombre:vNombreAtributo
									,descripcion:vDescripcion
									,subTipo:vTipoDato});
				}

				this.atributos.add("lista_"+vNombreAtributo+"s",function(){return newHashMap();});
				this.funciones.add("add"+vNombreAtributo,function(objVal){
					this["lista_"+vNombreAtributo+"s"].add(objVal.id,objVal);
					if (typeof objVal["listaPadres_"+me.nombre] === "undefined"){ //nombre de la factoria
						objVal["listaPadres_"+me.nombre]=newHashMap();
					}
					var nodAux=objVal["listaPadres_"+me.nombre].find(this.id);
					if (nodAux==""){
						objVal["listaPadres_"+me.nombre].add(this.id,this);
					}
					return objVal;
				});
				this.funciones.add("count"+vNombreAtributo+"s",function(){
					return this["lista_"+vNombreAtributo+"s"].nNodos;
				});
				this.funciones.add("get"+vNombreAtributo+"s",function(){
					return this["lista_"+vNombreAtributo+"s"];
				});
				this.funciones.add("get"+vNombreAtributo,function(indice){
					return this["lista_"+vNombreAtributo+"s"].findByInd(indice);
				});
				this.funciones.add("get"+vNombreAtributo+"ById",function(id){
					//return getFromListaById(this["lista"+vNombreAtributo+"s"],id);
					return this["lista_"+vNombreAtributo+"s"].getValor(id);
				});
			} else if (Array.isArray(vNombreAtributo)){
				for (var i=0;i<vNombreAtributo.length;i++){
					if (typeof vNombreAtributo[i]==="string"){
						this.addAtributo(vNombreAtributo[i]);
					} else {
						this.addAtributoLista(vNombreAtributo[i].nombre,vNombreAtributo[i].descripcion,vNombreAtributo[i].tipo);
					}
				}
			}
		}
	addAtributoWithPorc(vNombreAtributo,vDescripcion,vTipoDato){
			if (typeof vNombreAtributo==="undefined") return;
			if (typeof vNombreAtributo==="string"){
				this.addAtributo(vNombreAtributo); // atributo, min, max horq
			} else if (Array.isArray(vNombreAtributo)){
				for (var i=0;i<vNombreAtributo.length;i++){
					this.addAtributoWithPorc(vNombreAtributo[i].nombre,vNombreAtributo[i].descripcion,vNombreAtributo[i].tipo);
				}
			} else if (typeof vNombreAtributo==="object"){
				var objReferencia=/*{
						  tipoDoc:refTipoDoc
						  ,fase:refFase
						  ,subfase:refSubFase
					  }*/ vNombreAtributo.referencia;
				var sNombreAtr=vNombreAtributo.nombreAtributo;
				if (!this.tiposAtributos.exists(sNombreAtr)){
					this.tiposAtributos.add(sNombreAtr,
							{tipo:"Referencia",
							nombre:sNombreAtr,
							referencia:objReferencia,
							descripcion:vDescripcion,
							subTipo:vTipoDato});
				}
				this.addAtributo(sNombreAtr,vDescripcion,vTipoDato); //atributo mas min,max,horq
				this.addAtributo(sNombreAtr+"Porc",vDescripcion,vTipoDato); // porc min max horq
				this.interno_addIndividualAttr(sNombreAtr+"TipoDocumentoReferencia");
				this.interno_addIndividualAttr(sNombreAtr+"FaseReferencia");
//				this.interno_addIndividualAttr(sNombreAtr+"FaseReferencia");
				this.interno_addIndividualAttr(sNombreAtr+"SubFaseReferencia");
				this.interno_addIndividualAttr(sNombreAtr+"CargaPapel");
				this.interno_addIndividualAttr(sNombreAtr+"CargaElectronico");
				this.interno_addIndividualAttr(sNombreAtr+"CostePapel");
				this.interno_addIndividualAttr(sNombreAtr+"CosteElectronico");
				this.interno_addIndividualAttr(sNombreAtr+"TrabajoGestorPapel");
				this.interno_addIndividualAttr(sNombreAtr+"TrabajoGestorElectronico");
				this.funciones.add("set"+sNombreAtr+"Horq",function(value){
					this["attr_"+sNombreAtr+"Horq"]=value;
					this["attr_"+sNombreAtr+"PorcHorq"]=value;
				});
				//this["set"+sNombreAtr+"Horq"](0);
				this.funciones.add("set"+sNombreAtr+"Ref",function(newValue){
					/* new Value tiene que ser un objeto referencia
					{tipoDoc,fase,subfase}
					*/
					if (newValue==""){
						this["set"+sNombreAtr+"TipoDocumentoReferencia"]("");
						this["set"+sNombreAtr+"FaseReferencia"]("");
						this["set"+sNombreAtr+"SubFaseReferencia"]("");
					} else {
						var tipoDoc=newValue.tipoDoc;
						var fase=newValue.fase;
						var subfase=newValue.subfase;
						if (tipoDoc!=""){
							var objTipoDoc=tiposDocumento.getValor(tipoDoc);
							if (tipoDoc==""){
								log("El tipo de documento:"+tipoDoc+" no existe en la lista de tipos");
								alert("El tipo de documento:"+tipoDoc+" no existe en la lista de tipos");
								tiposDocumento.traza();
							}
							tipoDoc=objTipoDoc;
						}
						if (fase!=""){
							var proc=this.getProcedimiento();
							var fases=proc.getFases();
							var arrFases=[];
							fases.listado.recorrer(function(objFase){
								var bSeleccionado=false;
								if (objFase.getTipo()==fase){
									if (subfase==""){
										bSeleccionado=true;
									} else if (subfase==objFase.getSubTipo()){
										bSeleccionado=true;
									}
								}
								if ((bSeleccionado)&&(tipoDoc!="")){
									if (objFase.getTipoResultado().nombre!=tipoDoc.nombre){
										bSeleccionado=false;
									}
								}
								if (bSeleccionado){
									arrFases.push(objFase);
								}
								if (arrFases.length<=0){
									log("Existe un error en la identificacion de la fase:"+fase+" subfase:"+subfase);
									alert("Existe un error en la identificacion de la fase:"+fase+" subfase:"+subfase);
								} else {
									fase=arrFases;
								}
							});
						}
						this["set"+sNombreAtr+"TipoDocumentoReferencia"](tipoDoc);
						this["set"+sNombreAtr+"FaseReferencia"](fase);
						this["set"+sNombreAtr+"SubFaseReferencia"](subfase);
					}
				});
				this.funciones.add("set"+sNombreAtr+"Porc",function(newValue){
					var value=newValue;
					var valueMin="";
					var valueMax="";
					if ((typeof value==="object") && (value.isObjValor==true)){
						this["attr_"+sNombreAtr+"Horq"]=value.horquilla;
						value=value.valor;
						valueMin=value.min;
						valueMax=value.max;
					}
					this["attr_"+sNombreAtr+"Porc"]=value;
					this["attr_"+sNombreAtr+"PorcMin"]=valueMin;
					this["attr_"+sNombreAtr+"PorcMax"]=valueMax;
					/*
					var valRef=this["attr_"+sNombreRef];
					var valRefMin=this["attr_"+sNombreRef+"Min"];
					var valRefMax=this["attr_"+sNombreRef+"Max"];
					if (valRef!=""){
						if (value!=""){
							this["attr_"+sNombreAtr]=value*valRef;
							this["attr_"+sNombreAtr+"Min"]="";
							this["attr_"+sNombreAtr+"Max"]="";
						} else {
							this["attr_"+sNombreAtr]="";
							this["attr_"+sNombreAtr+"Min"]=valueMin*valRef;
							this["attr_"+sNombreAtr+"Max"]=valueMax*valRef;
						}
					} else {
						if (value!=""){
							this["attr_"+sNombreAtr]="";
							this["attr_"+sNombreAtr+"Min"]=value*valRefMin;
							this["attr_"+sNombreAtr+"Max"]=value*valRefMax;
						} else {
							this["attr_"+sNombreAtr]="";
							this["attr_"+sNombreAtr+"Min"]=valueMin*valRefMin;
							this["attr_"+sNombreAtr+"Max"]=valueMax*valRefMax;
						}
					}
					*/
				});
				this.funciones.add("set"+sNombreAtr,function(newValue){
					var value=newValue;
					var valueMin="";
					var valueMax="";
					if ((typeof value==="object") && (value.isObjValor==true)){
						this["attr_"+sNombreAtr+"Horq"]=value.horquilla;
						value=value.valor;
						valueMin=value.min;
						valueMax=value.max;
					}
					this["attr_"+vNombreAtributo]=value;
					this["attr_"+vNombreAtributo+"Min"]=valueMin;
					this["attr_"+vNombreAtributo+"Max"]=valueMax;
					/*
					var valRef=this["attr_"+sNombreRef];
					var valRefMin=this["attr_"+sNombreRef+"Min"];
					var valRefMax=this["attr_"+sNombreRef+"Max"];
					if (valRef!=""){
						if (value!=""){
							this["attr_"+vNombreAtributo+"Porc"]=value/valRef;
							this["attr_"+vNombreAtributo+"PorcMin"]="";
							this["attr_"+vNombreAtributo+"PorcMax"]="";
						} else {
							this["attr_"+vNombreAtributo+"Porc"]="";
							this["attr_"+vNombreAtributo+"MinPorc"]=valueMin/valRef;
							this["attr_"+vNombreAtributo+"MaxPorc"]=valueMax/valRef;
						}
					} else {
						if (value!=""){
							this["attr_"+vNombreAtributo+"Porc"]="";
							this["attr_"+vNombreAtributo+"PorcMin"]=value/valRefMax;
							this["attr_"+vNombreAtributo+"PorcMax"]=value/valRefMin;
						} else {
							this["attr_"+vNombreAtributo]="";
							this["attr_"+vNombreAtributo+"PorcMin"]=valueMin/valRefMax;
							this["attr_"+vNombreAtributo+"PorcMax"]=valueMax/valRefMin;
						}
					}
					*/
				});
				this.funciones.add("get"+sNombreAtr,function(newValue){
					// sobreescribe el GET normal.... 
					var numResult="";
					var porcResult="";
					var lstDocsResult=newHashMap();
					var lstDocsOrigen=newHashMap();
					var bSinDocs=true;
					
					// primero se evalua si hay algun valor fijado valor o [min,max]
					var valAttr=this["attr_"+sNombreAtr];
					var valMin=this["attr_"+sNombreAtr+"Min"];
					var valMax=this["attr_"+sNombreAtr+"Max"];
					var nHorquilla=this["attr_"+sNombreAtr+"Horq"]; 
					if (nHorquilla==""){
						nHorquilla=1;
					} else {
						//0,25 1+(0,12-0,25)=   0,12 ->-0,12
						nHorquilla=1+((nHorquilla/2)-nHorquilla)+(Math.random()*nHorquilla);
					}
					
					
					if (valAttr!=""){
						valAttr*=nHorquilla;
						numResult=valAttr;
					} else if ((valMin!="")&&(valMax!="")){
						numResult=rndMinMax(valMin*nHorquilla,valMax*nHorquilla,true);
					} else if (valMax!=""){
						numResult=rndMinMax(0,valMax*nHorquilla,true);
					} else if (valMin!=""){
						numResult=rndMinMax(valMin,valMin*nHorquilla*10,true);
					}
					
					var porc=1.0;
					if (numResult==""){
						// Sin no hay algun valor fijado valor o [min,max]... se mira a ver si hay un porcentaje
						valAttr=this["attr_"+sNombreAtr+"Porc"];
						valMin=this["attr_"+sNombreAtr+"PorcMin"];
						valMax=this["attr_"+sNombreAtr+"PorcMax"];
						if ((valAttr+""+valMin+""+valMax)==""){
							//log("no se ha establecido correctamente un porcentaje en el campo "+sNombreAtr+"... se consideran todos");
						} else {
							if (valAttr!=""){
								porc=valAttr*nHorquilla;
							} else if ((valMin!="")&&(valMax!="")){
								porc=rndMinMax(valMin*nHorquilla,valMax*nHorquilla,true);
							} else if (valMax!=""){
								porc=rndMinMax(0,valMax*nHorquilla,true);
							} else if (valMin!=""){
								porc=rndMinMax(valMin,valMin*nHorquilla*10,true);
							}
						}
						porcResult=porc;
					}
					
					// ya tenemos el porcentaje y/o el numero... ahora hay que obtener la lista de documentos.
					
					var proc=this.getProcedimiento();
					var nDocs=0;
					var nDocsOrigen=0;
					var tipoDoc=this["get"+sNombreAtr+"TipoDocumentoReferencia"]();
					var sFase=this["get"+sNombreAtr+"FaseReferencia"]();
					var subFase=this["get"+sNombreAtr+"SubFaseReferencia"]();

					if (!((sFase=="")&&(tipoDoc==""))){ // si esta definido algun elemento de referencia
						var fncAddDoc=function(auxDoc){
							lstDocsOrigen.add(auxDoc.id,auxDoc);
							nDocsOrigen++;
							if (porcResult!=""){
								if (Math.random()<=porcResult){
									lstDocsResult.add(auxDoc.id,auxDoc);
									nDocs++;
									bSinDocs=false;
								}
							}
						}
						if (sFase!=""){
							var arrFases=proc.getFases().getValorByAttr("getTipo",arrFases);
							for (var i=0;i<arrFases.length;i++){
								var fase=arrFases[i];
								if ((subFase=="")
									||
									((subFase!="")&&
									 (fase.getSubTipo()==subFase))
									){
									var docs=fase.getDocumentos();
									docs.recorrer(function(auxDoc){
										if (tipoDoc==""){
											fncAddDoc(auxDoc);
										} else if (auxDoc.objeto.getTipo().id==tipoDoc){
											fncAddDoc(auxDoc);
										}
									});
								}
							}
						} else {
							var docs=proc.getDocumentos();
							docs.recorrer(function(auxDoc){
								if (tipoDoc==""){
									fncAddDoc(auxDoc);
								} else if (auxDoc.objeto.getTipo().id==tipoDoc){
									fncAddDoc(auxDoc);
								}
							});
						}
						lstDocsOrigen.balancear();
						if (porcResult!=""){
							numResult=nDocs;
						} else if (numResult!="") {
							if (numResult>nDocsOrigen){
								numResult=nDocsOrigen;
								porcResult=1.0;
								lstDocsResult.documentos=lstDocsOrigen; // se cogen todos
								bSinDocs=false;
							} else { // hay que coger un numero aleatorio
								porcResult=numResult/nDocsOrigen;
								nDocs=0;
								lstDocsOrigen.recorrer(function(auxDoc){
									if (Math.random()<=porcResult){
										lstDocsResult.add(auxDoc.id,auxDoc);
										nDocs++;
									}
								});
								lstDocsResult.balancear();
								numResult=nDocs;
								bSinDocs=false;
							}
						} else {
							numResult=nDocsOrigen;
							porcResult=1.0;
							lstDocsResult.documentos=lstDocsOrigen; // se cogen todos
							bSinDocs=false;
						}
					}
					lstDocsResult.balancear();
					lstDocsOrigen.balancear();
					var objResult={
						numero:numResult,
						porcentaje:porcResult,
						documentos:lstDocsResult,
						documentosReferencia:lstDocsOrigen,
						sinDocumentos:bSinDocs
					};
					return objResult;
				});
			}
		}
	interno_getFactoria(){
				return this.factoria;
			}
	interno_setID(id){
				var factoria=this.getFactoria();
				var nodThis=factoria.listado.remove(this.id); // eliminamos del arbol el nodo 
				this.id=id;
				nodThis.clave=id;
				factoria.listado.addNodo(factoria.listado.raiz,nodThis);
				factoria.listado.nNodos++;
			}
	updateAtributosFunciones(factoria){
			chronoStartFunction();

			if (this.atributos.nNodos>0){
				var nodAux=this.atributos.getPrimero();
				while (nodAux!=""){
					if (nodAux.hermanos.length>0){
						factoria[nodAux.clave]=nodAux.hermanos[nodAux.hermanos.length-1].valor();
					} else {
						factoria[nodAux.clave]=nodAux.valor();
					}
					nodAux=nodAux.siguiente;
				}
			}
			if (this.funciones.nNodos>0){
				var nodAux=this.funciones.getPrimero();
				while (nodAux!=""){
					if (nodAux.hermanos.length>0){
						factoria[nodAux.clave]=nodAux.hermanos[nodAux.hermanos.length-1].valor;
					} else {
						factoria[nodAux.clave]=nodAux.valor;
					}
					nodAux=nodAux.siguiente;
				}
			}
			chronoStopFunction();
		}
	newObject(sNombre){
			chronoStartFunction();
			var me=this;
			var sNewID=this.getNewId();
			var newObj={};
			newObj.id=sNewID;
			newObj.setID=this.interno_setID;
			newObj.execFunction=this.interno_execFunction;
			newObj.nombre=sNombre;
			newObj.factoria=this;
			newObj.getFactoria=this.interno_getFactoria;
			newObj.getId=this.interno_getId;
			newObj.getNombre=this.interno_getNombre;
			newObj.generarTipos=this.generarTipos;
			
			this.listado.add(newObj.id,newObj);
	/*		newObj.addAtributoLista=this.objAddAtributoLista;
			newObj.addAtributo=this.objAddAtributo;
			newObj.addAtributoWithPorc=this.objAddAtributoWithPorc;
	*/		

			this.updateAtributosFunciones(newObj);
			chronoStopFunction();
			return newObj;
		}
	nuevo(nombre,id){
			chronoStartFunction();
			var objNew=this.newObject(nombre);
			if (typeof id!=="undefined"){
				objNew.setID(id);
			}
			if (isDefined(this.childConstructor)){
				objNew.theConstructor=this.childConstructor;
				objNew.theConstructor();
			} else {
				objNew.factoria.executeParentMethod("childConstructor");
			}
			chronoStopFunction();
			return objNew;
		}
	procesarTodosAtributos(attrsListado,attrsValor,attrsPorcs){
			this.addAtributoLista(attrsListado);
			this.addAtributo(attrsValor);
			this.addAtributoWithPorc(attrsPorcs);
		}
	interno_execFunction(sNombreFuncion){
				if (typeof this["get"+sNombreFuncion+"Min"]!=="undefined"){
					return this["get"+sNombreFuncion+"Min"]();
				} else {
					return "";
				}
			}
	trazaItem(obj,iProf){
			var sCad=fillLetrasLeft(3*iProf,""," ");
			log(sCad+obj.id+"-"+obj.nombre);
			if (typeof obj.objeto!=="undefined"){
				obj=obj.objeto;
			}
			obj.factoria.tiposAtributos.recorrer(function(atributo,iProf){
				var sCad=fillLetrasLeft(3*iProf,""," ");
				var attrNombre=atributo.nombre;
				var attrTipo=atributo.tipo;
				
				if (attrTipo=="Lista"){
					var listado=obj["get"+attrNombre+"s"]();
					log (sCad+"Atributo:"+attrNombre+" ["+attrTipo+"]:"+listado.length());
					listado.recorrer(obj.factoria.trazaItem,iProf+1);
				} else if (attrTipo=="Referencia"){
					var attrReferencia=atributo.referencia;
					var vValor=obj["get"+attrNombre]();
					var vValorMin=obj.execFunction("get"+attrNombre+"Min");
					var vValorMax=obj.execFunction("get"+attrNombre+"Max");
					var vValorHorq=obj.execFunction("get"+attrNombre+"Horq");
					var vPorcValor=obj["get"+attrNombre+"Porc"]();
					var vPorcValorMin=obj["get"+attrNombre+"PorcMin"]();
					var vPorcValorMax=obj["get"+attrNombre+"PorcMax"]();
					var vPorcValorHorq=obj["get"+attrNombre+"PorcHorq"]();
					log (sCad+"Atributo:"+attrNombre+" ["+attrTipo+"]:"+
								vValor+ "["+vValorMin+" -> "+vValorMax+"] "+ (vValorHorq*100).toFixed(2)+"%"
								+" Porcs:"+(attrReferencia==""?"":attrReferencia+" ")+(vPorcValor*100).toFixed(2)+"%"
								+" ["+(vPorcValorMin*100).toFixed(2)+"%"
								+" -> "+(vPorcValorMax*100).toFixed(2)+"%] "
								+ (vPorcValorHorq*100).toFixed(2)+"%");
				} else if (attrTipo=="Valor"){
					var vValor=obj["get"+attrNombre]();
					var vValorMin=obj.execFunction("get"+attrNombre+"Min");
					var vValorMax=obj.execFunction("get"+attrNombre+"Max");
					var vValorHorq=obj.execFunction("get"+attrNombre+"Horq");
					if (typeof vValor.nombre!=="undefined"){
						vValor=vValor.id+" - "+vValor.nombre;
					}
					if ((vValor+""+vValorMin+""+vValorMax+""+ vValorHorq)!=""){
						log (sCad+"Atributo:"+attrNombre+" ["+attrTipo+"]:"+
									vValor+ "["+vValorMin+" -> "+vValorMax+"] "+ (vValorHorq*100).toFixed(2)+"%");
					}
				} else {
					log (sCad+"Atributo:"+attrNombre+" no tiene tipo:"+attrTipo);
				}
			},iProf+1);
		}
	traza(iProf){
			var iProfAux=0;
			if (typeof iProf!=="undefined"){
				iProfAux=iProf;
			}
			log("Factoria:"+this.nombre);
			this.listado.recorrer(this.trazaItem,iProfAux);
			log("Fin Factoria:"+this.nombre);
		}
	getCell(row,col){
			var sCelda=excelColRowToA1(col,row);
			var desired_cell = this[sCelda];
			if (desired_cell){
				return desired_cell.v;
			}
			return "";
		}
	balancear(){
			this.tiposAtributos.balancear();
			this.listado.balancear();
			var me=this;
			this.tiposAtributos.recorrer(function(atributo){
				if (atributo.tipo=="Lista"){
					me["get"+atributo.nombre+"s"]().balancear();
				}
			});
			
		}
	findByAttribute(attributeName,refValue,bCaseInsensitive,bSinAcentos){
			var sValue=prepareComparation(refValue,bCaseInsensitive,bSinAcentos);
			var arrResults=[];
			var item=this.listado.getPrimero();
			var sAux;
			while (item!=""){
				sAux=item.valor["get"+attributeName]();
				sAux=prepareComparation(sAux,bCaseInsensitive,bSinAcentos);
				if (sAux==sValue){
					arrResults.push(item.valor);
				}
				item=item.siguiente;
			}
			return arrResults;
		}
	configFromExcel(excelWorkBook){
			  var shtAct = excelWorkBook.Sheets[this.nombre];
			  shtAct.getCell=this.factoria.getCell;
			  var iRow=4;
			  var iCol=0;
			  var sVal=shtAct.getCell(iRow,iCol);
			  var iColId=-1;
			  var iColNombre=-1;
			  var sCampoAnt="";
			  
			  var camposReferencia=newHashMap();

			  
			  while (sVal!=""){
				  if (sVal=="id"){
					  // si la columna es el id la marcamos.... los campos id y nombre existen por defecto en los elementos de las factorias
					  //iColId=iCol;
				  } else if (sVal=="nombre"){
					  // si la columna es el nombre la marcamos
					  //iColNombre=iCol;
				  } else {
					  // es el nombre de un campo.... hay que identificar el tipo.
					  var sAttrTipo=shtAct.getCell(0,iCol);
					  var sAttrSubTipo=shtAct.getCell(1,iCol);
					  var sAttrDescripcion=shtAct.getCell(2,iCol);
					  var sAttrSubCampo=shtAct.getCell(3,iCol);
					  var sAttrNombre=sVal;
					  if (sAttrNombre=="AyudaAutomatizacion"){
						  log("Configurando:"+sAttrNombre);
					  }
					  if ((sAttrTipo=="Valor")&& (sVal!=sCampoAnt)){
						 this.addAtributo(sAttrNombre,sAttrDescripcion,sAttrSubTipo);
						 if (sAttrSubTipo=="%"){
							 this.addAtributo(sAttrNombre+"Porc",sAttrDescripcion,sAttrSubTipo);
						 }
					  } else if ((sAttrTipo=="Listado")&& (sVal!=sCampoAnt)){
						 this.addAtributoLista(sAttrNombre,sAttrDescripcion,sAttrSubTipo);
					  } else if (sAttrTipo=="Referencia"){
//						 this.addAtributoWithPorc(sAttrNombre,sAttrDescripcion,sAttrSubTipo);
						 var campo=camposReferencia.getValor(sAttrNombre);
						 if (campo==""){
							campo={
									tipo:sAttrTipo
									,campo:sAttrNombre
									,subcampos:newHashMap()
									};
							camposReferencia.add(sAttrNombre,campo);
						 }
					     campo.subcampos.add(sAttrSubCampo,{
										subtipo:sAttrSubTipo
										,descripcion:sAttrDescripcion
										});
					  }
				  }
				  iCol++;
				  sCampoAnt=sVal;
				  sVal=shtAct.getCell(iRow,iCol);
			  }
			  camposReferencia.trazaTodo();
			  camposReferencia.recorrer(function(campoRef){
				    log("----- subcampos de "+campoRef.campo+"-----");
					campoRef.subcampos.trazaTodo();
			  });
			  if (camposReferencia.nNodos>0){
				  var objRef=camposReferencia.getValor("NumDocumentosResultado");
				  if (objRef!=""){
					  var subCampos=objRef.subcampos;
					  // primero obtenemos la referencia
					  var refTipoDoc="";
					  var objAux=subCampos.getValor("TipoDocumentoReferencia");
					  if (objAux!=""){
						  refTipoDoc=objAux;
					  }
					  var refFase="";
					  objAux=subCampos.getValor("FaseReferencia");
					  if (objAux!=""){
						  refFase=objAux;
					  }
					  var refSubFase="";
					  objAux=subCampos.getValor("SubFaseReferencia");
					  if (objAux!=""){
						  refSubFase=objAux;
					  }
					  var objReferencia={
						  tipoDoc:refTipoDoc
						  ,fase:refFase
						  ,subfase:refSubFase
					  }
					  var objNuevoCampo={nombreAtributo:objRef.campo
										,referencia:objReferencia};
					  this.addAtributoWithPorc(objNuevoCampo,"descripcion temporal","%");
					  camposReferencia.remove("NumDocumentosResultado");
				 }
				 var me=this;
				 camposReferencia.recorrer(function(objRef){
					  var objNuevoCampo={nombreAtributo:objRef.campo
										,referencia:""};
					  me.addAtributoWithPorc(objNuevoCampo,"descripcion temporal","%");
				 });
			  }
			  this.listado.vaciar();
			  this.tiposAtributos.balancear();
			  this.tiposAtributos.trazaTodo();
			  this.updateAtributosFunciones(this);
		}
	loadFromExcel(excelWorkBook,sNombreSheet){
			  var shtNombreAux = this.nombre;
			  if (typeof sNombreSheet!=="undefined"){
				  shtNombreAux=sNombreSheet;
			  }
			  var shtAct = excelWorkBook.Sheets[shtNombreAux];
			  shtAct.getCell=this.factoria.getCell;
			  var iRowCampos=4;
			  var iRow=6;
			  var iCol=0;
			  var sVal=shtAct.getCell(iRow,iCol); // sVal es el ID
			  var sValNombre=shtAct.getCell(iRow,iCol+1); // nombre
			  var sIdCampo="";
			  var campoFijo="";
			  if (shtAct.getCell(0,0)!=""){
				  var sIdCampo=shtAct.getCell(0,0);
				  var sValorCampo=shtAct.getCell(1,0);
				  var infoCampo=this.tiposAtributos.getValor(sIdCampo);
				  if (infoCampo==""){
					  log("El campo "+sIdCampo+" no existe en la configuración de la factoria " + factoria.nombre);
					  alert("El campo "+sIdCampo+" no existe en la configuración de la factoria " + factoria.nombre);
				  }
				  var sTipo=infoCampo.tipo;
				  var sSubTipo=infoCampo.subTipo;
				  campoFijo={
						tipo:sTipo
						,subtipo:sSubTipo
						,campo:sIdCampo
						,subcampos:newHashMap()
						};
				 campoFijo.subcampos.add("",sValorCampo);
			  }
			  while ((sVal!="")||(sValNombre!="")){
				  sIdCampo=shtAct.getCell(iRowCampos,iCol);
				  var sId="";
				  var sNombre="";
				  var campos=newHashMap();
				  if (campoFijo!=""){
					  campos.add(campoFijo.campo,campoFijo);
				  }
				  var arrValores=[];
				  while (sIdCampo!=""){
					  if (sVal!="") {
						  if (sIdCampo=="id"){
							  sId=sVal;
	//						  campos.add("id",sVal);
						  } else if (sIdCampo=="nombre"){
							  sNombre=sVal;
	//						  campos.add("nombre",sVal);
						  } else {
							  var campo=campos.getValor(sIdCampo);
							  var sSubCampo=shtAct.getCell(iRowCampos-1,iCol);
							  
							  var infoCampo=this.tiposAtributos.getValor(sIdCampo);
							  if (infoCampo==""){
								  log("El campo "+sIdCampo+" no existe en la configuración de la factoria " + factoria.nombre);
								  alert("El campo "+sIdCampo+" no existe en la configuración de la factoria " + factoria.nombre);
							  }
							  if (infoCampo.tipo=="Referencia"){
								  log("Es una Referencia");
							  }
							  var sTipo=infoCampo.tipo;
							  var sSubTipo=infoCampo.subTipo;
							  
							  if (campo==""){
								  campo={
										tipo:sTipo
										,subtipo:sSubTipo
										,campo:sIdCampo
										,subcampos:newHashMap()
										};
								  campos.add(sIdCampo,campo);
							  } else {
								  sTipo=campo.tipo;
								  sSubTipo=campo.subtipo;
							  }
							  campo.subcampos.add(sSubCampo,sVal);
						  }
					  }
					  iCol++;
					  sIdCampo=shtAct.getCell(iRowCampos,iCol);
					  sVal=shtAct.getCell(iRow,iCol);
				  }
//				  if ((sId!="")||(sNombre!="")){
				 if (sId==""){
					 sId=this.getNewId(this.nombre);
				 }
				 if (sNombre==""){
					 sNombre=this.nombre+"_"+sId;
				 }
				 var obj=this.nuevo(sNombre,sId);
				 var nodo=campos.getPrimero();
				 var idCampo;
				 var idSubCampo;
				 var vValor;
				 var campo;
				 var subCampos;
				 var subNodo;
				 var tipo;
				 var subtipo;
				 
				 var bUnSoloResultado;
				 var bUnResultadoPorSolicitud;
				 var tipoDocReferencia;
				 var faseReferencia;
				 var subfaseReferencia;
				 tipoDocReferencia="";
				 faseReferencia="";
				 subfaseReferencia="";
				 while (nodo!=""){
					 bUnSoloResultado=false;
					 bUnResultadoPorSolicitud=true;
					 tipoDocReferencia="";
					 faseReferencia="";
					 subfaseReferencia="";

					 idCampo=nodo.clave;
					 idSubCampo="";
					 campo=nodo.valor;
					 tipo=campo.tipo;
					 subtipo=campo.subtipo;
					 subCampos=campo.subcampos;
					 subNodo=subCampos.getPrimero();
					 
					 
					 while (subNodo!=""){
						 idSubCampo=subNodo.clave;
						 vValor=subNodo.valor;
						 if (vValor!=""){
							if (tipo=="Valor"){
								if (subtipo=="Numero"){
									obj["set"+idCampo+idSubCampo](parseFloat(vValor));
								}else if ((subtipo=="FechaDiaMes")){
									obj["set"+idCampo+idSubCampo](vValor);
								}else if ((subtipo=="%")){
									obj["set"+idCampo+idSubCampo](vValor);
								}else if ((subtipo=="Formula")){
									obj["set"+idCampo+idSubCampo](vValor);
								}else if ((subtipo=="Texto")||(subtipo=="")){
									obj["set"+idCampo+idSubCampo](vValor);
								} else if (subtipo.indexOf("[")<0) { // no es un array
									var oFactoria=this.factoria.getFactoriaGlobal(subtipo+"s");
									if (oFactoria!=""){
										var objRef=oFactoria.getById(vValor);
										if (idCampo=="FormatoElectronico"){
											log(idCampo);
										}
										if (objRef==""){
											log("Error en fila ("+iCol+","+iRow+") al procesar la relacion con:"+vValor);
											alert("Error en fila ("+iCol+","+iRow+") al procesar la relacion con:"+vValor);
										} else {
											obj["set"+idCampo+idSubCampo](objRef);
										}
									} else {
										log("Error en fila ("+iCol+","+iRow+") al procesar no se localiza la factoria:"+subtipo+"s");
										alert("Error en fila ("+iCol+","+iRow+") al procesar no se localiza la factoria:"+subtipo+"s");
									}
								} else { // es un array JSON
									var arrValores=JSON.parse(subtipo);
									var bEncontrado=false;
									var iVal=0;
									while ((!bEncontrado)&&(iVal<arrValores.length)){
										if (arrValores[iVal]==vValor){
											bEncontrado=true;
										}
										iVal++;
									}
									if (!bEncontrado){
										log("Error en fila ("+iCol+","+iRow+") al procesar no se localiza el tipo:"+vValor+" en "+subtipo);
										alert("Error en fila ("+iCol+","+iRow+") al procesar no se localiza el tipo:"+vValor+" en "+subtipo);
									} else {
										obj["set"+idCampo+idSubCampo](vValor);
									}
								}
							} else if (tipo=="Referencia"){
								obj["set"+idCampo+idSubCampo](vValor);
							}
						 }
						 subNodo=subNodo.siguiente;
					 }
					 nodo=nodo.siguiente;
				  }
				  iRow++;
				  iCol=0;
				  sVal=shtAct.getCell(iRow,iCol); // sVal es el ID
				  sValNombre=shtAct.getCell(iRow,iCol+1); // nombre
			  }
			  this.balancear();
			  this.traza();
			  var me=this;
			  if (typeof sNombreSheet==="undefined"){
				  this.tiposAtributos.recorrer(function(attAux){
					  if ((attAux.tipo=="Valor")&&(typeof attAux.subTipo!=="undefined")){
						  if ((attAux.subTipo!="Numero")
							  && (attAux.subTipo!="FechaDiaMes")
							  && (attAux.subTipo!="Texto")
							  && (attAux.subTipo.indexOf("[")<0)){ // es un objeto
							  var shtDetalle=me.nombre + "_" + attAux.subTipo;
							  var arrSheets=excelWorkBook.SheetNames;
							  var i=0;
							  for (var i=0;(i<arrSheets.length);i++){
								  var shtName=arrSheets[i];
								  if (shtName.indexOf(shtDetalle)>=0){ // la hoja tiene el texto
									  me.loadFromExcel(excelWorkBook,shtName);
								  }
							  }
								  
						  }
					  }
				  });
			  }
		}

	loadFromExcelAsync(excelWorkBook,sNombreSheet,parameters /*
																	{iRowIni:initial row,
																	 iColEmptyEnd:if column is empty end loading
																	 iColId:
																	 iColName:
																	 duplas:[{nombreAtributo:
																			 ,iColAtributo:
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
			
			var shtNombreAux = this.nombre;
			if (typeof sNombreSheet!=="undefined"){
				shtNombreAux=sNombreSheet;
			}
			
			var iColId=-1;
			if (typeof parameters.iColId!=="undefined"){
				iColId=parameters.iColId;
			}
			
			var iColName=-1;
			if (typeof parameters.iColName!=="undefined"){
				iColName=parameters.iColName;
			}
			
			
			var shtAct = excelWorkBook.Sheets[shtNombreAux];
			shtAct.getCell=factoriaObjetos.getCell;
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
					sName=shtAct.getCell(iRowAct,iColName); // nombre
				}
				
				var newObj;
				if ((iColName>=0)||(iColId>=0)){
					newObj=self.nuevo(sName,sId);
					for (var i=0;i<parameters.duplas.length;i++) {
						var vAux=shtAct.getCell(iRowAct,parameters.duplas[i].iColAtributo); 
						newObj["set"+parameters.duplas[i].nombreAtributo](vAux);
					}
				}
				if (bCustomFunction){
					fncRow(shtAct,iRowAct,newObj);
				}
			}
			var fncEndAsyncLoadRows=function(iIndAct,nRendimiento,nDuracion,iIndMaximo,sAuxUnidades,nRendTotal,nDuracionTotal,nPorc,tEstimado){
				self.balancear();
				if (typeof barrier!=="undefined"){
					setTimeout(function(){barrier.finish(self);});
				}
				if (typeof fncEndCallback!=="undefined"){
					fncEndCallback(iIndAct,nRendimiento,nDuracion,iIndMaximo,sAuxUnidades,nRendTotal,nDuracionTotal,nPorc,tEstimado);
				}
			}
			procesaOffline(iRow,vUndef,fncAsyncLoadRows,"Filas ("+this.nombre+")",fncEndAsyncLoadRows,vUndef,3);
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
	
	generarTipos(objParent){
		this.listado.recorrer(function(dynobjTipo){
			if (isDefined(dynobjTipo.generarTipo)){
				dynobjTipo.generarTipo(objParent);
			} else {
				dynobjTipo.factoria.executeParentMethod("generarTipo",[objParent]);
			}
		});
	}


/*	newPorcentaje(sCampoReferencia,sNuevoCampo){
		return {nombreCampoReferencia:sCampoReferencia,
				nombreAtributo:sNuevoCampo
				};
	}
	newValor(valor,min,max,horquilla){
		return {isObjValor:true,
				valor:valor,
				min:min,
				max:max,
				horquilla:horquilla
				};
	}*/
}



function initMath(){
	var texto=function(valor){
		return ""+valor;
	}
	var fncExists=function(valor, arrValores) {
		for (var i=0;i<arrValores._size[0];i++){
			if (arrValores._data[i]==valor){
				return true;
			}
		}
		return false;
	}
	var extractSymbols=function(nodoInicial){
		var hsSymbols=newHashMap();
		var fncExtractSymbol=function(nodo){
			if (nodo.type=="SymbolNode"){
				if (!hsSymbols.exists(nodo.name)){
					hsSymbols.add(nodo.name,nodo.name);
				}
			}
			if (typeof nodo.args!=="undefined"){
				for (var i=0;i<nodo.args.length;i++){
					var arg=nodo.args[i];
					fncExtractSymbol(arg);
				}
			}
			if (typeof nodo.content!=="undefined"){
					fncExtractSymbol(nodo.content);
			}
		}
		fncExtractSymbol(nodoInicial);
		return hsSymbols;
	}
	var genScope=function(hsSymbols,objeto){
		var newScope={};
		hsSymbols.recorrer(function(simbolo){
			if (simbolo=="TiempoTramitacion"){
			//	log(simbolo);
			}
			var vSimbolo="";
			var tipoAttr=objeto.factoria.tiposAtributos.getValor(simbolo);
			if (tipoAttr.tipo=="Valor"){
				vSimbolo=objeto["get"+simbolo]();
				if (tipoAttr.subTipo=="Fecha"){
					var fechaAux=soloFecha(vSimbolo);
					vSimbolo=fechaAux;
				} else if (!((tipoAttr.subTipo=="Fecha")||
 							 (tipoAttr.subTipo=="Numero")||
							 (tipoAttr.subTipo=="FechaDiaMes")||
							 (tipoAttr.subTipo.indexOf("[")>=0)|| //  es un array
							 (tipoAttr.subTipo=="%"))){
					vSimbolo=vSimbolo.id;
				}
			} else if (tipoAttr.tipo=="Lista") {
				vSimbolo=objeto["get"+simbolo+"s"]();
				var vUltimo=vSimbolo.getUltimo();
				if (vUltimo!=""){
					vSimbolo=vUltimo.clave;
				}
			} else if (typeof objeto["get"+simbolo]==="function"){
				vSimbolo=objeto["get"+simbolo]();
			} else {
				vSimbolo="";
			}
			newScope[simbolo]=vSimbolo;
		});
		return newScope;
	}
	math.import({
		  exists:fncExists
		  ,texto:texto
		  ,genScope:genScope
		  ,extractSymbols:extractSymbols
		});
}
initMath();


if (isUndefined(global.baseDynamicObjectFactory)){
	global.baseDynamicObjectFactory=new FactoriaObjetos();	
}
 

class DynamicObjectUtils{
	newDynamicObjectFactory(arrAtributosListado,arrAtributos,arrAtributosPorcs,globalName){
		var sName="";
		var isGlobal=false;
		if (isDefined(globalName)){
			isGlobal=true;
			sName=globalName;
		}
		var obj=baseDynamicObjectFactory.nuevaFactoria(sName,isGlobal,arrAtributosListado,arrAtributos,arrAtributosPorcs);
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

module.exports=DynamicObjectUtils;