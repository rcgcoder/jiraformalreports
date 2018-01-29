/*'use strict';
var shell = require('shelljs' );
var StackUtils=require("./StackUtils.js");
*/
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
function isString(variable){
	return (typeof variable==="string");
}
function isArray(variable){
	return Array.isArray(variable);
}
function isObject(obj){
	return ( (typeof obj === "object") && (obj !== null) && isDefined(obj) );
}


var undefinedValue;
function fncVacia(){
}
function fncEmpty(){
}

class BaseUtils{
}

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


