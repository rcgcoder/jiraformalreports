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
		tEstados[""]=-1;
		var iResult=tEstados[sValue];
		if (typeof iResult!=="undefined"){
			return iResult;
		}
		return -1;
    }

    getFaseName(nFaseNum){
    		if (nFaseNum==4){
				return "Desplegado";
			} else if (nFaseNum==3){
				return "Implementado";
			} else if (nFaseNum==2){
				return "Diseñado";
			} else if (nFaseNum==1){
				return "Aprobado";
			} else if (FaseNum==0) {
				return "Identificado";
			} else {
				return "No creado";
			}
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
		} else if (FaseNum==0) {
			return "Identificado";
		} else {
			return "NoCreado";
		}
    }
    initilizeBilling(atDatetime){
    	var objImportes={};
		var faseActual=this.fieldValue("Fase",false,atDatetime);
		var timeoriginalestimate=this.fieldValue("timeoriginalestimate",false,atDatetime);
		var timeestimate=this.fieldValue("timeestimate",false,atDatetime);
		var timespent=this.fieldValue("timespent",false,atDatetime);
		if (timeoriginalestimate=="") timeoriginalestimate=0; else timeoriginalestimate=parseFloat(timeoriginalestimate);
		if (timeestimate=="") timeestimate=0; else timeestimate=parseFloat(timeestimate);
		if (timespent=="") timespent=0; else timespent=parseFloat(timespent);
    	objImportes.source={
    				  timeoriginalestimate:timeoriginalestimate,
    				  timeestimate:timeestimate,
    				  timespent:timespent,
    				  faseActual:faseActual,
	    			  importesEstimados:{"Total":"","Identificado":"","Aprobado":"","Disenado":"","Implementado":"","Desplegado":""},
					  importesReales:{"Total":"","Identificado":"","Aprobado":"","Disenado":"","Implementado":"","Desplegado":""},
					  bImportesRealesBlanco:false,
					  bImportesRealesCero:false,
					  acumFasesEstimado:0,
					  acumFasesReal:0
    				};
    	objImportes.importesPorcentajeRef={"Total":1,"Identificado":0,"Aprobado":0,"Disenado":0.1,"Implementado":0.8,"Desplegado":0.1};
    	objImportes.importesEstimados={"Total":0,"Aprobado":0,"Disenado":0,
    							"Implementado":0,"Desplegado":0,
    							"Identificado":0
    							};
    	objImportes.importesReales={"Total":0,"Aprobado":0,"Disenado":0,
    									"Implementado":0,
    									"Desplegado":0,
    									"Identificado":0
    							};
    	objImportes.importesdefinidos={importesEstimados:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false},
    						  importesReales:{"Total":false,"Identificado":false,"Aprobado":false,"Disenado":false,"Implementado":false,"Desplegado":false}};
   
    	var arrFields=[];
    	arrFields.push(["Importe Estimado Diseño","Disenado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Implementación","Implementado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Despliegue","Desplegado","importesEstimados"]);
    	arrFields.push(["Importe Estimado Total","Total","importesEstimados"]);

    	arrFields.push(["Importe Real Aprobación","Aprobado","importesReales"]);
    	arrFields.push(["Importe Real Diseño","Diseñado","importesReales"]);
    	arrFields.push(["Importe Real Implementación","Implementado","importesReales"]);
    	arrFields.push(["Importe Real Despliegue","Desplegado","importesReales"]);
    	arrFields.push(["Importe Real Total","Total","importesReales"]);
    	var vValue;
    	var bWithValue;
    	arrFields.forEach(function (fieldImporte){
    		bWithValue=false;
    		vValue=this.fieldValue(fieldImporte[0],false,atDatetime);
    		if ((vValue=="") || (isUndefined(vValue)))
    			vValue=0;
    		else {
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
			fieldFaseName=this.getFieldFaseBillingName(nFase);
			bUndefinedEstimado=(!objImportes.importesdefinidos.importesEstimados[fieldFaseName]);
			bUndefinedReal=(!objImportes.importesdefinidos.importesReales[fieldFaseName]);
			if (!bUndefinedEstimado) impEst=objImportes.source.importesEstimados[fieldFaseName];
			if (!bUndefinedReal) impReal=objImportes.source.importesReales[fieldFaseName];
			if (bUndefinedEstimado) impEst=impReal;
			if (bUndefinedReal) impReal=impEst;
			objImportes.importesEstimados[fieldFaseName]=impEst;
			objImportes.importesReales[fieldFaseName]=impReal;
			if (nFase<5) {
				objImportes.acumFasesEstimado+=impEst;
				objImportes.acumFasesReal+=impReal;
			}
		}
    	return objImportes;
    }
    
    getBilling(atDatetime,hourCost){
   	 	debugger;
    	// initialize and load the importes structure
    	var objImportes=initilizeImportes(atDatetime);
    	var vPorc;
		var tEstimado;
		var tReal;
		var totalEstimado;
		var totalReal;
		
		tReal=objImportes.source.timespent;
		tEstimado=objImportes.source.timeestimate;
		
		var servicio=this.fieldValue("project.key");
		var tipo=this.fieldValue("issuetype.name");
		
		if (servicio!="OT"){
			if ((tipo=="Tarea")||(tReal==0)) tReal=tEstimado;
			if (tEstimado==0) tEstimado=tReal;
		}
		
		var acumFasesEstimado=objImportes.acumFasesEstimado;
		var acumFasesReal=objImportes.acumFasesReal;
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
					objImportes.importesEstimados[this.getFieldFaseBillingName(4)]=1;
				}
			}
			for (var nFase=1;nFase<5;nFase++){
				fieldFaseName=this.getFieldFaseBillingName(nFase);
				vPorc=objImportes.importesEstimados[fieldFaseName];
				objImportes.importesEstimados[fieldFaseName]=totalEstimado*vPorc;
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
				fieldFaseName=this.getFieldFaseBillingName(nFase);
				vPorc=objImportes.importesReales[fieldFaseName];
				objImportes.importesReales[fieldFaseName]=totalReal*vPorc;
			}
		}
		return objImportes;
    }
    
    
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
                 issue.getFaseNameLife=fncGetFaseNameLife;
                 issue.getFieldFaseBillingName=self.getFieldFaseBillingName;
                 issue.initilizeBilling=self.initilizeBilling;
                 issue.getBilling=self.getBilling;
         });
    }

     

}