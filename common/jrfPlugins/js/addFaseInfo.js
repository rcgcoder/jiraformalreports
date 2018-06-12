var issueExtender=class issueExtender{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         self.report=report;
         self.model=model;
     }
    getFaseOf(sValue){ //devuelve la fase imputable del requisito o soporte
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
		tEstados["aprobado"]=1;
		tEstados["Diseñado"]=2;
		tEstados["implementado"]=3;
		tEstados["Abierta"]=0;
		tEstados["En progreso"]=2;
		tEstados["NO OK PRE AST"]=3;
		tEstados["NO OK DES AST"]=3;
		tEstados["NO OK INTEGRA"]=3;
		tEstados["Verificado DES AST"]=3;
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
		tEstados["Desplegado en PRO"]=4;
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
		tEstados["Realizada"]=4;
		tEstados["Implementada"]=3;
		tEstados["Aprobado"]=1;
		tEstados["En revisión"]=0;
		tEstados["Implementado"]=3;
		tEstados["Build Broken"]=1;
		tEstados["Convocada"]=2;
		tEstados["Building"]=1;
		tEstados["Cerrada"]=4;
		tEstados["Cerrado"]=4;
		tEstados["Closed"]=4;
		tEstados["Resolved"]=3;
		tEstados["Resuelta"]=3;
		tEstados["Resuelto"]=3;
		tEstados["Reabierta"]=0;
		var iResult=tEstados[sValue];
		if (typeof iResult!=="undefined"){
			return iResult;
		}
		return -1;
    }

    getFaseName(nFaseNum){
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
			} else { //if (FaseNum==0)
				return "Identificado";
			}
     }
    /*
	obj.importesPorcentajeRef={"Total":1,"Identificado":0,"Aprobado":0,"Disenado":0.1,"Implementado":0.8,"Desplegado":0.1};
	obj.importesEstimados={"Total":impAux,"Aprobado":0,"Disenado":impAux*0.1,
							"Implementado":impAux*0.8,"Desplegado":impAux*0.1,
							"Identificado":0
							};
	obj.importesReales={"Total":impAux*rAux,"Aprobado":0,"Disenado":impAux*0.1*(1+rAux),
									"Implementado":impAux*0.8*(1+rAux),
									"Desplegado":impAux*0.1*(1*rAux),
									"Identificado":0
							};
	obj.importesdefinidos={importesEstimados:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false},
						  importesReales:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false}};
    */
    execute(){
         var self=this;
         var fncGetFase=function(){
                var status=this.fieldValue("status.name");
                return self.getFaseOf(status);
         };
         var fncGetFaseName=function(){
             var status=this.fieldValue("Fase");
             return self.getFaseName(status);
      };
         var fncGetFaseLife=function(){
        	 var arrResults=[];
             var hsStatus=this.getFieldLife("status.name");
             var arrStatuses=hsStatus.getValue("life");
             arrStatuses.forEach(function(status){
            	 arrResults.push([status[0],self.getFaseOf(status[1]),self.getFaseOf(status[2])]);
             });
             return arrResults;
         };
         var fncGetFaseNameLife=function(){
        	 debugger;
        	 var arrResults=[];
             var hsStatus=this.getFieldLife("Fase");
             var arrStatuses=hsStatus.getValue("life");
             arrStatuses.forEach(function(status){
            	 arrResults.push([status[0],self.getFaseName(status[1]),self.getFaseName(status[2])]);
             });
             return arrResults;
         };

         self.report.treeIssues.walk(function(issue){
                 issue.getFase=fncGetFase;
                 issue.getFaseLife=fncGetFaseLife;
                 issue.getFaseName=fncGetFaseName;
         });
    }

     

}