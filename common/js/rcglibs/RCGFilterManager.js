var newRCGFilterManagerFactory=function(){
	var dynObj=newDynamicObjectFactory(
					[{name:"Filter",description:"Filters",type:"string"},
					 {name:"FilterCache",description:"Filters",type:"string"}
						],
					[],
					[]);
	dynObj.functions.add("newFilter",function(filterName,filterBody){
		var self=this;
		if (self.existsFilterCache(filterName)){
			var hsCache=self.getFilterCaches();
			hsCache.remove(filterName);
		}
		self.setFilter(filterName,filterBody);
	});
	dynObj.functions.add("useFilter",function(filterString){
		var self=this;
		var sResult=self.getFilterCacheById(filterString);
		if (sResult!="") return sResult;
		var sPartialResult="";
		if (self.existsFilter(filterString)){
			sPartialResult=self.getFilterById(filterString);
		} else {
			sPartialResult=filterString;
		}
		sResult=sPartialResult;
		var arrFilterParts;
		var arrFilterNameParts;
		var iFilterRow=0;
		var sSubFilterName="";
		var sFilterRow;
		var sRestRow="";
		var sResultAux="";
		var iPos=sPartialResult.indexOf("useFilter");
		while (iPos>=0){
			arrFilterParts=ssPartialResult.split("useFilter(");
			sResult="";
			if (iPos==0){
				iFilterRow=0;
			} else {
				sResult+=arrFilterParts[0];
				iFilterRow=1;
			}
			while (iFilterRow<arrFilterParts.length){
				sFilterRow=arrFilterParts[iFilterRow];
				arrFilterNameParts=sFilterRow.split(")");
				sSubFilterName=arrFilterNameParts[0];// "filtername" or 'filtername' or `filtername`
				sSubFilterName=replaceAll(sSubFilterName,"'","");
				sSubFilterName=replaceAll(sSubFilterName,"\"","");
				sSubFilterName=replaceAll(sSubFilterName,"\n","");
				sSubFilterName=replaceAll(sSubFilterName,"\r","");
				sSubFilterName=replaceAll(sSubFilterName,"\t","");
				sSubFilterName=replaceAll(sSubFilterName," ","");
				sSubFilterName=removeInnerTags(sSubFilterName,true);
				sResultAux=self.useFilter(sSubFilterName);
				sResult+=sResultAux;
				for (var j=1;j<arrFilterNameParts.length;j++){
					sResult+=arrFilterNameParts[j];
				}
				iFilterRow++;
			}
			sPartialResult=sResult;
			iPos=sPartialResult.indexOf("useFilter");
		}
		self.setFilterCache(filterString,sResult);
		return sResult;
	});
	return dynObj;
}
var RCGFilterManagerFactory=newRCGFilterManagerFactory();
var newRCGFilterManager=function(){
	return RCGFilterManagerFactory.new();
} 
