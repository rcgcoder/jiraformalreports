var FaseEquivalences;    
var refreshFases=function(){
	// Requisito: 
	// fase 0: Requisito en fase de identificación.
	// fase 1: el requisito esta aprobado
	// fase 2: el requisito esta diseñado
	// fase 3: el requisito esta implementado
	// fase 4: Desplegado en PRO.
	
	// Soporte:
	// fase 0: Actuación en fase de identificación/analisis/diseño
	// fase 1: no existe
	// fase 2: no existe
	// fase 3: no existe
	// fase 3: implementado
	// fase 4: desplegado en PRO.
	// Reunion:
	// fase 4: Celebrada
	// fase 4: Celebrada
	// OT
	var tEstados=[];
	tEstados["Open"]=0;
	tEstados["aprobado"]=1;
	tEstados["Diseñado"]=2;
	tEstados["implementado"]=3;
	tEstados["Abierta"]=0;
	tEstados["En progreso"]=2;
	tEstados["NO OK PRE AST"]=3;
	tEstados["NO OK DES AST"]=3;
	tEstados["NO OK INTEGRA"]=3;
	tEstados["Verificado DES AST"]=3;
	tEstados["In Progress"]=2;
	tEstados["En progreso PRE AST"]=3;
	tEstados["En progreso DES AST"]=3;
	tEstados["Verificado Integra"]=3;
	tEstados["En progreso Integra"]=3;
	tEstados["Enviado a Integra"]=3;
	tEstados["Validado DES UTE"]=3;
	tEstados["Validado en DES OT-SAE"]=3;
	tEstados["Validado en PRE OT-SAE"]=3;
	tEstados["Validado en Integra OT-SAE"]=3;
	tEstados["Reabierto"]=3;
	tEstados["Desplegado en PRE"]=3;
	tEstados["Desplegado en DES"]=3;
	tEstados["Enviado a PRO"]=3;
	tEstados["Enviado a PRE"]=3;
	tEstados["Enviado a DES"]=3;
	tEstados["Validado en Integra UTE"]=3;
	tEstados["Validado en DES UTE"]=3;
	tEstados["Validado en PRE UTE"]=3;
	tEstados["Desplegado en Integra"]=3;
	tEstados["Abierta"]=0;
	tEstados["Listo"]=0;
	tEstados["Por hacer"]=0;
	tEstados["Implementada"]=3;
	tEstados["Aprobado"]=1;
	tEstados["En revisión"]=0;
	tEstados["Implementado"]=3;
	tEstados["Build Broken"]=1;
	tEstados["Convocada"]=2;
	tEstados["Building"]=1;
	tEstados["Resolved"]=3;
	tEstados["Resuelta"]=3;
	tEstados["Resuelto"]=3;
	tEstados["Reabierta"]=0;
	tEstados["Desplegado en PRO"]=4;
	tEstados["Realizada"]=4;
	tEstados["Cerrada"]=4;
	tEstados["Cerrado"]=4;
	tEstados["Closed"]=4;
	tEstados[""]=-1;
	FaseEquivalences=tEstados;
}

