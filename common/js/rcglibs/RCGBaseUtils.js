var bInNodeJS=false;
if (typeof require!=="undefined"){
	bInNodeJS=true;
	'use strict';
	var shell = require('shelljs' );
	var StackUtils=require("./StackUtils.js");
}

function isInNodeJS(){
	return bInNodeJS;
}
function clone(srcObj){
	var result={};
	var arrProperties=Object.getOwnPropertyNames(srcObj);
	for (var i=0;i<arrProperties.length;i++){
		var vPropName=arrProperties[i];
		//if (vPropName!=="constructor"){
			var vPropValue=srcObj[vPropName];
			//if (isMethod(vPropValue)){
				if (isUndefined(result[vPropName])){
					result[vPropName]=vPropValue;
				}
			//}
		//}
	}
	return result;
}

function objEquals(aObj,bObj){
	var arrAProperties=Object.getOwnPropertyNames(aObj);
	var arrBProperties=Object.getOwnPropertyNames(bObj);
	if (arrAProperties.length!=arrBProperties.length){
		return false;
	}
	var bEquals=true;
	for (var i=0;(i<arrAProperties.length)&&bEquals;i++){
		var vPropName=arrAProperties[i];
		var vAPropValue=aObj[vPropName];
		if (!isMethod(vAPropValue)){
			var vBPropValue=bObj[vPropName];
			if (isObject(vAPropValue)){
				bEquals=bEquals && objEquals(vAPropValue,vBPropValue);
			} else if (isArray(vAPropValue)){
				bEquals=bEquals && (vAPropValue.length==vBPropValue.length);
				for (var j=0;(j<vAPropValue.length)&&bEquals;j++){
					bEquals=bEquals && objEquals(vAPropValue[j],vBPropValue[j]);
				}
			} else {
				bEquals=bEquals && (vAPropValue==vBPropValue);
			}
		}
	}
	return bEquals;
}
function getAllProperties(obj){
	var arrProperties;
	var arrResult=[];
	var baseObj;
	if (typeof obj==="function"){ // a class is a function... "constructor"
		baseObj=obj.prototype;
	} else {
		baseObj=obj;
	}
	arrProperties=Object.getOwnPropertyNames(baseObj);
	for (var i=0;i<arrProperties.length;i++){
		var vPropName=arrProperties[i];
		if (vPropName!=="constructor"){
			var vPropValue=baseObj[vPropName];
			if (!isMethod(vPropValue)){
				arrResult.push(vPropName);
			}
		}
	}
	return arrResult;
}

function makeGlobals(obj){
	var arrProperties;
	var baseObj;
	if (typeof obj==="function"){ // a class is a function... "constructor"
		baseObj=obj.prototype;
	} else {
		baseObj=obj;
	}
	arrProperties=Object.getOwnPropertyNames(baseObj);
	for (var i=0;i<arrProperties.length;i++){
		var vPropName=arrProperties[i];
		if (vPropName!=="constructor"){
			var vPropValue=baseObj[vPropName];
			if (isMethod(vPropValue)){
				if (isInNodeJS()){
					global[vPropName]=vPropValue;
				} else {
					window[vPropName]=vPropValue;
				}
			}
		}
	}
}

function registerClass(clsObj){
	if (isInNodeJS()){
		module.exports=clsObj;
	} else {
		global[clsObj.name]=clsObj;
	}
	log("Registered class:"+clsObj.name);
}


function executeSystemCommand(sCommand,callback){
	var objResult=shell.exec(sCommand);
	var result=objResult.stdout;
	if (isArray(result)){
		for (var i=0;i<result.length;i++){
			log("stdout Line "+i+":"+result[i]);
		}
	} else {
		log("stdout:"+result);
	}
	return objResult;
}  

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};


function isMethod(variable){
	return (typeof variable === 'function');
}
function isUndefined(variable){
	return (typeof variable==="undefined");
}
function isDefined(variable){
	return (typeof variable!=="undefined");
}
function isDefined(variable){
	return (typeof variable!=="undefined");
}
function isNull(variable){
	return (variable===null);
}
function isNotNull(variable){
	return (variable!==null);
}
function isString(variable){
	if (typeof variable==="string") return true;
	if (isObject(variable)){
		if (variable.constructor.name=="String") return true;
	}
	return false;
}
function isArray(variable){
	return Array.isArray(variable);
}
function isObject(obj){
	return ( (typeof obj === "object") && (obj !== null) && isDefined(obj) );
}
function isBoolean(obj){
	return ( (typeof obj === "boolean") && (obj !== null) && isDefined(obj) );
}

