var newBillingObject=function (){
	    var fncNewDesgloseImportes=function(vTotal,vIdent,vAprob,vDis,vImp,vDesp){
	    	var desgloseImportes={"Total":(isDefined(vTotal)?vTotal:0)
	    						  ,"Identificado":(isDefined(vIdent)?vIdent:0)
	    						  ,"Aprobado":(isDefined(vAprob)?vAprob:0)
	    						  ,"Disenado":(isDefined(vDis)?vDis:0)
	    						  ,"Implementado":(isDefined(vImp)?vImp:0)
	    						  ,"Desplegado":(isDefined(vDesp)?vDesp:0)
	    						  };
	    	return desgloseImportes;
	    }
    	var objImportes={};
    	objImportes.source={
				  timeoriginalestimate:"",
				  timeestimate:"",
				  timespent:"",
				  faseActual:"",
				  status:"",
				  created:"",
			      hourCost:0,
			      minFacturableFase:4,
			      atDatetime:0,
				  importesEstimados:fncNewDesgloseImportes(),
				  importesReales:fncNewDesgloseImportes(),
				  bImportesRealesBlanco:false,
				  bImportesRealesCero:false,
				  bImportesRealesUndefined:false,
				  bIncrementadaEstimacion:false,
				  acumFasesEstimado:0,
				  acumFasesReal:0
				};
    	objImportes.importesEstimadosPercs=fncNewDesgloseImportes(1,0,0,0.1,0.8,0.1);
		objImportes.importesPorcentajeRef=fncNewDesgloseImportes(1,0,0,0.1,0.8,0.1);
		objImportes.importesEstimados=fncNewDesgloseImportes();
		objImportes.importesReales=fncNewDesgloseImportes();
		objImportes.importesdefinidos={importesEstimados:fncNewDesgloseImportes(false,false,false,false,false,false),
							  importesReales:fncNewDesgloseImportes(false,false,false,false,false,false)};
		objImportes.calculos={aprobado:0,pendiente:0,resto:0,total:0,
							  fases:{aprobado:fncNewDesgloseImportes(),
									pendiente:fncNewDesgloseImportes(),
									resto:fncNewDesgloseImportes()
							  },
							  inTimespents:{aprobado:0,pendiente:0,resto:0,total:0},
							  workedPercent:0,
							  bModificacionAlcance:false,
							  comentarios:"",
							  errores:""};
		return objImportes;
    }
var getBillingFieldListRecursive=function (sPropertyPath,obj){
	var arrResults=[];
	var arrAux;
	var arrProps=getAllProperties(obj);
	for (var i=0;i<arrProps.length;i++){
		var propName=arrProps[i];
		var propPath=sPropertyPath+(sPropertyPath==""?"":".")+propName;
		var propValue=obj[propName];
		if (isDefined(propValue)&&(typeof propValue==="object")){
			arrAux=self.getBillingFieldListRecursive(propPath,propValue);
			arrAux.forEach(function(auxPropPath){
				arrResults.push(auxPropPath);
			});
		} else {
			arrResults.push(propPath);
		}
	}
	return arrResults;
}

