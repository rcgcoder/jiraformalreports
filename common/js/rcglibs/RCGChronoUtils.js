'use strict';
var process = require('process');
var BaseUtils=require("./BaseUtils.js");
var StringUtils=require("./StringUtils.js");
var LogUtils=require("./LogUtils.js");

class ChronoInfo{
	constructor(process){
		var self=this;
		self.process=process;
		self.start=0;
		self.desperdiciado=0;
		self.ciclo=0;
		self.startCiclo=0;
	}
	run(tInicioDesperdiciado){
		if (!this.process.enabled) return;
		var auxDesperdiciado=tInicioDesperdiciado;
		var tNow=new Date().getTime();
		if (isUndefined(tInicioDesperdiciado)){
			this.start=tNow;
			auxDesperdiciado=this.start;
		} else {
			this.start=tInicioDesperdiciado;
			auxDesperdiciado=tInicioDesperdiciado;
		}
		this.startCiclo=this.start;
		tNow=new Date().getTime();
		this.desperdiciado=(tNow-auxDesperdiciado);
	}
    newCiclo(){
	   if (!this.process.enabled) return;
	   this.ciclo++;
	   this.startCiclo=new Date().getTime();
    }
    getCuantoLleva(){
		if (!this.process.enabled) return;
		var tActual=new Date().getTime();
		var tLleva=tActual-this.start;
		return tLleva;
    }
    getCuantoLlevaCiclo(){
		if (!this.process.enabled) return;
		var tActual=new Date().getTime();
		var tLlevaCiclo=tActual-this.startCiclo;
		return tLlevaCiclo;
    }
}

class Chrono{
	constructor(sNombreCompleto,sNombre,nivelAnidamiento,padre){
		var self=this;
		self.nombre=sNombreCompleto;
		self.nombreCorto=sNombre;
		self.acumulado=0;
		self.cronos=[];
		self.profundidad=0;
		self.veces=0;
		self.anidamiento=nivelAnidamiento+0;
		self.padre=padre;
		self.hijos=[];
		self.desperdiciado=0;
	}
	getTotalDesperdiciado(){
		var iDesp=this.desperdiciado;
		for (var i=0;i<this.hijos.length;i++){
			iDesp+=this.hijos[i].getTotalDesperdiciado();
		}
		return iDesp;
	}
}

class processChronos{
	constructor(enabled,withInfoAuxiliar,withNombreCompleto,listaProfundidadMaxima){
		var self=this;
		self.enabled=enabled;
		self.withNombreCompleto=withNombreCompleto;
		self.withInfoAuxiliar=withInfoAuxiliar;
		self.listaProfundidadMaxima;
		self.prependNumCronos=false;
		self.totalCronos=0;
		self.tTotal=0;
		self.cronosOpen=[];
		self.pathChrono="";
		self.allCronos=[];
		self.lastCrono=[];
		self.mapCronos={};
		self.nivelAnidamiento=0;
	}
	prepareNames(nombre,sInfoAuxiliar){
		var sNombreCompleto="";
		var sNombre=nombre;
		if (this.prependNumCronos) {
			sNombre=fillLetrasLeft(5,this.totalCronos)+"_"+sNombre;
		}
		if ((this.withInfoAuxiliar)&&(isDefined(sInfoAuxiliar))){
			sNombre+="_"+sInfoAuxiliar;
		}
		this.nivelAnidamiento++;
		if (this.withNombreCompleto){
			this.totalCronos++;
			this.cronosOpen.push(this.pathChrono);
			sNombreCompleto=this.pathChrono;
			sNombreCompleto+="_"+sNombre;
			this.pathChrono=sNombreCompleto;
		} else {
			sNombreCompleto=sNombre;
		}
		return [sNombre,sNombreCompleto];
	}
	chronoStartFunction(sInfoAuxiliar,nIndex){
		var newIndex=1
		if (isDefined(nIndex)){
			newIndex+=nIndex;
		}
		return this.chronoStart("",sInfoAuxiliar,newIndex);
	}
	chronoStopFunction(){
		var newIndex=1
		if (isDefined(nIndex)){
			newIndex+=nIndex;
		}
		return this.chronoStop("",newIndex);
	}
	chronoStart(theName,sInfoAuxiliar,iFuncName){
		if (!this.enabled) return;
		var tInicio=new Date().getTime();
		var nombre=theName;
		if (isDefined(iFuncName)){
			nombre=getFunctionName(iFuncName+1);
		} 
		var arrNames=this.prepareNames(nombre,sInfoAuxiliar);
		var sNombre=arrNames[0];
		var sNombreCompleto=arrNames[1];
		if (isUndefined(this.mapCronos[sNombreCompleto])){
			var padre="";
			if (this.cronosOpen.length>0){
				padre=this.cronosOpen[this.cronosOpen.length-1];
				if (padre!=""){
					padre=this.mapCronos[padre];
				}
			}
			this.mapCronos[sNombreCompleto]=new Chrono(sNombreCompleto,
														sNombre,
														this.nivelAnidamiento,
														padre);
			if (padre!=""){
				padre.hijos.push(this.mapCronos[sNombreCompleto]);
			}
			
			this.allCronos.push(this.mapCronos[sNombreCompleto]);
		}
		var acumCronos=this.mapCronos[sNombreCompleto];
		this.lastCrono.push(acumCronos);
		var cronos=acumCronos.cronos;
		var crono=new ChronoInfo(this);
		cronos.push(crono);
		if (cronos.length>acumCronos.profundidad){
			acumCronos.profundidad=cronos.length;
		}
		crono.run(tInicio);
		return crono;
	}
	chronoStop(theName,iFuncName){
		if (!this.enabled) return;
		var tInicio=new Date().getTime();
		var nombre=theName;
		if (isDefined(iFuncName)){
			nombre=getFunctionName(iFuncName+1);
		} 
		var lastChrono=this.lastCrono.pop();
		var sNombre=lastChrono.nombreCorto;
		if (isDefined(nombre)){
			if (nombre!=sNombre){
				log("Error haciendo Stop. Nombre:"+nombre+" lastCrono Nombre Corto:"+sNombre);
			}
			sNombre=lastChrono.nombre;
		}
		var sNombreCompleto="";
		this.nivelAnidamiento--;
		if (this.withNombreCompleto){
			sNombreCompleto=this.pathChrono;
			this.pathChrono=this.cronosOpen.pop();
		} else {
			sNombreCompleto=sNombre;
		}
		
		var acumCronos=this.mapCronos[sNombreCompleto];
		acumCronos.veces++;
		
		var cronos=acumCronos.cronos;
		var crono=cronos.pop();
		var timeAct=new Date().getTime();
		var tResult=timeAct-crono.start;
		acumCronos.acumulado+=tResult;
		acumCronos.desperdiciado+=((timeAct-tInicio)+crono.desperdiciado);
		if (acumCronos.acumulado<acumCronos.desperdiciado){
			log("No coinciden");
		}
		return tResult;
	}
}

