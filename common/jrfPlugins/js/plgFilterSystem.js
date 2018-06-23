var plgFilterSystem=class plgFilterSystem{//this kind of definition allows to hot-reload
    constructor(tag,report,model){
    	 var self=this;
         self.tag=tag;
         self.report=report;
         self.model=model;
     }
	 execute(){
        var selfPlg=this;
        var filters=selfPlg.model.filters;
        selfPlg.addFilters(filters);
	 }
	 addFilters(customFilters){
		 customFilters.addFilter("wUTE",`
					/*Trabajo de la UTE (wUTE)*/
					(
						{{issue}}.fieldValue('Proyecto.key') !='OT'
					)`);
		customFilters.addFilter("wAdvIssues",`
				/*Trabajo Adelantado (wAdvIssues)*/
				(
					useFilter('wUTE') 
					&&
					({{issue}}.fieldValue('Fase',false,{{ContractAdvancedDate}}) lessThan 4) 
					&& 
					(new Date({{issue}}.fieldValue('created')) lessThan {{ContractAdvancedDate}})
				) `);
		customFilters.addFilter("wIssues",`
				/*Trabajo no Adelantado (wIssues) */
				(
					useFilter('wUTE')
					&&
					(new Date({{issue}}.fieldValue('created')) greaterThan {{ContractAdvancedDate}})
				)`);

		customFilters.addFilter("wProrroga",`
				/*Trabajo de la Prorroga (wProrroga) */
				(
					useFilter('wAdvIssues')
					|| 
					useFilter('wIssues')
				)`);

		customFilters.addFilter("wAlgoFacturado",`
				/*Trabajo con importe aprobado (wAlgoFacturado) */
				(
					(
					useFilter('wAdvIssues')
					&& 
					({{issue}}.fieldValue('Fase',false,{{ReportInitDate}}) greaterOrEqualThan {{MinFacturableFase_UTE}})
					)
					||
					(
					useFilter('wIssues') 
					&& 
					({{issue}}.fieldValue('Fase',false,{{ReportInitDate}}) greaterOrEqualThan {{MinFacturableFase_Prorroga}})
					)
				)`);
		customFilters.addFilter("wFaseFacturable",`
				/*Trabajo en Fase Facturable (wFaseFacturable)*/
				(
					(
					useFilter('wAdvIssues')
					&& 
					({{issue}}.fieldValue('Fase',false,{{ReportEndDate}}) greaterOrEqualThan {{MinFacturableFase_UTE}})
					)
					||
					(
					useFilter('wIssues') 
					&& 
					({{issue}}.fieldValue('Fase',false,{{ReportEndDate}}) greaterOrEqualThan {{MinFacturableFase_Prorroga}})
					)
				)`);


		customFilters.addFilter("wMismaFase",`
				/*Trabajo sin cambio de Fase durante el periodo (wMismaFase)*/
				(  
					useFilter('wProrroga')
					&&
					(
					({{issue}}.fieldValue('Fase',false,{{ReportEndDate}})) 
						== 
					({{issue}}.fieldValue('Fase',false,{{ReportInitDate}}))
					) 
				)`);

		customFilters.addFilter("wAvanceFase",`
				/*Trabajo con cambio de Fase durante el periodo (wAvanceFase)*/
				(  
					useFilter('wProrroga')
					&& 
					(!
						useFilter('wMismaFase´)
					) 
					&&
					(
					({{issue}}.fieldValue('Fase',false,{{ReportEndDate}})) 
						greaterThan 
					({{issue}}.fieldValue('Fase',false,{{ReportInitDate}}))
					) 
				)`);
		customFilters.addFilter("wFacturablePorFase",`
				/*Trabajo Facturable durante el periodo por haber cambiado de fase (wFacturablePorFase)*/
				(  
					useFilter('wAvanceFase') 
					&& 
					useFilter('wFaseFacturable')
				)`);
		customFilters.addFilter("wFacturablePorTiempoTrabajado",`
				/*Trabajo Facturable durante el periodo por haber incrementado el tiempo trabajado acumulado (wFacturablePorTiempoTrabajado)*/
				(   
					useFilter('wMismaFase')
					&& 
					useFilter('wFaseFacturable')
					&&	
					(
						useFilter('childTimespentAtEnd') 
						greaterThan 
						useFilter('childTimespentAtIni')
					)
				)`);

		customFilters.addFilter("wRetrocedidoFase",`
				/*Trabajo con cambio de Fase durante el periodo que ha retrocedido de Fase (wRetrocedidoFase)*/
				(  
					useFilter('wProrroga') 
					&& (!useFilter('wMismaFase')) && (useFilter('wAlgoFacturado') || useFilter('wFaseFacturable')) 
					(
					({{issue}}.fieldValue('Fase',false,{{ReportEndDate}})) 
						lessThan 
					({{issue}}.fieldValue('Fase',false,{{ReportInitDate}}))
					) 
				)`);
		customFilters.addFilter("wReducidoTimespent",`
				/*Trabajo sin cambio de Fase durante el periodo que ha reducido el tiempo trabajado acumulado (wReducidoTimespent)*/
				(  
					useFilter('wProrroga')
					&& (useFilter('wMismaFase')) 
					&& (useFilter('wAlgoFacturado') || useFilter('wFaseFacturable')) 
					&&	(
						useFilter('childTimespentAtEnd') lessThan useFilter('childTimespentAtEnd')
					)
				)`);

		customFilters.addFilter("childTimespentAtEnd",`
				/*Tiempo Acumulado en hijos al final del periodo (childTimespentAtEnd)*/
				(
					{{issue}}.fieldAccumChilds ('timespent',{{ReportEndDate}})
				)`);

		customFilters.addFilter("childTimespentAtIni",`
				/*Tiempo Acumulado en hijos al inicio del periodo (childTimespentAtIni)*/
				(
					{{issue}}.fieldAccumChilds ( 'timespent',{{ReportInitDate}} )
				)`);

		customFilters.addFilter("childTimespentError",`
				/*- Error en Tiempo Acumulado en hijos (childTimespentError)
				(
					(isUndefined(useFilter('childTimespentAtEnd')))
					||(useFilter('childTimespentAtEnd')=="")
					||(useFilter('childTimespentAtEnd')==0)
					||(isNaN(useFilter('childTimespentAtEnd')))
				)`);

		customFilters.addFilter("errorTimespentInforme",`
				/*- caso 1 - que hayan facturado o sean facturables y no se pueda calcular el tiempo trabajado acumulado (errorTimespentInforme))
				(
					(useFilter('wAlgoFacturado') || useFilter('wFacturable')) 
					&& 
					useFilter('childTimespentError')
				)`);
	 }
}