var getBillingFieldList=function(){
	var objImportes=newBillingObject();
	//debugger;
	var arrPropPaths=getBillingFieldListRecursive("Billing",objImportes);
	var hsProps=newHashMap();
	arrPropPaths.forEach(function(propName){
		hsProps.add(propName,propName);
	});
	return hsProps;
}
var plgBillingParams=class plgBillingParams{
	constructor(){
		var self=this;
		self.variables;
		self.listParams=newHashMap();
	}
	newParams(reportsHistoryDatesVarName,hourCostVarName,minFaseFacturable,contractWorksInitDate){
		var self=this;
		var auxObj={};
		self.setValues(auxObj,reportsHistoryDatesVarName,hourCostVarName,minFaseFacturable,contractWorksInitDate);
		return auxObj;
	}
	setValues(objParams,reportsHistoryDatesVarName,hourCostVarName,minFaseFacturable,contractWorksInitDate){
		var self=this;
		objParams.history=reportsHistoryDatesVarName;
		objParams.hourCost=hourCostVarName;
		objParams.minFaseFacturable=minFaseFacturable;
		objParams.worksInitDate=contractWorksInitDate;
	}
	setParams(configName,reportsHistoryDatesVarName,hourCostVarName,minFaseFacturableVarName,contractWorksInitDate){
		var self=this;
		if (self.listParams.exists(configName)){
			var auxObj=self.listParams.getValue(configName);
			auxObj.setValues(reportsHistoryDatesVarName,hourCostVarName,minFaseFacturableVarName,contractWorksInitDate);
		} else {
			self.listParams.add(configName,self.newParams(reportsHistoryDatesVarName,hourCostVarName,minFaseFacturableVarName,contractWorksInitDate));
		}
	}
	addParams(configName,reportsHistoryDatesVarName,hourCostVarName,minFaseFacturableVarName,contractWorksInitDate){
		var self=this;
		self.setParams(configName,reportsHistoryDatesVarName,hourCostVarName,minFaseFacturableVarName,contractWorksInitDate)
	}
	getHourCost(config,atDatetime){
		return parseFloat(this.getParamValue(config,"hourCost",atDatetime));
	}
	getMinFaseFacturable(config,atDatetime){
		var minFacturableFase=this.getParamValue(config,"minFaseFacturable",atDatetime);
		if (isDefined(minFacturableFase)&&(minFacturableFase!="")){
			minFacturableFase=parseInt(minFacturableFase);
		} else {
			minFacturableFase=4;
		}
		return minFacturableFase;
	}
	getWorksInitDate(config){
		var workInit=this.getParamValue(config,"worksInitDate");
		if (isDefined(workInit)&&(workInit!="")){
			return workInit;
		}
		return "";
	}
	getHistory(config){
    	var self=this;
		var config=self.getParams(config);
		var hsHistory=self.variables.getVars(config.history)
		return hsHistory;
	}
    getParamValue(config,key,atDatetime){
    	var self=this;
		var config=self.getParams(config);
		var value=self.variables.getVar(config[key],atDatetime);
    	return value;
    }
	
	getParams(configName){
		var self=this;
		if (self.listParams.exists(configName)){
			var auxObj=self.listParams.getValue(configName);
			return auxObj;
		} else {
			return "";
		}
	}
};
var billingParams=new plgBillingParams();
var setBillingParams=function(configName,reportsHistoryDatesVarName,hourCostVarName,contractWorksInitDate){
	billingParams.addParams(configName,reportsHistoryDatesVarName,hourCostVarName,contractWorksInitDate);
}


