class RCGUtils{
    constructor(bMakeGlobals) {
    	var self=this;
    	self.arrLibs=[
    		"./StringUtils.js","./MathUtils.js","./DateUtils.js","./LogUtils.js","./ListUtils.js",
    		"./AsyncUtils.js","./ExcelUtils.js","./ChronoUtils.js","./HashMapUtils.js","./DynamicObjectUtils.js"
    		,"./MongoUtils.js"
    		];
    	if (typeof require==="undefined"){
    		self.require=function(sLibName){
    			
    		}
    		require=function(sLibName){
    			self.require(sLibName);
    		}
    	} else {
    		self.require=require;
    	}

	}

    loadUtils(bMakeGlobals){
    	var self=this;
    	self.requireLibs(bMakeGlobals,self.arrLibs);
    }
    makeGlobals(bMakeGlobals,obj){
		if (isUndefined(bMakeGlobals)) return;
		if (bMakeGlobals==true){
			var arrProperties=Object.getOwnPropertyNames(obj.__proto__);
			for (var i=0;i<arrProperties.length;i++){
				var vPropName=arrProperties[i];
				if (vPropName!=="constructor"){
					var vPropValue=obj[vPropName];
					if (isMethod(vPropValue)){
						if (isUndefined(global[vPropName])){
							global[vPropName]=vPropValue;
						}
					}
				}
			}
	    }		
	}

	requireLib(bMakeGlobals,sNameLib){
		console.log(sNameLib);
		var vLib=require(sNameLib);
		var obj=new vLib();
	    makeGlobals(bMakeGlobals,obj);
	}
	
	requireLibs(bMakeGlobals,arrLibs){
	    for (var i=0;i<arrLibs.length;i++){
	    	var sNameLib=arrLibs[i];
	    	requireLib(bMakeGlobals,sNameLib);
	    }
	}

}
