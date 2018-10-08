log("Testing");
debugger;
var storer=new RCGObjectStorageManager("Testing",System.webapp.getTaskManager());
System.webapp.addStep("String",function(){
	storer.save("testString","String to save");
});
System.webapp.addStep("Float",function(){
	storer.save("testFloat",3.5);
});
System.webapp.addStep("Array",function(){
	storer.save("testArray",["a","b",5,32]);
});
System.webapp.addStep("Object",function(){
	var auxObj={attString:"String to save",attFloat:6.2,attArray:["a","b",9,8,"z"]}
	storer.save("testObject",auxObj);
});

System.webapp.addStep("hashMap",function(){
	var fncCreateHashMap=function(iDeepMax){
		var hsAux=newHashMap();
		if (iDeepMax<0) return hsAux;
		for (var i=0;i<15;i++){
			var vRnd=(Math.random()*100);
			var vKey=Math.round(vRnd/10);
			if (vRnd<10){
				hsAux.add("Key"+vKey,"aa"+vRnd);
			} else if (vRnd<40){
				hsAux.add("Key"+vKey,vRnd.toFixed(5));			
			} else if (vRnd<80){
				var auxObj={attString:"String to save "+vRnd,
								attFloat:vRnd
								,attArray:["a"+vRnd,"b"+vRnd,1000+vRnd,8000+vRnd,"z"+vRnd]
								,attHashMap:fncCreateHashMap(iDeepMax-1)
							}
				hsAux.add("Key"+vKey,auxObj);			
			} else {
				hsAux.add("Key"+vKey,fncCreateHashMap(iDeepMax-1));			
			}
		}
		return hsAux;
	}
	var hsAux=fncCreateHashMap(3);
	System.webapp.addStep("Saving hashMap",function(){
		storer.save("testHashMap",hsAux);
	});
	System.webapp.continueTask();
});

System.webapp.addStep("End Save",function(){
	log("End Save Tests");
	System.webapp.continueTask();
});
System.webapp.addStep("String",function(){
	storer.load("testString",function(result){
		log(result);
	});
});
System.webapp.addStep("Float",function(){
	storer.load("testFloat",function(result){
		log(result);
	});
});
System.webapp.addStep("Array",function(){
	storer.load("testArray",function(result){
		log(result);
	});
});
System.webapp.addStep("Object",function(){
	storer.load("testObject",function(result){
		log("End Load Obj:"+result);
	});
});
System.webapp.addStep("HashMap",function(){
	storer.load("testHashMap",function(result){
		log("End Load HashMap:"+result);
	});
});

System.webapp.addStep("End Load",function(){
	log("End Load Tests");
	System.webapp.continueTask();
});