class ChronoFactory{
	constructor(){
		var self=this;
		self.chronos=[];
		self.enabled=false;
		self.listaSoloRaices=true;
		self.withNombreCompleto=true;
		self.withInfoAuxiliar=false;
		self.listaProfundidadMaxima=100;
	}
	getChronos(){
		var self=this;
		var sPID=process.pid;
		var pChronos;
		if (isUndefined(self.chronos[sPID])){
			pChronos=new processChronos(self.enabled,self.withInfoAuxiliar,self.withNombreCompleto);
			self.chronos[sPID]=pChronos;
		} else {
			pChronos=self.chronos[sPID];
		}
		return pChronos;
	}
	clearChronos(){
		var sPID=process.pid;
		this.chronos[sPID]=undefinedValue;
	}
	chronoStartFunction(sInfoAuxiliar,nIndex){
		var newIndex=1
		if (isDefined(nIndex)){
			newIndex+=nIndex;
		}
		return this.getChronos().chronoStart("",sInfoAuxiliar,newIndex);
	}
	chronoStopFunction(nIndex){
		var newIndex=1
		if (isDefined(nIndex)){
			newIndex+=nIndex;
		}
		return this.getChronos().chronoStop("",newIndex);
	}
	chronoStart(nombre,sInfoAuxiliar){
		return this.getChronos().chronoStart(nombre,sInfoAuxiliar);
	}
	chronoStop(nombre){
		return this.getChronos().chronoStop(nombre);
	}
	traceBlock(sLabel,sValue,sMeasure){
		var sRowSeparator=", ";
		var sFieldSeparator="";
		return sRowSeparator
				+sFieldSeparator+(isDefined(sLabel)?sLabel+":":"")
				+sFieldSeparator+(isDefined(sValue)?sValue:"")
				+sFieldSeparator+(isDefined(sMeasure)?sMeasure:"");
	}
	listaCrono(acumCronos){
		if (!this.enabled) return;
		var pChronos=this.getChronos();
		var nMultip=0;
		var porcPadre=0;
		var porcTotal=0;
		var sTabs=" ";
		var padre=acumCronos.padre;
		var iProf=1;
		if (padre!=""){		
			porcPadre=(acumCronos.acumulado/padre.acumulado);
			nMultip=acumCronos.veces/padre.veces;
			var cronoPadre=padre;
			while (cronoPadre!=""){
				iProf++;				
				sTabs+="   ";
				cronoPadre=cronoPadre.padre;
			}
		} 
		var tDespTotal=acumCronos.getTotalDesperdiciado();
		var tDespHijos=tDespTotal-acumCronos.desperdiciado;
		
		porcTotal=acumCronos.acumulado/pChronos.tTotal;
				
		var tReal=acumCronos.acumulado-tDespTotal;
		var porcDesp=tDespTotal/acumCronos.acumulado;
		
		var sLog=sTabs+ acumCronos.nombreCorto+" ("+acumCronos.veces+"),";
		sLog+=this.traceBlock("Operaciones",acumCronos.veces);
		sLog+=this.traceBlock("T Real",inSeconds(tReal,false));
		sLog+=this.traceBlock("T Acum",inSeconds(acumCronos.acumulado,false));
		sLog+=this.traceBlock("% Acum",inPercent(porcTotal));
		sLog+=this.traceBlock("T Desp",inSeconds(tDespTotal,false));
		if (acumCronos.hijos.length>0){
			sLog+=this.traceBlock("T Desp Hijos",inSeconds(tDespHijos,false));
		} else {
			sLog+=this.traceBlock();
		}
		sLog+=this.traceBlock("% Desp",inPercent(porcDesp));
		if (padre!=""){
			sLog+=this.traceBlock("% Padre",inPercent(porcPadre));
			sLog+=this.traceBlock("Multip",nMultip.toFixed(2));
		} else {
			sLog+=this.traceBlock();
			sLog+=this.traceBlock();
		}
		sLog+=this.traceBlock("Rend Real(op/s)",(acumCronos.veces*1000/tReal).toFixed(2),"op/s");
		sLog+=this.traceBlock("Rend Real(ms/op)",(tReal/acumCronos.veces).toFixed(5),"ms/op");
		sLog+=this.traceBlock("Rend (op/s)",(acumCronos.veces*1000/acumCronos.acumulado).toFixed(2),"op/s");
		sLog+=this.traceBlock("Rend (ms/op)",(acumCronos.acumulado/acumCronos.veces).toFixed(5),"ms/op");
		sLog+=this.traceBlock("Deep Max",acumCronos.profundidad);
		sLog+=this.traceBlock("Act",acumCronos.cronos.length);
		sLog+=this.traceBlock("Anid",acumCronos.anidamiento);
		sLog=replaceAll(sLog, "\\.", ","); 
		log(sLog);
		if (iProf<=this.listaProfundidadMaxima) {
			for (var i=0;i<acumCronos.hijos.length;i++){
				this.listaCrono(acumCronos.hijos[i]);
			}
		}
	}
	listar(){
		if (!this.enabled) return;
		var tTotal=0;
		var pChronos=this.getChronos();
		for (var i=0;i<pChronos.allCronos.length;i++){
			var acumCronos=pChronos.allCronos[i];
			if (acumCronos.padre==""){
				tTotal+=acumCronos.acumulado;
			}
		}
		pChronos.tTotal=tTotal;
		log("Listando "+pChronos.allCronos.length +" cronometros ("+inSeconds(tTotal)+")");
/*		this.allCronos.sort(function(a,b){
			if (this.withNombreCompleto) {
				if (a.nombre<b.nombre){
					return -1;
				} else if (a.nombre>b.nombre){
					return +1;
				} 
				return 0;
			} else {
				if (a.acumulado<b.acumulado){
					return 1;
				} else if (a.acumulado>b.acumulado){
					return -1;
				} 
				return 0;
			}
		});
	*/		

		for (var i=0;i<pChronos.allCronos.length;i++){
			var acumCronos=pChronos.allCronos[i];
			var padre=acumCronos.padre;
			if (padre==""){
				this.listaCrono(acumCronos);
			}
		}
	}
}
if (isUndefined(global.chronoFactory)){
	global.chronoFactory=new ChronoFactory();
}

class ChronoUtils{
	constructor(){
		log("Creating ChronoUtils");
	}
	chronoStartFunction(sInfoAuxiliar){
		return chronoFactory.chronoStartFunction(sInfoAuxiliar,1);
	}
	chronoStopFunction(){
		return chronoFactory.chronoStopFunction(1);
	}
	chronoStart(sNombre,sExtraInfo){
//		log("Start Chrono:"+sNombre);
		chronoFactory.chronoStart(sNombre,sExtraInfo);
	}
	chronoStop(sNombre){
//		log("Stop Chrono:"+sNombre);
		chronoFactory.chronoStop(sNombre);
	}
	chronoList(acumChronos){
//		log("List Chronos");
		if (isDefined(acumChronos)){
			chronoFactory.listaCrono(acumChronos);
		} else {
			chronoFactory.listar();
		}
	}
	chronoEnable(){
		chronoFactory.enabled=true;
	}
	chronoDisable(){
		chronoFactory.enabled=false;
	}
}

module.exports=ChronoUtils;