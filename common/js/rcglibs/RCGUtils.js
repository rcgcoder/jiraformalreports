var arrLibs=[
	"./StringUtils.js","./MathUtils.js","./DateUtils.js","./LogUtils.js","./ListUtils.js",
	"./AsyncUtils.js","./ExcelUtils.js","./ChronoUtils.js","./HashMapUtils.js","./DynamicObjectUtils.js"
	,"./MongoUtils.js"
	];

function makeGlobals(bMakeGlobals,obj){
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
if (!isDefined(require)){
	var require=function(){
		
	}
}

function requireLib(bMakeGlobals,sNameLib){
	console.log(sNameLib);
	var vLib=require(sNameLib);
	var obj=new vLib();
    makeGlobals(bMakeGlobals,obj);
}

function requireLibs(bMakeGlobals,arrLibs){
    for (var i=0;i<arrLibs.length;i++){
    	var sNameLib=arrLibs[i];
    	requireLib(bMakeGlobals,sNameLib);
    }
}

class RCGUtils{
    constructor(bMakeGlobals) {
    	var self=this;
    	requireLibs(bMakeGlobals,arrLibs);
    	self.requireLib=requireLib;
    	self.requireLibs=requireLibs;
	}
}
/*var rcgutils=new RCGUtils(true);
mongoCreateConnect("mongodb://192.168.100.14:27017/myproject","myCollection",
		function(){
			log("Connected");
		});
for (var i=0;i<10;i++){
	mongoInsertOne({id:i,value:i},function(){
				log("inserted");
			});
}
*/