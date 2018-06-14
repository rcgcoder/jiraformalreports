var plgBillingSystem=class plgBillingSystem{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         self.report=report;
         self.model=model;
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
    	arrFields.push(["Importe Real Diseño","Diseñado","importesReales"]);
    	arrFields.push(["Importe Real Implementación","Implementado","importesReales"]);
    	arrFields.push(["Importe Real Despliegue","Desplegado","importesReales"]);
    	arrFields.push(["Importe Real Total","Total","importesReales"]);
    	oResult.arrFieldsForCalc=arrFields;
    	oResult.arrBaseFields=["Fase","timeoriginalestimate","timeestimate","timespent"];
    	return oResult;
    }
    initializeBilling(otherParams,atDatetime){
    	var self=this;
    	var objImportes={};
		var faseActual=self.fieldValue("Fase",false,atDatetime);
		var timeoriginalestimate=self.fieldValue("timeoriginalestimate",false,atDatetime);
		var timeestimate=self.fieldValue("timeestimate",false,atDatetime);
		var timespent=self.fieldValue("timespent",false,atDatetime);
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
    	objImportes.calculos={aprobado:0,pendiente:0,resto:0,comentarios:""};
    	var arrFields=self.getBillingFieldUsed().arrFieldsForCalc;
    	var vValue;
    	var bWithValue;
    	arrFields.forEach(function (fieldImporte){
    		bWithValue=false;
    		vValue=self.fieldValue(fieldImporte[0],false,atDatetime);
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
			fieldFaseName=self.getFieldFaseBillingName(nFase);
			bUndefinedEstimado=(!objImportes.importesdefinidos.importesEstimados[fieldFaseName]);
			bUndefinedReal=(!objImportes.importesdefinidos.importesReales[fieldFaseName]);
			if (!bUndefinedEstimado) impEst=objImportes.source.importesEstimados[fieldFaseName];
			if (!bUndefinedReal) impReal=objImportes.source.importesReales[fieldFaseName];
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
    
    getBilling(otherParams,atDatetime){
    	// initialize and load the importes structure
    	var objImportes=this.initializeBilling(atDatetime);
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
		
		var hourCost=parseFloat(otherParams.getValue("hourCost"));
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
		debugger;
		var fromDatetime=parseFloat(otherParams.getValue("fromDatetime"));
		var antImportes="";
		var antFase=0;
		if ((fromDatetime!="")&&(fromDatetime!=atDatetime)){
			antImportes=self.getBilling(otherParams,atDatetime);
			antFase=antImportes.source.faseActual;
		}
		var actFase=objImportes.source.faseActual;
		var antFaseImporte=0;
		var actFaseImporte=0;
		var sComentarios="";
		if (actFase<antFase){
			sComentarios+="\nRetrocedido a la fase:"+fieldFaseName+" antes:"+this.getFieldFaseBillingName(antFase);
		}
		for (var nFase=0;nFase<5;nFase++){
			fieldFaseName=this.getFieldFaseBillingName(nFase);
			actFaseImporte=objImportes.importesReales[fieldFaseName];
			if (antImportes!=""){
				antFaseImporte=antImportes.importesReales[fieldFaseName];
				if (actFaseImporte<antFaseImporte){
					sComentarios+="\nReducido el importe de la fase:"+fieldFaseName+" antes:"+antFaseImporte+" ahora:"+actFaseImporte;
				}
				if (actFaseImporte>antFaseImporte){
					sComentarios+="\nIncrementado el importe de la fase:"+fieldFaseName+" antes:"+antFaseImporte+" ahora:"+actFaseImporte;
				}
			} else {
				antFaseImporte=0;
			}
			if (actFase<nFase){
				objImportes.calculos.resto+=actFaseImporte;
			} else { 
				if (antFase>=nFase){
					objImportes.calculos.aprobado+=antFaseImporte;
					objImportes.calculos.pendiente+=(actFaseImporte-antFaseImporte);
				} else {
					objImportes.calculos.aprobado+=antFaseImporte;
				}
			}
		}
		return objImportes;
    }
    getBillingLife(otherParams){
	   	 var self=this;
	   	 var arrResults=[];
	   	 var arrFields=self.getBillingFieldUsed();
	   	 var hsDateChanges=newHashMap();
	   	 arrFields.arrBaseFields.forEach(function (fieldName){
	            var hsStatus=self.getFieldLife(fieldName);
	            var arrStatuses=hsStatus.getValue("life");
	            arrStatuses.forEach(function(status){
	           	 	if (!hsDateChanges.exists(status[0])) hsDateChanges.add(status[0],status[0]);
	            });
	   	 });
	   	 arrFields.arrFieldsForCalc.forEach(function (fieldInfo){
	            var hsStatus=self.getFieldLife(fieldInfo[0]);
	            var arrStatuses=hsStatus.getValue("life");
	            arrStatuses.forEach(function(status){
	           	 	if (!hsDateChanges.exists(status[0])) hsDateChanges.add(status[0],status[0]);
	            });
	   	 });
	   	 hsDateChanges.walk(function(atDatetime){
	   		var billing=self.getBilling(otherParams,atDatetime);
	      	arrResults.push([atDatetime,"",billing]);
	   	 });
	   	 
	   	 debugger;
	   	 
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
    
    
    execute(){
         var selfPlg=this;
         selfPlg.report.treeIssues.walk(function(issue){
                 issue.getFieldFaseBillingName=selfPlg.getFieldFaseBillingName;
                 issue.getBillingFieldUsed=selfPlg.getBillingFieldUsed;
                 issue.initializeBilling=selfPlg.initializeBilling;
                 issue.getBilling=selfPlg.getBilling;
                 issue.getBillingLife=selfPlg.getBillingLife;
         });
    }

}