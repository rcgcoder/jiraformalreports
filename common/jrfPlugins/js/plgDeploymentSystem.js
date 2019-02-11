var plgDeploymentSystem=class plgDeploymentSystem{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         self.report=report;
         self.model=model;
         self.billingParams=billingParams;
         self.billingParams.variables=model.variables;
     }
    getDeploy(otherParams){
    	// initialize and load the importes structure
    	var self=this;
    	//debugger;
    	var hslifeCaches=self.getFieldLife("Billing",self.getReport().reportDateTime,otherParams);
    	var life=hslifeCaches.getValue("life");
    	var last=life[0][2]; // último snapshot
    	return last; 
    }
    getDeployLife(otherParams,theDatetime){
    	var self=this;
    	//debugger;
    	//if (self.getKey()=="BENT-411") debugger;
    	self.forceAsyncFieldValues(self.getBillingLife,[otherParams,theDatetime]);
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
			arrSnapshots.forEach(function(snapshot){  // cada snapshot tiene una fecha..... si aso
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
				//debugger;
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
					for (var nFase=(antFase+1);(nFase<5)&&bDefinedImporte;nFase++){
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
/*							sErrores.saAppend("\n ¡¡¡ ERROR !!! "+sSnapshotDate+` - El trabajo restante es negativo. Se establece a 0
											Trabajo Aprobado:`+snapshot.calculos.inTimespents.aprobado+`
											Trabajo Pendiente:`+snapshot.calculos.inTimespents.pendiente+`
											Resto Trabajo definido:`+workDefined+`
											Trabajo definido Total:`+snapshot.calculos.inTimespents.resto+`
											Trabajo Total:`+workTotal+ "(TOE:"+snapshot.source.timeoriginalestimate
												+",TE"+snapshot.source.timeestimate+",TS:"+snapshot.source.timespent+")");
*/							workRemaining=0;
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
                // calc de advance percent...
                snapshot.calculos.advancePercent=0;
                var percAcum=0;
                for (var i=0;i<=snapshot.calculos.faseActual;i++){
                    //debugger;  
                    fieldFaseName=self.getFieldFaseBillingName(i);
                    var percAux=snapshot.importesEstimadosPercs[fieldFaseName];
                    percAcum+=percAux;
                }
                var nextPercent=0;
                var nextFase=snapshot.calculos.faseActual+1;
                if (nextFase>4){
                    snapshot.calculos.advancePercent=1;
                } else {
                    fieldFaseName=self.getFieldFaseBillingName(nextFase);
                    nextPercent=snapshot.importesEstimadosPercs[fieldFaseName];
                    var estAct=snapshot.calculos.inTimespents.estimadoActual;
                    if (estAct==0){
                        var impEst=snapshot.importesEstimados.Total;
                        if (impEst==0){
                            estAct=snapshot.calculos.inTimespents.total;
                        } else {
                            estAct=(impEst/hourCost)*3600;
                        }
                    }
                    var advAct=snapshot.source.timespent;
                    var advAcum=estAct*percAcum;
                    var nextEstimated=estAct*nextPercent;
                    var percRest=1-percAcum;
                    var advRest=estAct*percRest;
                    var workDone=advAct-advAcum;
                    var advPercAux=0;
                    if (nextEstimated>0){
                        if (workDone>nextEstimated){
                            advPercAux=nextPercent-0.01;
                        } else {
                            advPercAux=(workDone/nextEstimated)*nextPercent;
                        }
                    } else {
                        nextPercent=0;
                    }
                    percAcum+=advPercAux;
                    snapshot.calculos.advancePercent=percAcum;
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
                   

                debugger;
                if ((snapshot.source.timeoriginalestimate!=0) &&
                    (snapshot.source.timeoriginalestimate!="")){
                    snapshot.calculos.estimadoOriginal=((snapshot.source.timeoriginalestimate)/3600)*snapshot.source.hourCost;
                } else if (snapshot.calculos.estimadoActual!=0){ 
                    snapshot.calculos.estimadoOriginal=snapshot.calculos.estimadoActual;
                } else if (snapshot.source.timespent!=0){
                    snapshot.calculos.estimadoOriginal=((snapshot.source.timespent)/3600)*snapshot.source.hourCost;
                } else {
                    snapshot.calculos.estimadoOriginal=snapshot.importesReales.Total;
                }
                snapshot.calculos.inTimespents.estimadoOriginal=(3600*snapshot.calculos.estimadoOriginal/snapshot.source.hourCost);

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
		return report.taskResultNeedsStep();
    }
    getDeployCacheKeyPostText(atDatetime,otherParams){
		var configName=otherParams.getValue("config");
		var sKey=configName;
		return sKey;
    }
    
    execute(){
         var selfPlg=this;
         var report=selfPlg.report;
         var allIssues=report.allIssues;
         report.parallelizeProcess(allIssues.list,function(issue){
        	 
         });
         
         selfPlg.report.deployments.list.walk(function(issue){
                 issue.getDeploy=selfPlg.getDeploy;
                 issue.getDeployLife=selfPlg.getDeployLife;
                 issue.getDeployCacheKeyPostText=selfPlg.getDeployCacheKeyPostText;
         });
    }

}