var plgBillingSystem=class plgBillingSystem{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         self.report=report;
         self.model=model;
         self.billingParams=billingParams;
         self.billingParams.variables=model.variables;
     }
    getFieldFaseBillingName(nFaseNum){
		if (nFaseNum==5){
			return "Total";
		} else if (nFaseNum==4){
			return "Desplegado";
		} else if (nFaseNum==3){
			return "Implementado";
		} else if (nFaseNum==2){
			return "Disenado";
		} else if (nFaseNum==1){
			return "Aprobado";
		} else if (nFaseNum==0) {
			return "Identificado";
		} else {
			return "NoCreado";
		}
    }
    getBillingFieldUsed(){
    	var oResult={};
    	var arrFields=[];
    	arrFields.push(["Importe Estimado Aprobación","Aprobado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Diseño","Disenado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Implementación","Implementado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Despliegue","Desplegado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Total","Total","importesEstimados"]);

    	arrFields.push(["Importe Real Aprobación","Aprobado","importesReales"]);
    	arrFields.push(["Importe Real Diseño","Disenado","importesReales"]);
    	arrFields.push(["Importe Real Implementación","Implementado","importesReales"]);
    	arrFields.push(["Importe Real Despliegue","Desplegado","importesReales"]);
    	arrFields.push(["Importe Real Total","Total","importesReales"]);
    	oResult.arrFieldsForCalc=arrFields;
    	oResult.arrBaseFields=["Fase","timeoriginalestimate","timeestimate","timespent"];
    	return oResult;
    }
    initializeBilling(atDatetime,hourCost,minFacturableFase){
    	var self=this;
    	var status=self.fieldValue("status.name",false,atDatetime);
    	var created=self.fieldValue("created",false,atDatetime);
		var faseActual=self.fieldValue("Fase",false,atDatetime);
		var timeoriginalestimate=self.fieldValue("timeoriginalestimate",false,atDatetime);
		//dynObj.functions.add("fieldAccumChilds",function(theFieldName,datetime,inOtherParams,notAdjust,bSetProperty,fncItemCustomCalc){
		var timeestimate=self.fieldAccumChilds("timeestimate",atDatetime);
		var timespent=self.fieldAccumChilds("timespent",atDatetime);
		if (timeoriginalestimate=="") timeoriginalestimate=0; else timeoriginalestimate=parseFloat(timeoriginalestimate);
		if (timeestimate=="") timeestimate=0; else timeestimate=parseFloat(timeestimate);
		if (timespent=="") timespent=0; else timespent=parseFloat(timespent);
    	var objImportes=newBillingObject();
    	objImportes.source.timeoriginalestimate=timeoriginalestimate;
    	objImportes.source.timeestimate=timeestimate;
    	objImportes.source.timespent=timespent;
    	objImportes.bIncrementadaEstimacion=(timeoriginalestimate<timeestimate);
    	objImportes.source.faseActual=faseActual;
    	objImportes.source.status=status;
    	objImportes.source.created=created;
    	objImportes.source.hourCost=hourCost;
    	objImportes.source.minFacturableFase=minFacturableFase;
    	objImportes.source.atDatetime=atDatetime;
    	
		var arrFields=self.getBillingFieldUsed().arrFieldsForCalc;
    	var vValue;
    	var bWithValue;
    	arrFields.forEach(function (fieldImporte){
    		bWithValue=false;
    		//debugger;
    		vValue=self.fieldValue(fieldImporte[0],false,atDatetime);
    		if ((vValue=="") || (isUndefined(vValue)) || (isNaN(vValue))) {
    			vValue=0;
    		} else {
    			vValue=parseFloat(vValue);
    			bWithValue=true;
    		}
			objImportes.importesdefinidos[fieldImporte[2]][fieldImporte[1]]=bWithValue;
			objImportes.source[fieldImporte[2]][fieldImporte[1]]=vValue;
    	});
    	
		var bUndefinedEstimado=false;
		var bUndefinedReal=false;
		var impEst=0;
		var impReal=0;
		var fieldFaseName;

		for (var nFase=0;nFase<6;nFase++){
			bUndefinedEstimado=false;
			bUndefinedReal=false;
			impEst=0;
			impReal=0;
			fieldFaseName=self.getFieldFaseBillingName(nFase);
			bUndefinedEstimado=(!objImportes.importesdefinidos.importesEstimados[fieldFaseName]);
			bUndefinedReal=(!objImportes.importesdefinidos.importesReales[fieldFaseName]);
			if (!bUndefinedEstimado) impEst=objImportes.source.importesEstimados[fieldFaseName];
			if (!bUndefinedReal) {
				impReal=objImportes.source.importesReales[fieldFaseName];
				objImportes.bImportesRealesUndefined=false;
				if (impReal!="") objImportes.bImportesRealesBlanco=false;
				if (impReal!=0) objImportes.bImportesRealesCero=false;
			}
			if (bUndefinedEstimado) impEst=impReal;
			if (bUndefinedReal) impReal=impEst; 
			objImportes.importesEstimados[fieldFaseName]=impEst;
			objImportes.importesReales[fieldFaseName]=impReal;
			if (nFase<5) {
				objImportes.source.acumFasesEstimado+=impEst;
				objImportes.source.acumFasesReal+=impReal;
			}
		}
    	return objImportes;
    }
    getBillingSnapShot(atDatetime,fromDatetime,hourCost,minFacturableFase){
    	var self=this;
    	var objImportes=self.initializeBilling(atDatetime,hourCost,minFacturableFase);
		tReal=objImportes.source.timespent;
		tEstimado=objImportes.source.timeoriginalestimate;
		
		var servicio=self.fieldValue("project.key");
		var tipo=self.fieldValue("issuetype.name");
		
		if (servicio!="OT"){
			if ((tipo=="Tarea")||(tReal==0)) tReal=tEstimado;
			if (tEstimado==0) tEstimado=tReal;
		}
		
		var acumFasesEstimado=objImportes.source.acumFasesEstimado;
		var acumFasesReal=objImportes.source.acumFasesReal;
		var fieldFaseName;
		if ((acumFasesEstimado.toFixed(1)==1)||(acumFasesEstimado.toFixed(1)==0)){
			if ((objImportes.importesEstimados.Total.toFixed(1)==1)||(objImportes.importesEstimados.Total.toFixed(1)==0)){
				// si el total estimado es 0 o es 1 quiere decir que hay que cogerlo del tiempo de jira.
				totalEstimado=(tEstimado/(60*60))*hourCost;
			} else {
				// si hay un total estimado.... se coge del total..
				totalEstimado=objImportes.importesEstimados.Total;
			}
			objImportes.importesEstimados.Total=totalEstimado;
			if (acumFasesEstimado.toFixed(1)==0) { //si la suma de las partes es 0 quiere decir que hay que ponerlo todo en alguna fase.. o en ninguna si son issues creados despues del 22 de febrero.
				if (tipo=="Despliegue") {	// si es un despliegue se pone en la fase 4
					for (var nFase=1;nFase<5;nFase++){
						fieldFaseName=self.getFieldFaseBillingName(nFase);
						objImportes.importesEstimadosPercs[fieldFaseName]=0;
					}
					objImportes.importesEstimados[self.getFieldFaseBillingName(4)]=1;
				}
			}
			for (var nFase=1;nFase<5;nFase++){
				fieldFaseName=self.getFieldFaseBillingName(nFase);
				vPorc=objImportes.importesEstimados[fieldFaseName];
				objImportes.importesEstimados[fieldFaseName]=totalEstimado*vPorc;
				objImportes.importesEstimadosPercs[fieldFaseName]=vPorc;
			}
		}
		
		if ((acumFasesReal.toFixed(1)==1)||(acumFasesReal.toFixed(1)==0)){
			if ((objImportes.importesReales.Total.toFixed(1)==1)
				||(objImportes.importesReales.Total.toFixed(1)==0)){
				totalReal=(tReal/(60*60))*hourCost;
			} else {
				totalReal=objImportes.importesReales.Total;
			}
			objImportes.importesReales.Total=totalReal;
			if (acumFasesReal.toFixed(1)==0) {
				if (tipo=="Despliegue") {	// si es un despliegue se pone en la fase 4
					objImportes.importesReales[fncGetFieldFase(4)]=1;
				}
			}
			for (var nFase=1;nFase<5;nFase++){
				fieldFaseName=self.getFieldFaseBillingName(nFase);
				vPorc=objImportes.importesReales[fieldFaseName];
				objImportes.importesReales[fieldFaseName]=totalReal*vPorc;
			}
		}
		return objImportes;
    }
    
    getBilling(otherParams){
    	// initialize and load the importes structure
    	var self=this;
    	debugger;
    	var hslifeCaches=self.getFieldLife("Billing",self.getReport().reportDateTime,otherParams);
    	var life=hslifeCaches.getValue("life");
    	var last=life[life.length-1][2]; // último snapshot
    	return last; 
    }
    getBillingLife(otherParams,theDatetime){
    	// initialize and load the importes structure
    	var self=this;
    	var vPorc;
		var tEstimado;
		var tReal;
		var totalEstimado;
		var totalReal;
		var sComentarios="";
		var sErrores="";
		var atDatetime=theDatetime;
		if (isUndefined(theDatetime)||(theDatetime=="")){
			atDatetime=self.getReport().reportDateTime;
		}
		var configName=otherParams.getValue("config");
		var hsHistory=self.billingParams.getHistory(configName);  
		var dtWorksInit=self.billingParams.getWorksInitDate(configName);
		var arrSnapshots=[];
		var snapshot;
		var hourCost;
		var minFacturableFase;
		var arrHistory=[];
		if (dtWorksInit!=""){
			arrHistory.push(["",dtWorksInit.getTime()]);
		}
		var bPush;
		var dtAux1;
		var dtAux2;
		hsHistory.walk(function(hstAux){
			var dtAux1=toDateNormalDDMMYYYYHHMMSS(hstAux[1]).getTime();
			var dtAux2=toDateNormalDDMMYYYYHHMMSS(hstAux[2]).getTime();
			if ((dtAux2.getTime()<atDatetime) &&
			   ((dtWorksInit=="")?true:dtWorksInit.getTime()<dtAux2.getTime())){
				arrHistory.push([dtAux1,dtAux2]);
			}
		});

		arrHistory.sort(function(a,b){
			if (a[1]>b[1]) return -1;
			if (a[1]<b[1]) return 1;
			return 0;
		});
		
		if (arrHistory.length>0){ // pushing the atDateTime last period....
			dtAux1=arrHistory[0][1];
			arrHistory.push([dtAux1,atDatetime]);
		}
		arrHistory.push([atDatetime,""]); // adding a open period starts with atDateTime....
		
		var arrHistAux=arrHistory;
		var dtIni=0;
		var dtEnd=0;
		var dtAnt="";
		arrHistory=[];
		for (var i=0;i<arrHistAux.length;i++){
			dtIni=arrHistAux[0];
			dtEnd=arrHistAux[1];
			if (dtIni!=""){
				if ((dtAnt=="")||((dtAnt!="")&&(dtAnt==dtIni))){
					arrHistory.push(dtIni);
				} else {
					var dateIni=formatDate(new Date(dtIni),4);
					var dateAnt=formatDate(new Date(dtAnt),4);
					sErrores+="ERROR! La configuración de fechas no es correcta. dtIni:"+dateIni+" debería ser igual a dtAnt:"+dateAnt+" para mantener la coherencia de informes. se añaden ambas fechas";
					if (dtIni>dtAnt){
						arrHistory.push(dtIni);
					} else {
						sErrores+="ERROR! dtIni:"+dateIni+" es menor que dtAnt:"+dateAnt+". No se añade dtIni ("+dateIni+")";
					}
				}
			}
			if (dtEnd!=""){
				arrHistory.push(dtEnd);
				dtAnt=dtEnd;
			}
		}
		

		arrHistory.forEach(function(dtSnapshot){
 			var dtAux=new Date(dtSnapshot);
			hourCost=self.billingParams.getHourCost(configName,dtAux);
			minFacturableFase=self.billingParams.getMinFaseFacturable(configName,dtAux);  
			snapshot=self.getBillingSnapShot(dtAux,hourCost,minFacturableFase);
			arrSnapshots.push(snapshot);
		});

		var previousDate="";
		var antSnapshot="";
		var antImportes="";
		var antHourCost="";
		var antFase=0;
		var actFase=0;
		var fieldFaseName;
		var actFaseImporte=0;
		var antFaseImporte=0;
		var sSnapshotDate="";
		var importePendiente=0;
		var workedPercent=0;
		arrSnapshots.forEach(function(snapshot){
			hourCost=snapshot.source.hourCost;
			minFacturableFase=snapshot.source.minFacturableFase;
			actFase=snapshot.source.faseActual;
			sSnapshotDate=formatDate(snapshot.source.atDatetime,4);
			if (actFase<antFase){
				sComentarios+="\n"+sSnapshotDate+" - Retrocedido a la fase:"+self.getFieldFaseBillingName(actFase)+" antes:"+self.getFieldFaseBillingName(antFase)+ " se mantiene la fase anterior";
				actFase=antFase;
			}
			snapshot.calculos.aprobado=0;
			snapshot.calculos.pendiente=0;
			snapshot.calculos.resto=0;
			snapshot.calculos.total=0;
			snapshot.calculos.inTimespents.aprobado=0;
			snapshot.calculos.inTimespents.pendiente=0;
			snapshot.calculos.inTimespents.resto=0;
			snapshot.calculos.inTimespents.total=0;
			snapshot.calculos.comentarios="";
			if ((previousDate=="")||(antFase<minFacturableFase)){// is the first or the first facturable
				for (var nFase=0;nFase<5;nFase++){
					fieldFaseName=self.getFieldFaseBillingName(nFase);
					actFaseImporte=snapshot.importesReales[fieldFaseName];
					if ((actFase<minFacturableFase)||(actFase<nFase)){
						snapshot.calculos.resto+=actFaseImporte;
						snapshot.calculos.fases.resto[fieldFaseName]=actFaseImporte;
					} else { 
						snapshot.calculos.pendiente+=actFaseImporte;
						snapshot.calculos.fases.pendiente[fieldFaseName]=actFaseImporte;
					}
					objImportes.calculos.total+=actFaseImporte;
				}
				snapshot.calculos.inTimespents.aprobado=0;
				snapshot.calculos.inTimespents.pendiente=(snapshot.calculos.pendiente/hourCost)*3600;
				snapshot.calculos.inTimespents.resto=(snapshot.calculos.resto/hourCost)*3600;
				snapshot.calculos.inTimespents.total=(snapshot.calculos.total/hourCost)*3600;
				if (snapshot.calculos.inTimespents.total>0){
					snapshot.calculos.workedPercent=snapshot.calculos.inTimespents.pendiente/snapshot.calculos.inTimespents.total;
				}
				antSnapshot=snapshot;
				antFase=actFase;
				previousDate=snapshot.atDatetime;
			} else {
				// en dos iteraciones.... 0 -> antFase ... para ver si ha cambiado algun importe facturado
				snapshot.calculos.inTimespents.aprobado=antSnapshot.calculos.inTimespents.aprobado
														+antSnapshot.calculos.inTimespents.pendiente;
				snapshot.calculos.inTimespents.pendiente=0;
				snapshot.calculos.inTimespents.resto=0;
				snapshot.calculos.inTimespents.total=0;
				snapshot.calculos.bModificacionAlcance=((antSnapshot.source.timeestimate<snapshot.source.timeestimate)
														&&(snapshot.source.timeoriginalestimate<snapshot.source.timeestimate));

				for (var nFase=0;nFase<=antFase;nFase++){
					fieldFaseName=self.getFieldFaseBillingName(nFase);
					antFaseImporte=antSnapshot.calculos.fases[fieldFaseName];
/*					objImportes.importesdefinidos={importesEstimados:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false},
							  importesReales:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false}};
*/					
					if (snapshot.importesdefinidos.importesReales[fieldFaseName]){
						actFaseImporte=snapshot.importesReales[fieldFaseName];
					} else {
						actFaseImporte=antFaseImporte;
					}
					if (actFaseImporte<antFaseImporte){
						sErrores+="\n ¡¡¡ ERROR !!! "+sSnapshotDate+" - Reducido el importe de la fase:"+fieldFaseName+" antes:"+antFaseImporte+" ahora:"+actFaseImporte+" se mantiene el anterior ("+antFaseImporte+") pero se debe corregir el error";
						actFaseImporte=antFaseImporte;
					} else if (actFaseImporte>antFaseImporte){
						sComentarios+="\n"+sSnapshotDate+" - Incrementado el importe de la fase:"+fieldFaseName+" antes:"+antFaseImporte+" ahora:"+actFaseImporte;
					}
					if ((actFase<minFacturableFase)||(actFase<nFase)){
						snapshot.calculos.resto+=actFaseImporte;
						snapshot.calculos.fases.resto[fieldFaseName]=actFaseImporte;
						snapshot.calculos.inTimespents.resto+=(actFaseImporte/hourCost)*3600;
					} else { 
						snapshot.calculos.aprobado+=antFaseImporte;
						snapshot.calculos.fases.aprobado[fieldFaseName]=antFaseImporte;
						importePendiente=(actFaseImporte-antFaseImporte);
						snapshot.calculos.pendiente+=importePendiente;
						snapshot.calculos.fases.pendiente[fieldFaseName]=importePendiente;
						snapshot.calculos.inTimespents.pendiente+=(importePendiente/hourCost)*3600;
					}
					objImportes.calculos.total+=actFaseImporte;
				}
				var arrFaseUndefined=[];
				// segunda parte .... antFase -- 6 ... para incorporar las nuevas fases trabajadas
				var bDefinedImporte=true;
				for (var nFase=antFase;(nFase<5)&&bDefinedImporte;nFase++){
					fieldFaseName=self.getFieldFaseBillingName(nFase);
					if (snapshot.importesdefinidos.importesReales[fieldFaseName]){
						actFaseImporte=snapshot.importesReales[fieldFaseName];
						if ((actFase<minFacturableFase)||(actFase<nFase)){
							snapshot.calculos.resto+=actFaseImporte;
							snapshot.calculos.fases.resto[fieldFaseName]=actFaseImporte;
							snapshot.calculos.inTimespents.resto+=(actFaseImporte/hourCost)*3600;
						} else { 
							importePendiente=actFaseImporte;
							snapshot.calculos.pendiente+=importePendiente;
							snapshot.calculos.fases.pendiente[fieldFaseName]=importePendiente;
							snapshot.calculos.inTimespents.pendiente=(importePendiente/hourCost)*3600;
						}
						snapshot.calculos.total+=actFaseImporte;
					} else {
						bDefinedImporte=false;
					}
				}
				if (!bDefinedImporte){ // hay uno o mas importes no definidos del resto....
					nFase--;
					var workDefined=snapshot.calculos.inTimespents.resto
										 +snapshot.calculos.inTimespents.pendiente
										 +snapshot.calculos.inTimespents.aprobado;
					var falta=snapshot.source.timeestimate-workDefined;
					workedPercent=workDefined/snapshot.source.timeestimate;
					var percAux=0;
					for (var i=nFase;i<5;i++){
						fieldFaseName=self.getFieldFaseBillingName(i);
						percAux+=snapshot.importesEstimadosPercs[fieldFaseName];
						//example 0.57
					}
					var percAcum=percAux;
					var workTotal=0;
					if (actFase==4){ // si el requisito se cierra el trabajo total es el timespent
						workTotal=snapshot.source.timespent;
					} else {
						// si el requisito no esta cerrado se utiliza el mayor estimado
						workTotal=snapshot.source.timeoriginalestimate;
						if (snapshot.source.timeestimate>workTotal) workTotal=snapshot.source.timeestimate;
					}
					
					var workRemaining=workDefined-workTotal;
					if (workRemaining<0){
						sErrores+="\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El trabajo restante es negativo. Se establece a 0
										Trabajo Aprobado:`+snapshot.calculos.inTimespents.aprobado+`
										Trabajo Pendiente:`+snapshot.calculos.inTimespents.pendiente+`
										Resto Trabajo definido:`+workDefined+`
										Trabajo definido Total:`+snapshot.calculos.inTimespents.resto+`
										Trabajo Total:`+workTotal+ "(TOE:"+snapshot.source.timeoriginalestimate
											+",TE"+snapshot.source.timeestimate+",TS:"+snapshot.source.timespent+")";
						workRemaining=0;
					}
					var workAux=0;
					var workAuxMoney=0;
					for (var i=nFase;i<5;i++){
						fieldFaseName=self.getFieldFaseBillingName(i);
						percAux=snapshot.importesEstimadosPercs[fieldFaseName];
						percAux=Math.round(percAux/percAcum);
						workAux=percAux*workRemaining;
						workAuxImporte=(workAux/3600)*hourCost;
						if (i>actFase){ // da igual porque no se va a facturar
							snapshot.calculos.resto+=workAuxImporte;
							snapshot.calculos.fases.resto[fieldFaseName]=workAuxImporte;
							snapshot.calculos.inTimespents.resto+=workAux;
						} else {
							snapshot.calculos.pendiente+=workAuxImporte;
							snapshot.calculos.fases.pendiente[fieldFaseName]=workAuxImporte;
							snapshot.calculos.inTimespents.pendiente+=workAux;
						}	
						snapshot.calculos.total+=workAuxImporte;
					}
				}
			}
			snapshot.calculos.errores=sErrores;
			snapshot.calculos.comentarios=sComentarios;
		});
	   	 
		var arrResults=[];
		
	   	arrSnapshots.forEach(function(snapshot){
	      	arrResults.push([snapshot.source.atDatetime,"",snapshot]);
	   	 });
	   	 arrResults.sort(function(a,b){
	   		if (a[0]<b[0]) return 1;
	   		if (a[0]>b[0]) return -1;
	   		return 0;
	   	 });
	   	 for (var i=0;i<(arrResults.length-1);i++){
	   		 arrResults[i][1]=arrResults[i+1][2];
	   	 }
	     return arrResults;
    }
    getBillingCacheKeyPostText(atDatetime,otherParams){
		var configName=otherParams.getValue("config");
		var hourCost="";
		var fromDatetime="";
		var toDateTime="";
		var minFacturableFase="";
		if (isDefined(atDatetime)){
			toDateTime=atDatetime.getTime()+"";
		}
		if (isDefined(otherParams)){
//			hourCost=parseFloat(otherParams.getValue("hourCost"));
			fromDatetime=otherParams.getValue("fromDatetime");
//			minFacturableFase=otherParams.getValue("minFacturableFase");
		}
		if (fromDatetime!=""){
			if ((typeof fromDatetime==="object")&&(fromDatetime.constructor.name=="Date")){
				fromDatetime=fromDatetime.getTime()+"";
			} else {
				fromDatetime=toDateNormalDDMMYYYYHHMMSS(fromDatetime).getTime()+"";
			}
		}
		//var sKey=hourCost+"-"+minFacturableFase+"-"+fromDatetime+"-"+toDateTime;
		var sKey=configName+"-"+fromDatetime+"-"+toDateTime;
		return sKey;
    }
    
    execute(){
         var selfPlg=this;
         
         
         selfPlg.report.treeIssues.walk(function(issue){
        	 	 issue.billingParams=billingParams;
                 issue.getFieldFaseBillingName=selfPlg.getFieldFaseBillingName;
                 issue.getBillingFieldUsed=selfPlg.getBillingFieldUsed;
                 issue.initializeBilling=selfPlg.initializeBilling;
                 issue.getBilling=selfPlg.getBilling;
                 issue.getBillingLife=selfPlg.getBillingLife;
                 issue.getBillingCacheKeyPostText=selfPlg.getBillingCacheKeyPostText;
         });
    }

}