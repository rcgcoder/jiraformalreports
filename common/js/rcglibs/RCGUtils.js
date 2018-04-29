class RCGUtils{
    constructor(bMakeGlobals,basePath,customRequireFunction) {
    	var self=this;
		if (!isInNodeJS()){
			window.global=window;
		}
    	self.basePath="./";
		if (isDefined(basePath)){
			self.basePath=basePath;
		}
    	self.arrLibs=[
    		"RCGStringUtils.js",
    		"RCGMathUtils.js"/*,
    		"DateUtils.js",
    		"LogUtils.js",
    		"ListUtils.js",
    		"AsyncUtils.js",
    		"ExcelUtils.js",
    		"ChronoUtils.js",
    		"HashMapUtils.js",
    		"DynamicObjectUtils.js"*/
    	//	,"MongoUtils.js"
    		];
    	if (isInNodeJS()){
    		self.require=require;
    	} else {
	    	if (isDefined(customRequireFunction)){
	    		self.require=customRequireFunction;
	    	} else {
	    		self.require=function(sLibName){
	    			log("Require is no used for "+sLibName);
	    		}
	    	}
    		window.require=function(sLibName){
    			self.require(self.basePath+sLibName);
    		}
    	}
	}

    loadUtils(bMakeGlobals){
    	var self=this;
    	self.requireLibs(bMakeGlobals,self.arrLibs);
    }
    makeGlobals(bMakeGlobals,obj){
    	var self=this;
		if (isUndefined(bMakeGlobals)) return;
		if (bMakeGlobals==true){
			var arrProperties=Object.getOwnPropertyNames(obj.__proto__);
			for (var i=0;i<arrProperties.length;i++){
				var vPropName=arrProperties[i];
				if (vPropName!=="constructor"){
					var vPropValue=obj[vPropName];
					if (isMethod(vPropValue)){
						global[vPropName]=vPropValue;
					}
				}
			}
	    }		
	}

	requireLib(bMakeGlobals,sNameLib){
    	var self=this;
		console.log(sNameLib);
		var vLib=self.require(sNameLib);
		var obj=new vLib();
	    self.makeGlobals(bMakeGlobals,obj);
	}
	
	requireLibs(bMakeGlobals,arrLibs){
    	var self=this;
	    for (var i=0;i<arrLibs.length;i++){
	    	var sNameLib=arrLibs[i];
	    	self.requireLib(bMakeGlobals,sNameLib);
	    }
	}
}