function isInArray(theArray,theKey,theField){
	var bExists=false;
	for (var k=0;(!bExists)&&(k<theArray.length);k++){
		var it=theArray[k];
		if (isDefined(theField)){
			if (it[theField]==theKey){
				return true;
			}
		} else {
			if (it==theKey){
				return true;
			}
		}
	}
	return false;
}

function createFunction(arrValues,sFunctionBody,functionCache){
	var sFncFormula=`var result=
		`+sFunctionBody+`
		;
	 return result;`;
	log("Execute Formula-----");
	for (var i=0;i<arrValues.length;i++){
		var vValue=arrValues[i];
		if (!isObject(vValue)){
			log("_arrRefs_['"+i+"']:["+JSON.stringify(vValue)+"]");
		} else {
			log("_arrRefs_['"+i+"']:["+vValue.constructor.name+"]");
		}
	}
	log(sFncFormula);
	var theHash;
	var fncFormula
	if (isDefined(functionCache)){
		var hash = sha256.create();
		hash.update(sFncFormula);
		theHash=hash.hex();
		if (functionCache.exists(theHash)){
			fncFormula=functionCache.getValue(theHash);
		} else {
			try{
				fncFormula=Function("_arrRefs_",sFncFormula);
			} catch(err) {
				var withLogsPrev=loggerFactory.getLogger().enabled;
				loggerFactory.getLogger().enabled=true;
				log("Error building function");
				log(sFncFormula);
				log("Retry... to generate a exception");
				loggerFactory.getLogger().enabled=withLogsPrev;
				fncFormula=Function("_arrRefs_",sFncFormula);
			}
			functionCache.add(theHash,fncFormula);
		}
	} else {
		fncFormula=Function("_arrRefs_",sFncFormula);
	}
	return fncFormula;
}

function executeFunction(arrValues,sFunctionBody,functionCache){
	var sFncBody=sFunctionBody;
	if (isArray(sFunctionBody)){
		sFncBody=sFunctionBody.saToString();
	} 
	var fncFormula=createFunction(arrValues,sFncBody,functionCache);
	var vValue=fncFormula(arrValues);
	return vValue;
}

var undefinedValue;
function fncEmpty(){
}

class RCGBaseUtils{
}

if (isInNodeJS()) { // the global parameters has to be created explicity
	if (isUndefined(global.getUrlParameter)){
		global.getUrlParameter=getUrlParameter;
	}
	if (isUndefined(global.objEquals)){
		global.objEquals=objEquals;
	}
	
	if (isUndefined(global.clone)){
		global.clone=clone;
	}
	if (isUndefined(global.isUndefined)){
		global.isUndefined=isUndefined;
	}
	if (isUndefined(global.isDefined)){
		global.isDefined=isDefined;
	}
	if (isUndefined(global.isMethod)){
		global.isMethod=isMethod;
	}
	if (isUndefined(global.isObject)){
		global.isObject=isObject;
	}
	if (isUndefined(global.isString)){
		global.isString=isString;
		
	}
	if (isUndefined(global.isArray)){
		global.isArray=isArray;
	}
	
	if (isUndefined(global.undefinedValue)){
		global.undefinedValue=undefinedValue;
	}
	if (isUndefined(global.fncEmpty)){
		global.fncEmpty=fncEmpty;
	}
	if (isUndefined(global.fncVacia)){
		global.fncVacia=fncVacia;
	}
	if (isUndefined(global.getFunctionName)){
		var stackUtils=new StackUtils();
		global.getFunctionName=stackUtils.getStackFunctionName;
	}
	if (isUndefined(global.executeSystemCommand)){
		global.executeSystemCommand=executeSystemCommand;
	}
	if (isUndefined(global.isInNodeJS)){
		global.isInNodeJS=isInNodeJS;
	}
	module.exports=RCGBaseUtils;
}

