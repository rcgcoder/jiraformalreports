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
				  fechaFacturacion:"",
				  faseActual:"",
				  faseActualName:"",
				  faseDesarrollo:"",
				  faseDesarrolloName:"",
				  status:"",
				  created:"",
				  isOldIssue:false,
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
		objImportes.calculos={aprobado:0,pendiente:0,resto:0,total:0
							  ,totalEnFacturas:0,avance:0,estimadoActual:0,
							  fases:{aprobado:fncNewDesgloseImportes(),
									pendiente:fncNewDesgloseImportes(),
									resto:fncNewDesgloseImportes()
							  },
							  faseActual:0,
							  faseAnterior:0,
							  inTimespents:{aprobado:0,pendiente:0,resto:0,total:0
								  			,totalEnFacturas:0
								  			,avance:0,estimadoActual:0},
							  noFacturable:{importe:0,timespent:0,avance:{importe:0,timespent:0}},
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
		var propPath=sPropertyPath+(sPropertyPath===""?"":".")+propName;
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
var getBillingDatesList=function(config,atDatetime,model){
	var auxParams=newHashMap(); 
	auxParams.add("config",config);
	auxParams.add("model",model);
	var fixedDateTime=atDatetime
	if (isUndefined(atDatetime)){
		fixedDateTime=new Date();
	}
	var arrDates=getBillingLifeDates(auxParams,fixedDateTime);
	arrDates.sort(function(a,b){
		if (a>b) return -1;
		if (a<b) return 1;
		return 0;
	});
	var hsResult=newHashMap();
	arrDates.forEach(function(auxDate){
		var dtResult=new Date(auxDate);
		var objResult={
			fechaText:formatDate(dtResult,4),
			fecha:dtResult,
			timestamp:auxDate
		}
		hsResult.push(objResult);
	});
	return hsResult;
}

var getBillingLifeDates=function(otherParams,theDatetime,errorsInfo){
	//debugger;
	var sErrores=errorsInfo;
	if (isUndefined(sErrores)){
		sErrores=[];
	}
	// initialize and load the importes structure
	var atDatetime=theDatetime;
	var objModel=otherParams.getValue("model");
	var objReport=objModel.report;
	if (isUndefined(theDatetime)||(theDatetime==="")){
		atDatetime=objReport.reportDateTime;
	}
	var atTimestamp=atDatetime.getTime();
	var configName=otherParams.getValue("config");
	var hsHistory=billingParams.getHistory(configName);  
	var dtWorksInit=billingParams.getWorksInitDate(configName);
	var arrHistory=[];
	var tsWorksInit="";
	var hsDateControl=newHashMap();
	var fncAddDate=function(tsDate){
		if (!hsDateControl.exists(tsDate)){
			hsDateControl.add(tsDate+"",tsDate);
		}
	} 
	if (dtWorksInit!=""){
		tsWorksInit=dtWorksInit.getTime();
		fncAddDate(tsWorksInit);
//		arrHistory.push(["",tsWorksInit]);
	}
	var bPush;
	var tsAux1;
	var tsAux2;
	var tsReportInit=objModel.variables.getVar("ReportInitDate_timestamp");
	var tsReportEnd=objModel.variables.getVar("ReportEndDate_timestamp");
	fncAddDate(tsReportInit);
	fncAddDate(tsReportEnd);
	hsHistory.walk(function(hstAux){
		tsAux1=hstAux.value[0].getTime();
		tsAux2=hstAux.value[1].getTime();
		fncAddDate(tsAux1);
		fncAddDate(tsAux2);
	});
	var arrDatesAux=[];
	hsDateControl.walk(function(tsDate,iDeep,sKey){
		arrDatesAux.push(tsDate);
	});
	arrDatesAux.sort(function(ts1,ts2){
		if (ts1<ts2) return -1;
		if (ts1>ts2) return 1;
		return 0;
	});
/*	arrHistory.push(["",arrDatesAux[0]]);
	for (var i=1;i<arrDatesAux.length;i++){
		arrHistory.push([arrDatesAux[i-1],arrDatesAux[i]]);
	}
*/	return arrDatesAux;
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
		self.setParams(configName,reportsHistoryDatesVarName,hourCostVarName,minFaseFacturableVarName,contractWorksInitDate);
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
		var hsHistory=self.variables.getVars(config.history);
		if (isUndefined(hsHistory)||(hsHistory==="")){
			//debugger;
			return "";
		}
		hsHistory=hsHistory.history;
		return hsHistory;
	}
    getParamValue(config,key,atDatetime){
    	var self=this;
		var config=self.getParams(config);
		var varName=config[key];
		var value="";
		if (isDefined(varName)){
			value=self.variables.getVar(config[key],atDatetime);
		}
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
var setBillingParams=function(configName,reportsHistoryDatesVarName,hourCostVarName,minFacturableFase,contractWorksInitDate){
	billingParams.addParams(configName,reportsHistoryDatesVarName,hourCostVarName,minFacturableFase,contractWorksInitDate);
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
			return "No Creado";
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
    	debugger;
    	var self=this;
    	if (!self.getAsyncFieldValue()){
    		self.throwAsyncException(self.initializeBilling,[atDatetime,hourCost,minFacturableFase]);
    	}
    	var report=self.getReport();
/*    	var fechaFacturacion=self.fieldValue("Fecha de facturación",false,atDatetime);
    	if (fechaFacturacion!==""){
    		logError(self.getKey()+" fecha de facturacion:"+fechaFacturacion);
    	}
*/    	var status=self.fieldValue("status.name",false,atDatetime);
    	var created=new Date(self.fieldValue("Creada",false));
    	//debugger;
		var faseActual=self.fieldValue("Fase",false,atDatetime);
		var faseDesarrollo=faseActual;
		var timeoriginalestimate=self.fieldValue("timeoriginalestimate",false,atDatetime);
		var timeestimate=0;
		var timespent=0;

		//dynObj.functions.add("fieldAccumChilds",function(theFieldName,datetime,inOtherParams,notAdjust,bSetProperty,fncItemCustomCalc){
		if (self.getKey()=="BENT-411"){
			debugger;
		}
		report.addStep("Adjusting Phase in hierarchy",function(){
			return self.processHierarchy(function(parentIssue){
				var auxFaseActual=parentIssue.fieldValue("Fase",false,atDatetime);
				if (faseActual>auxFaseActual){
					faseActual=auxFaseActual;
				}
			});
		})

		report.addStep("Accumulating timestimate value of childs",function(){
			return self.fieldAccumChilds("timeestimate",atDatetime);
		});

		report.addStep("Accumulating timespent value of childs",function(resultTimeestimate){
			timeestimate=resultTimeestimate;
			if (self.fieldValue("project.key")!="OT"){
				report.addStepMayRetry("Adjusting timeoriginalestimate",function(){
					var auxTimeoriginalestimate=self.getReport().adjustAccumItem("Childs",timeoriginalestimate,self,"timeoriginalestimate",atDatetime);
					var auxTimeestimate=self.getReport().adjustAccumItem("Childs",timeestimate,self,"timeestimate",atDatetime);
					var auxTimespent=self.fieldAccumChilds("timespent",atDatetime);
					return report.taskResultMultiple(auxTimeoriginalestimate,auxTimeestimate,auxTimespent);
				});
				report.addStep("setting values",function(toe,te,ts){
					timeoriginalestimate=toe;
					timeestimate=te;
					timespent=ts;
				});
			} else {
				self.getReport().callWithRetry(function(){
					timespent=self.fieldValue("timespent",false,atDatetime);
				});
			}
		});
		report.addStep("Doing billing snapshot calculus and return",function(resultTimespent){
			timespent=resultTimespent;
			if (timeoriginalestimate==="") timeoriginalestimate=0; else timeoriginalestimate=parseFloat(timeoriginalestimate);
			if (timeestimate==="") timeestimate=0; else timeestimate=parseFloat(timeestimate);
			if (timespent==="") timespent=0; else timespent=parseFloat(timespent);
			if ((faseActual==3)||(faseActual==4)){
				timeestimate=0;
				if (timeoriginalestimate==0)timeoriginalestimate=timespent; 
			}
	    	var objImportes=newBillingObject();
	    	objImportes.source.timeoriginalestimate=timeoriginalestimate;
	    	objImportes.source.timeestimate=timeestimate;
	    	objImportes.source.timespent=timespent;
	    	objImportes.bIncrementadaEstimacion=(timeoriginalestimate<timeestimate);
	    	objImportes.source.faseActual=faseActual;
	    	objImportes.source.faseActualName=self.getFieldFaseBillingName(faseActual);
	    	objImportes.source.faseDesarrollo=faseDesarrollo;
	    	objImportes.source.faseDesarrolloName=self.getFieldFaseBillingName(faseDesarrollo);
	    	objImportes.source.status=status;
	    	objImportes.source.created=created;
	    	objImportes.source.hourCost=hourCost;
	    	objImportes.source.minFacturableFase=minFacturableFase;
	    	objImportes.source.atDatetime=atDatetime;
			var contractInitDate=(new Date());
			var objModel=self.getReport().objModel;
	
			if (objModel.variables.getVar("withAdvancedWorks")){
				contractInitDate=objModel.variables.getVar("ContractAdvancedDate");
			} else {
				contractInitDate=objModel.variables.getVar("ContractInitDate");			
			}
			var bIsOldIssue=(contractInitDate.getTime()<created.getTime());
			objImportes.isOldIssue=bIsOldIssue;
			var arrFields=self.getBillingFieldUsed().arrFieldsForCalc;
	    	var vValue;
	    	var bWithValue;
	    	arrFields.forEach(function (fieldImporte){
	    		bWithValue=false;
	    		//debugger;
	    		vValue=self.fieldValue(fieldImporte[0],false,atDatetime);
	    		if ((vValue==="") || (isUndefined(vValue)) || (isNaN(vValue))) {
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
		});
    }
    getBillingSnapShot(atDatetime,hourCost,minFacturableFase){
    	var self=this;
    	//debugger;
    	if (!self.getAsyncFieldValue()){
    		self.throwAsyncException(self.getBillingSnapShot,[atDatetime,hourCost,minFacturableFase]);
    	}
    	var report=self.getReport();
    	report.addStep("Initialize Billing",function(){
        	return self.initializeBilling(atDatetime,hourCost,minFacturableFase);
    	});
    	report.addStep("Process imports",function(objImportes){
			var tReal=objImportes.source.timespent;
			var tEstimado=objImportes.source.timeoriginalestimate;
			
			var servicio=self.fieldValue("project.key");
			var tipo=self.fieldValue("issuetype.name");
			
			if (servicio!="OT"){
				if (/*(tipo=="Tarea")||*/(tReal==0)) tReal=tEstimado;
				if (tEstimado==0) tEstimado=tReal;
			}
			
			var acumFasesEstimado=objImportes.source.acumFasesEstimado;
			var acumFasesReal=objImportes.source.acumFasesReal;
			var fieldFaseName;
			var totalEstimado;
			var vPorc;
			var totalReal;
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
						objImportes.importesEstimados[self.getFieldFaseBillingName(4)]=1;
						objImportes.importesEstimados[self.getFieldFaseBillingName(5)]=1;
					} else {
						var auxFaseName;
						for (var nFase=1;nFase<6;nFase++){
							auxFaseName=self.getFieldFaseBillingName(nFase);
							objImportes.importesEstimados[auxFaseName]=objImportes.importesPorcentajeRef[auxFaseName];
						}
					}
				}
				for (var nFase=1;nFase<6;nFase++){
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
						objImportes.importesReales[self.getFieldFaseBillingName(4)]=1;
						objImportes.importesReales[self.getFieldFaseBillingName(5)]=1;
					} else {
						var auxFaseName;
						for (var nFase=1;nFase<6;nFase++){
							auxFaseName=self.getFieldFaseBillingName(nFase);
							objImportes.importesReales[auxFaseName]=objImportes.importesPorcentajeRef[auxFaseName];
						}
					}
				}
				for (var nFase=1;nFase<6;nFase++){
					fieldFaseName=self.getFieldFaseBillingName(nFase);
					vPorc=objImportes.importesReales[fieldFaseName];
					objImportes.importesReales[fieldFaseName]=totalReal*vPorc;
				}
			}
			return objImportes;
    	});
    }
    
    getBilling(otherParams){
    	// initialize and load the importes structure
    	var self=this;
    	if (self.getKey()=="BENT-411") debugger;
    	var hslifeCaches=self.getFieldLife("Billing",self.getReport().reportDateTime,otherParams);
    	var life=hslifeCaches.getValue("life");
    	var last=life[0][2]; // último snapshot
    	return last; 
    }
    getBillingLife(otherParams,theDatetime){
    	var self=this;
    	//debugger;
    	if (self.getKey()=="BENT-411") debugger;
    	if (!self.getAsyncFieldValue()){
    		self.throwAsyncException(self.getBillingLife,[otherParams,theDatetime]);
    	}
    	var report=self.getReport();
		var sComentarios=[];
		var sErrores=[];

		var arrSnapshots=[];
		var snapshot;
		var hourCost;
		var minFacturableFase;
		
		
		var configName=otherParams.getValue("config");

		
		if (!otherParams.exists("model")){
			otherParams.add("model",self.getReport().objModel);
		}
		if (!otherParams.exists("report")){
			otherParams.add("report",self.getReport().objModel);
		}
		//debugger;
		var arrHistory=getBillingLifeDates(otherParams,theDatetime,sErrores);
		var dtAux;
		//debugger;
		report.sequentialProcess(arrHistory,function(dtSnapshot){
 			dtAux=new Date(dtSnapshot);
			hourCost=self.billingParams.getHourCost(configName,dtAux);
			minFacturableFase=self.billingParams.getMinFaseFacturable(configName,dtAux);
			report.addStep("Getting billing snapshot "+dtAux,function(){
				return self.getBillingSnapShot(dtAux,hourCost,minFacturableFase);
			});
			report.addStep("Saving snapshot",function(snapshot){
				arrSnapshots.push(snapshot);
			});
		});
		report.addStep("Processing SnapShots and return",function(){
			var previousDate="";
			var antSnapshot="";
			var antImportes="";
			var antHourCost="";
			var antFase=-1;
			var actFase=-1;
			var fieldFaseName;
			var actFaseImporte=0;
			var antFaseImporte=0;
			var sSnapshotDate="";
			var importePendiente=0;
			var workedPercent=0;
			var bNoExiste=false;
			arrSnapshots.forEach(function(snapshot){
				hourCost=snapshot.source.hourCost;
				minFacturableFase=snapshot.source.minFacturableFase;
				actFase=snapshot.source.faseActual;
				sSnapshotDate=formatDate(snapshot.source.atDatetime,4);
				bNoExiste=false;
				if (actFase==="") {
					actFase=-1;
					bNoExiste=true;
				}
				if (actFase<antFase){
					sComentarios.saAppend("\n"+sSnapshotDate+" - Retrocedido a la fase:"+self.getFieldFaseBillingName(actFase)+" antes:"+self.getFieldFaseBillingName(antFase)+ " se mantiene la fase anterior");
					actFase=antFase;
				}
				snapshot.calculos.faseActual=actFase;
				snapshot.calculos.faseAnterior=antFase;
	
				snapshot.calculos.aprobado=0;
				snapshot.calculos.pendiente=0;
				snapshot.calculos.resto=0;
				snapshot.calculos.avance=0;			
				snapshot.calculos.total=0;
				snapshot.calculos.inTimespents.aprobado=0;
				snapshot.calculos.inTimespents.pendiente=0;
				snapshot.calculos.inTimespents.resto=0;
				snapshot.calculos.inTimespents.avance=0;
				snapshot.calculos.inTimespents.total=0;
				snapshot.calculos.comentarios="";
				if (bNoExiste){
					// no existia
				} else if ((previousDate==="")||(antFase<minFacturableFase)){// is the first or the first facturable
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
						snapshot.calculos.total+=actFaseImporte;
					}
					snapshot.calculos.inTimespents.aprobado=0;
					snapshot.calculos.inTimespents.pendiente=(snapshot.calculos.pendiente/hourCost)*3600;
					snapshot.calculos.inTimespents.resto=(snapshot.calculos.resto/hourCost)*3600;
					snapshot.calculos.inTimespents.total=(snapshot.calculos.total/hourCost)*3600;
					if (snapshot.calculos.inTimespents.total>0){
						snapshot.calculos.workedPercent=snapshot.calculos.inTimespents.pendiente/snapshot.calculos.inTimespents.total;
					}
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
						antFaseImporte=antSnapshot.calculos.fases.aprobado[fieldFaseName]
										+ antSnapshot.calculos.fases.pendiente[fieldFaseName]
	/*					objImportes.importesdefinidos={importesEstimados:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false},
								  importesReales:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false}};
	*/					
						if (snapshot.importesdefinidos.importesReales[fieldFaseName]){
							actFaseImporte=snapshot.importesReales[fieldFaseName];
						} else {
							actFaseImporte=antFaseImporte;
						}
						if (actFaseImporte<antFaseImporte){
							sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+" - Reducido el importe de la fase:"+fieldFaseName+" antes:"+antFaseImporte+" ahora:"+actFaseImporte+" se mantiene el anterior ("+antFaseImporte+") pero se debe corregir el error");
							actFaseImporte=antFaseImporte;
						} else if (actFaseImporte>antFaseImporte){
							sComentarios.saAppend("\n"+sSnapshotDate+" - Incrementado el importe de la fase:"+fieldFaseName+" antes:"+antFaseImporte+" ahora:"+actFaseImporte);
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
						snapshot.calculos.total+=actFaseImporte;
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
								importePendiente=actFaseImporte-
												snapshot.calculos.fases.aprobado[fieldFaseName];
								if (importePendiente<0){
									importePendiente=0;
									sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El Importe Pendiente en fase `+ fieldFaseName+` es menor que el importe aprobado en comités anteriores.
											Importe real actual ` + snapshot.importesReales[fieldFaseName] + ` 
											Se establece a 0 pero debe corregirse`);
								}
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
						var auxTimespent=snapshot.source.timespent;
						if (auxTimespent==0){
							// may be an error
							if (snapshot.importesdefinidos.importesReales.Total){
								if ((snapshot.source.importesReales.Total!=0)
										&&
								   (snapshot.source.importesReales.Total!=1)){
									sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El Tiempo imputado directamente o en sus tareas es 0.
											Pero se estableció de forma manual un importe real total ` + snapshot.source.importesReales.Total + ` 
											Se utiliza el importe real establacido manualmente (`+snapshot.source.importesReales.Total +`) pero debe corregirse`);
									auxTimespent=(snapshot.source.importesReales.Total/hourCost)*3600;
								} else {
									// no es un error.... porque es un requisito cerrado antes de ser facturado
								}
							} else if (snapshot.importesdefinidos.importesEstimados.Total){
								if ((snapshot.source.importesEstimados.Total!=0)
										&&
								    (snapshot.source.importesEstimados.Total!=1)){
									sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El Tiempo imputado directamente o en sus tareas es 0.
											Pero se estableció de forma manual un importe estimado total ` + snapshot.source.importesEstimados.Total + ` 
											Se utiliza el importe real establacido manualmente (`+snapshot.source.importesEstimados.Total +`) pero debe corregirse`);
									auxTimespent=(snapshot.source.importesEstimados.Total/hourCost)/3600;
								} else {
									// no es un error.... porque es un requisito cerrado antes de ser facturado
								}
							}
						}
						if ((auxTimespent==0)&&(workDefined>0)){
							sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El Tiempo imputado directamente o en sus tareas es 0.
									Pero en fases anteriores se facturaron importes por ` + (workDefined/3600) + ` horas 
									Se utiliza el valor facturado anteriormente (`+workDefined +`) pero debe corregirse`);
							auxTimespent=workDefined;
						}
						var falta=auxTimespent-workDefined;
						workedPercent=0;
						if (auxTimespent>0){
							workedPercent=workDefined/auxTimespent;
						}
						var percAux=0;
						for (var i=nFase;i<5;i++){
							fieldFaseName=self.getFieldFaseBillingName(i);
							percAux+=snapshot.importesEstimadosPercs[fieldFaseName];
							//example 0.57
						}
						var percAcum=percAux;
						if (percAcum<=0){
							sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El acumulado de los porcentajes de los trabajos pendientes (percAcum) es <= 0. Se establece a 1
									Esto es un error a) del programa b) de los datos de porcentajes introducidos en la estimación
									Se debe corregir` );
							percAcum=1;
						}
						var workTotal=0;
						if (actFase>=3){ // si el requisito se ha terminado de implementar o cerrado
										// el trabajo total estimado es el timespent (no se pueden planificar mas costes)
										// cualquier otro coste sera sobrevenido
							workTotal=auxTimespent;
						} else {
							// si el requisito no esta cerrado se utiliza el mayor estimado
							workTotal=snapshot.source.timeoriginalestimate;
							if (snapshot.source.timeestimate>workTotal) workTotal=snapshot.source.timeestimate;
						}
						
						var workRemaining=workTotal-workDefined;
						if (workRemaining<0){
							sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El trabajo restante es negativo. Se establece a 0
											Trabajo Aprobado:`+snapshot.calculos.inTimespents.aprobado+`
											Trabajo Pendiente:`+snapshot.calculos.inTimespents.pendiente+`
											Resto Trabajo definido:`+workDefined+`
											Trabajo definido Total:`+snapshot.calculos.inTimespents.resto+`
											Trabajo Total:`+workTotal+ "(TOE:"+snapshot.source.timeoriginalestimate
												+",TE"+snapshot.source.timeestimate+",TS:"+snapshot.source.timespent+")");
							workRemaining=0;
						}
						var workAux=0;
						var workAuxImporte=0;
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
				antSnapshot=snapshot;
				antFase=actFase;
				previousDate=snapshot.source.atDatetime;
				snapshot.calculos.errores=sErrores;
				snapshot.calculos.comentarios=sComentarios;
				
			});
		   	 
			var arrResults=[];
			var contractInitDate=(new Date());
			var objModel=self.getReport().objModel;
	
			if (objModel.variables.getVar("withAdvancedWorks")){
				contractInitDate=objModel.variables.getVar("ContractAdvancedDate");
			} else {
				contractInitDate=objModel.variables.getVar("ContractInitDate");			
			}
			// getting base snapshot
			var baseSnapshot;
		   	arrSnapshots.forEach(function(snapshot){
		   		if (snapshot.source.atDatetime.getTime()==contractInitDate.getTime()){
		   			baseSnapshot=snapshot;
		   		}
		   	});
		   	if (isDefined(baseSnapshot)){
		   		var fncAdjustNoFacturable=function(auxSnapshot){
		   			//debugger;
			   		var auxImporteNoFacturable=auxSnapshot.calculos.aprobado+auxSnapshot.calculos.pendiente;
			   		var auxTsNoFacturable=auxSnapshot.calculos.inTimespents.aprobado+auxSnapshot.calculos.inTimespents.pendiente;
			   		var avanceImporte=0;
			   		var avanceTimespent=auxSnapshot.source.timespent;
			   		if (avanceTimespent>auxTsNoFacturable){
			   			avanceTimespent-=auxTsNoFacturable;
			   			avanceImporte=(avanceTimespent/3600)*auxSnapshot.source.hourCost;
			   		} else {
			   			avanceTimespent=0;
			   			avanceImporte=0;
			   		}
		   			
			   		auxImporteNoFacturable+=avanceImporte;
			   		auxTsNoFacturable+=avanceTimespent;
		   			return {importe:auxImporteNoFacturable
		   					,timespent:auxTsNoFacturable
		   					,avance:{importe:avanceImporte,timespent:avanceTimespent}
		   					};	
		   		}
		   		var noFacturableBase=fncAdjustNoFacturable(baseSnapshot);
		   		baseSnapshot.calculos.aprobado=0;
		   		baseSnapshot.calculos.pendiente=0;
		   		baseSnapshot.calculos.inTimespents.aprobado=0;
		   		baseSnapshot.calculos.inTimespents.pendiente=0;
		   		baseSnapshot.calculos.noFacturable=noFacturableBase;
		   		
			   	arrSnapshots.forEach(function(snapshot){
			   		if (snapshot.source.atDatetime.getTime()<contractInitDate.getTime()){
			   			var noFacturable=fncAdjustNoFacturable(snapshot);
				   		snapshot.calculos.aprobado=0;
				   		snapshot.calculos.pendiente=0;
				   		snapshot.calculos.inTimespents.aprobado=0;
				   		snapshot.calculos.inTimespents.pendiente=0;
				   		snapshot.calculos.noFacturable=noFacturable;
			   		} else if (snapshot.source.atDatetime.getTime()>contractInitDate.getTime()){
				   		var auxImporteNoFacturable=noFacturableBase.importe;
				   		var auxTsNoFacturable=noFacturableBase.timespent;
				   		if (snapshot.calculos.aprobado<auxImporteNoFacturable){
				   			auxImporteNoFacturable-=snapshot.calculos.aprobado;
				   			snapshot.calculos.aprobado=0;
				   		} else {
				   			snapshot.calculos.aprobado-=auxImporteNoFacturable;
				   			auxImporteNoFacturable=0;
				   		}
				   		if (snapshot.calculos.pendiente<auxImporteNoFacturable){
				   			auxImporteNoFacturable-=snapshot.calculos.pendiente;
				   			snapshot.calculos.pendiente=0;
				   		} else {
				   			snapshot.calculos.pendiente-=auxImporteNoFacturable;
				   			auxImporteNoFacturable=0;
				   		}
	
				   		if (snapshot.calculos.inTimespents.aprobado<auxTsNoFacturable){
				   			auxTsNoFacturable-=snapshot.calculos.inTimespents.aprobado;
				   			snapshot.calculos.inTimespents.aprobado=0;
				   		} else {
				   			snapshot.calculos.inTimespents.aprobado-=auxTsNoFacturable;
				   			auxTsNoFacturable=0;
				   		}
				   		if (snapshot.calculos.inTimespents.pendiente<auxTsNoFacturable){
				   			auxTsNoFacturable-=snapshot.calculos.inTimespents.pendiente;
				   			snapshot.calculos.inTimespents.pendiente=0;
				   		} else {
				   			snapshot.calculos.inTimespents.pendiente-=auxTsNoFacturable;
				   			auxTsNoFacturable=0;
				   		}
				   		snapshot.calculos.noFacturable=noFacturableBase;
			   		}
			   	});
		   	}
			
		   	arrSnapshots.forEach(function(snapshot){
		   		//ajuste final de los calculos y preparación para el ordenamiento
		   		//debugger;
		   		var tsFacturacion=snapshot.calculos.inTimespents.aprobado
				   					+snapshot.calculos.inTimespents.pendiente;
		   		var impFacturacion=snapshot.calculos.aprobado
				   					+snapshot.calculos.pendiente;
		   		
		   		var avance=0;
		   		var avanceImporte=0;
		   		avance=snapshot.source.timespent
		   				- (tsFacturacion +snapshot.calculos.noFacturable.timespent);	
		   		avanceImporte=(avance*(snapshot.source.hourCost/3600))+impFacturacion;
		   		avance=snapshot.source.timespent - (snapshot.calculos.noFacturable.timespent);	
		   		if ((avance<0)||(avanceImporte<0)){
		   			avance=0;
		   			avanceImporte=0;
		   			snapshot.source.timeoriginalestimate=0;
		   		} else {
		   			snapshot.source.timeoriginalestimate-=snapshot.calculos.noFacturable.timespent;
		   			if (snapshot.source.timeoriginalestimate<0){
		   				snapshot.source.timeoriginalestimate=0;
		   			}
		   		}
		   		var tsEstimadoActual=snapshot.source.timeestimate+avance;
		   		var impEstimadoActual=((tsEstimadoActual-tsFacturacion)*(snapshot.source.hourCost/3600))
		   								+(impFacturacion);
		   		var bWithComprobations=objModel.variables.getVar("withComprobations");
		   		if (isUndefined(bWithComprobations)
		   				||(bWithComprobations==false)
		   				||(bWithComprobations==="") 
		   				|| (bWithComprobations=="empty")){
			   		if (avance<tsFacturacion){
			   			avance=tsFacturacion;
			   			avanceImporte=impFacturacion;
			   		}
			   		if (tsEstimadoActual<avance){
			   			tsEstimadoActual=avance;
			   			impEstimadoActual=avanceImporte;
			   		}
		   		}
		   		snapshot.calculos.inTimespents.totalEnFacturas=tsFacturacion;
		   		snapshot.calculos.totalEnFacturas=impFacturacion;
		   		snapshot.calculos.inTimespents.avance=avance;
		   		snapshot.calculos.avance=avanceImporte;
		   		snapshot.calculos.inTimespents.estimadoActual=tsEstimadoActual;
		   		snapshot.calculos.estimadoActual=impEstimadoActual;
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
		});
    }
    getBillingCacheKeyPostText(atDatetime,otherParams){
		var configName=otherParams.getValue("config");
/*		var hourCost="";
		var fromDatetime="";
		var toDateTime="";
		var minFacturableFase="";
		if (isDefined(atDatetime)){
			toDateTime=atDatetime.getTime()+"";
		}
		if (isDefined(otherParams)){
			hourCost=parseFloat(otherParams.getValue("hourCost"));
			fromDatetime=otherParams.getValue("fromDatetime");
			minFacturableFase=otherParams.getValue("minFacturableFase");
		}
*/	/*	if (fromDatetime!=""){
			if ((typeof fromDatetime==="object")&&(fromDatetime.constructor.name=="Date")){
				fromDatetime=fromDatetime.getTime()+"";
			} else {
				fromDatetime=toDateNormalDDMMYYYYHHMMSS(fromDatetime).getTime()+"";
			}
		}
	*/	//var sKey=hourCost+"-"+minFacturableFase+"-"+fromDatetime+"-"+toDateTime;
//		var sKey=configName+"-"+fromDatetime+"-"+toDateTime+"-"+hourCost+"-"+minFacturableFase;
		var sKey=configName;
		return sKey;
    }
    
    execute(){
         var selfPlg=this;
         selfPlg.report.allIssues.list.walk(function(issue){
        	 	 issue.billingParams=billingParams;
                 issue.getFieldFaseBillingName=selfPlg.getFieldFaseBillingName;
                 issue.getBillingFieldUsed=selfPlg.getBillingFieldUsed;
                 issue.initializeBilling=selfPlg.initializeBilling;
                 issue.getBilling=selfPlg.getBilling;
                 issue.getBillingLife=selfPlg.getBillingLife;
                 issue.getBillingCacheKeyPostText=selfPlg.getBillingCacheKeyPostText;
                 issue.getBillingSnapShot=selfPlg.getBillingSnapShot;
                 issue.getBillingLifeDates=selfPlg.getBillingLifeDates;
         });
    }

}