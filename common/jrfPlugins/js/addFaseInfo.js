var issueExtender=class issueExtender{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         debugger;
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

    execute(){
         var self=this;
         var fncGetFase=function(){
                var status=this.fieldValue("status.name");
                return self.getFaseOf(status);
         };
         var fncGetFaseLife=function(){
        	 debugger;
        	 var arrResults=[];
             var hsStatus=this.getFieldLife("status.name");
             var arrStatuses=hsStatus.getValue("life");
             arrStatuses.forEach(function(status){
            	 arrResults.push([status[0],self.getFaseOf(status[1]),self.getFaseOf(status[2])]);
             });
             return arrResults;
         };

         self.report.treeIssues.walk(function(issue){
                 issue.getFase=fncGetFase;
                 issue.getFaseLife=fncGetFaseLife;
         });
    }

     

}