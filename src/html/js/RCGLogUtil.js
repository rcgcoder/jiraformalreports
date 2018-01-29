var process;
var bInNodeJS=false;
if (typeof require!=="undefined"){
	bInNodeJS=true;
	'use strict';
	process = require('process');
} else {
	// process will be undefined
}

function getProcessPid(){
	if (typeof process!=="undefined"){
		return process.pid;
	} else {
		return 0;
	}
}

class LoggerFactory{
	constructor(){
		var self=this;
		self.loggers={};
	}
	getLogger(){
	   var self=this;
	   var sPID=getProcessPid();
	   if (isUndefined(self.loggers[sPID])){
		   var newLogger=new RCGLogUtils();
		   newLogger.pid=sPID;
		   self.loggers[sPID]=newLogger;
	   }
	   return self.loggers[sPID];
	}
	removeLooger(){
		var logger=getLogger();
		self.loggers[logger.pid]=vUndefined;
	}
}

class RCGLogUtils{
    constructor() {
    	var self=this;
    	self.logToBuffer=false;
    	self.logBuffers=[];
    	self.logText="";
    	self.bAutoTrace=false;
    	self.fncAutoTrace="";
    }
	logClear(){
		var self=loggerFactory.getLogger();
		self.logText="";
	}
/*	logUpdate(sCad){
		this.logClear();
		this.log(sCad);	
		var areaLog=$("#log");
		areaLog.val(logText);
		if(areaLog.length){
	       areaLog.scrollTop(areaLog[0].scrollHeight - areaLog.height());
		}
	}
	function fncAutoTrace(){
		var areaLog=$("#log");
		areaLog.val(logText);
		if(areaLog.length){
	       areaLog.scrollTop(areaLog[0].scrollHeight - areaLog.height());
		}
		if (bAutoTrace){
			setTimeout(fncAutoTrace,3000);
		}
	}
	*/
	setLogToBuffer(bVal){
		var self=loggerFactory.getLogger();
		self.logToBuffer=bVal;
		if (bVal){
			if (!self.bAutoTrace){
				self.bAutoTrace=true;
				if (self.fncAutoTrace!=""){
					self.fncAutoTrace();
				}
			}
		} else {
			self.bAutoTrace=false;
		}
	}
	log(sTraza){
		var self=loggerFactory.getLogger();
		if (self.logToBuffer){
			self.logText+="\n"+sTraza;
		} else {
			console.log(sTraza);
		}
	}
	logPush(){
		var self=loggerFactory.getLogger();
		self.logBuffers.push(self.logText);
		self.logText="";
		self.setLogToBuffer(true);
		self.logToBuffer=true;
	}
	logPop(bNextToBuffer){
		var self=loggerFactory.getLogger();
		var sResult=self.logText;
		self.logText=self.logBuffers.pop();
		if (typeof bNextToBuffer!=="undefined"){
			self.setLogToBuffer(bNextToBuffer);
			if (bNextToBuffer){
				console.log(sResult);
			}
		}
		return sResult;
	}
}
var loggerFactory=new LoggerFactory(); 	
var logUtils=new RCGLogUtils();
var log=logUtils.log;
if (bInNodeJS){
	global.loggerFactory=new LoggerFactory(); 	
	module.exports=RCGLogUtils;
}