var plgFaseInfo=class plgFaseInfo{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         self.report=report;
         self.model=model;
     }
    getFaseOf(sValue){ //devuelve la fase imputable del requisito o soporte
    	if (isUndefined(FaseEquivalences)){
    		refreshFases();
    	}
		var iResult=FaseEquivalences[sValue];
		if (typeof iResult!=="undefined"){
			return iResult;
		}
		return -1;
    }

    getFaseName(nFaseNum){
    		if (nFaseNum===""){
				return "No creado";
    		} else if (nFaseNum==4){
				return "Desplegado";
			} else if (nFaseNum==3){
				return "Implementado";
			} else if (nFaseNum==2){
				return "Diseñado";
			} else if (nFaseNum==1){
				return "Aprobado";
			} else if (nFaseNum==0) {
				return "Identificado";
			} else {
				return "No creado";
			}
     }
 	getChildsCounter(otherParams){
    	var self=this;
    	//debugger;
    	var hslifeCaches=self.getFieldLife("ChildsCounter",self.getReport().reportDateTime,otherParams);
    	var life=hslifeCaches.getValue("life");
    	if (life.length==0) {
    		var objResult={total:0};
    		for (var i=0;i<5;i++){
    			var faseName=self.getFaseName(undefined,i);
    			objResult[faseName]=0;
    		}
    		return objResult;
    	}
    	var last=life[0][2]; // último valor
    	return last; 
    };
	getChildsCounterLife(){
    	var self=this;
//    	debugger;
    	var hsChilds=self.getChilds();
    	var hsDates=newHashMap();
    	var fncNewHistory=function(theDate){
    		var objResult={date:theDate
    						,previous:{total:0}
    						,actual:{total:0}
    						};
    		for (var i=0;i<5;i++){
    			var faseName=self.getFaseName(undefined,i);
    			objResult.previous[faseName]=0;
    			objResult.actual[faseName]=0;
    		}
    		return objResult;
    	}
    	self.forceAsyncFieldValues(self.getChildsCounterLife);
		var report=self.getReport();
		report.addStep("Getting life of childs",function(){
    		report.workOnListSteps(hsChilds,function(issue){
				issue.pushAsyncFieldValue(true);
	    		var tsCreate;
	    		var tsChangeStatus;
	    		var hsFieldLife=issue.getFieldLife("Fase");
	    		var arrHistory=hsFieldLife.getValue("life");
	    		arrHistory.forEach(function(status){// 0: datetime of change, 1:previous value, 2:new value
	    			var dtIssueChange=dateAdd(onlyDate(status[0]),"day",1);
	    			var iFaseAnt=status[1];
	    			var iFaseAct=status[2];
	    			var tsIssueChange=dtIssueChange.getTime()+"";
	    			if (!hsDates.exists(tsIssueChange)){
	    				hsDates.add(tsIssueChange,fncNewHistory(dtIssueChange));
	    			}
	    		});
	    		issue.popAsyncFieldValue();
	    	});
		});
    	var arrHistory=[];
		report.addStep("Processing Dates and return result",function(){
    		self.getFactory().workOnListSteps(hsChilds,function(issue){
    			hsDates.walk(function(status,iDeep,tsChange){
	        		var issFase=issue.fieldValue("Fase",false,status.date);
	        		if (isDefined(issFase)&&(issFase!=="")&&(issFase>=0)){
	        			var faseName=self.getFaseName(undefined,issFase);
	        			status.actual[faseName]++;
	        			status.actual.total++;
	        		}
		    	});
    		});
    		report.addStep("Sorting result",function(){
    			hsDates.walk(function(status,iDeep,tsChange){
		        	if (status.actual.total>0){
		        		arrHistory.push([status.date,status.previous,status.actual]);
		        	}
    			});
		    	arrHistory.sort(function(a,b){
		    		var aTime=a[0].getTime();
		    		var bTime=b[0].getTime();
		    		if (aTime<bTime) return 1;
		    		if (aTime>bTime) return -1;
		    		return 0;
		    	});
			   	for (var i=0;i<(arrHistory.length-1);i++){
			   		arrHistory[i][1]=arrHistory[i+1][2];
			   	}
			   	return arrHistory;
    		});
		});
		return report.taskResultNeedsStep();
    };
    
    execute(){
         var self=this;
         var fncGetFase=function(){
                var status=this.fieldValue("status.name");
                return self.getFaseOf(status);
         };
         var fncGetFaseName=function(otherParams,faseIndex){
        	 if (this.getKey()=="CDM-14"){
        		 debugger;
        	 }
             var status=faseIndex;
             if (isUndefined(status)) status=this.fieldValue("Fase",false,undefined,otherParams);
             return self.getFaseName(status);
         };
         var fncGetFaseLife=function(){
        	 var arrResults=[];
             var hsStatus=this.getFieldLife("status.name");
             var arrStatuses=hsStatus.getValue("life");
             arrStatuses.forEach(function(status){
            	 arrResults.push([status[0],self.getFaseOf(status[1]),self.getFaseOf(status[2]),"system"]);
             });
             return arrResults;
         };
         var fncGetFaseNameLife=function(){
        	 var arrResults=[];
             var hsStatus=this.getFieldLife("Fase");
             var arrStatuses=hsStatus.getValue("life");
             arrStatuses.forEach(function(status){
            	 arrResults.push([status[0],self.getFaseName(status[1]),self.getFaseName(status[2]),"system"]);
             });
             return arrResults;
         };

         self.report.allIssues.list.walk(function(issue){
                 issue.getFase=fncGetFase;
                 issue.getFaseLife=fncGetFaseLife;
                 issue.getFaseName=fncGetFaseName;
                 issue.getFaseNameLife=fncGetFaseNameLife;
              	 issue.getChildsCounter=self.getChildsCounter;
              	 issue.getChildsCounterLife=self.getChildsCounterLife;
         });
    }
}