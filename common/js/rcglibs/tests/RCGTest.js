log("Testing");
debugger;
/*
var stepper=System.webapp;
stepper.addStep("Parallelizing test",function(result){
	//walkAsync(sName,callNode,callEnd,callBlockPercent,callBlockTime,secsLoop,hsOtherParams,barrier){
	var fncCall=function(theKey){
		log("Calling "+theKey);
		stepper.addStep("Call"+theKey,function(){
			log("Step of call "+theKey);
			var fncAsyncCall=stepper.createManagedCallback(function(){
				log("Calling async "+theKey);
				stepper.continueTask();
			});
			setTimeout(fncAsyncCall,Math.random()*2000);
		})
		stepper.continueTask();
	};
	var fncProcess=function(theKey){
		log("Processing... "+theKey);
		stepper.addStep("Processing",function(){
			var fncAsync=stepper.createManagedCallback(function(){
				log("Processing async "+theKey);
				stepper.continueTask();
			});
			setTimeout(fncAsync,Math.random()*2000);
		});
	};
	var arrTest=[];
	for (var i=0;i<20;i++){
		arrTest.push("Key"+i);
	}
	stepper.parallelizeCalls(arrTest,fncCall,fncProcess,5);
});
*/
var storer=new RCGObjectStorageManager("Testing",System.webapp.getTaskManager());
/*System.webapp.addStep("String",function(){
	storer.save("testString","String to save");
});
System.webapp.addStep("String",function(){
	storer.load("testString",function(result){
		log(result);
	});
});

System.webapp.addStep("Float",function(){
	storer.save("testFloat",3.5);
});
System.webapp.addStep("Float",function(){
	storer.load("testFloat",function(result){
		log(result);
	});
});
System.webapp.addStep("Array",function(){
	storer.save("testArray",["a","b",5,32]);
});
System.webapp.addStep("Array",function(){
	storer.load("testArray",function(result){
		log(result);
	});
});

System.webapp.addStep("Object",function(){
	var auxObj={attString:"String to save",attFloat:6.2,attArray:["a","b",9,8,"z"]}
	storer.save("testObject",auxObj);
});
System.webapp.addStep("Object",function(){
	storer.load("testObject",function(result){
		log("End Load Obj:"+result);
	});
});

System.webapp.addStep("Dynamic Object",function(){
	var dynObj=newDynamicObjectFactory(
			[{name:"TestStringList",description:"One String List",type:"String"},
			]
			,
			["TestOneString"
			]
			,
			[]
			,
			//undefined 
			"DynamicObjectTest"
			,true
			);
	var auxObj=dynObj.new("Test DynObj");
	auxObj.setTestOneString("Tested String Values");
	auxObj.addTestStringList("One Value for String List");
	auxObj.addTestStringList("Second Value for String List");
	storer.addStep("Save to Storage",function(){
		storer.save("testObject",auxObj);
	});
	storer.addStep("Unlock and store by factory",function(){
		auxObj.unlock();
		auxObj.getFactory().storeManager.saveAllUnlocked();
	});
	storer.continueTask();
});
System.webapp.addStep("Dynamic Object",function(){
	storer.addStep("Loading object testObject",function(){
		storer.load("testObject",function(result){
			log("End Load Dynamic Object:"+result);
			result.fullLoad();
		});
	})
	storer.addStep("Full loaded",function(dynObj){
		log("Full loaded:"+ dynObj.getId());
		storer.continueTask();
	});
	storer.continueTask();
});
*/

System.webapp.addStep("Dynamic Object With Childs",function(){
	var dynObj=newDynamicObjectFactory(
			[{name:"TestStringList",description:"One String List",type:"String"},
			 {name:"Child",description:"List of DynObjs",type:"object"},
			]
			,
			["TestOneString"
			]
			,
			[]
			,
			//undefined 
			"DynamicObjectWithChildsTest",
			true
			);
	var auxObj=dynObj.new("Test DynObj");
	auxObj.setTestOneString("Tested String Values");
	auxObj.addTestStringList("One Value for String List");
	auxObj.addTestStringList("Second Value for String List");
	for (var i=0;i<20;i++){
		var childObj=dynObj.new("ChildDynObj"+i);
		childObj.setTestOneString(i+"Tested String Values");
		childObj.addTestStringList(i+"One Value for String List");
		childObj.addTestStringList(i+"Second Value for String List");
		auxObj.addChild(childObj,childObj.getId());
		childObj.unlock();
	}
	storer.save("testObjectWithChilds",auxObj);
});
System.webapp.addStep("Dynamic Object With Childs",function(){
	storer.addStep("Load the root object",function(){
		storer.load("testObjectWithChilds");
	});
	storer.addStep("Unlock and store by factory",function(auxObj){
		storer.addStep("Saving all dynobjs",function(){
			debugger;
			auxObj.unlock();
			auxObj.getFactory().storeManager.saveAllUnlocked();
		});
		storer.addStep("Continuing the test",function(){
			log("All unlocked saved... now full load " + auxObj.getId());
			auxObj.fullLoad();
			storer.continueTask([auxObj]);
		});
		storer.continueTask();
	});
	/*
	storer.addStep("Parallelize the full load test",function(result){
		//walkAsync(sName,callNode,callEnd,callBlockPercent,callBlockTime,secsLoop,hsOtherParams,barrier){
		var fncLoaded=function(oneChild){
			oneChild.unlock();
			//storer.continueTask();
		};
		var fncLoad=function(oneChild){
			oneChild.fullLoad();
			storer.continueTask();
		};
		storer.parallelizeCalls(result.getChilds(),fncLoad,fncLoaded,5);
	});*/
	storer.continueTask();
});

/*
System.webapp.addStep("Dynamic Object List",function(){
	var dynObj=newDynamicObjectFactory(
			[{name:"TestStringList",description:"One String List",type:"String"},
			]
			,
			["TestOneString"
			]
			,
			[]
			,
			//undefined 
			"DynamicObjectListTest"
			, true
			);
	var hsAux=newHashMap();
	storer.addStep("Creating a lot of objects",function(){
		var fncUnlock=function(oneChild){
			oneChild.unlock();
			//storer.continueTask();
		};
		var fncCreate=function(nIndex){
			var auxObj=dynObj.new(nIndex+"Test DynObj"+dynObj.list.length());
			var key=auxObj.getId();
			auxObj.setTestOneString(nIndex+ " - " +key+" - Tested String Values");
			auxObj.addTestStringList(nIndex+ " - " +key + " - One Value for String List");
			auxObj.addTestStringList(nIndex+ " - " +key + " - Second Value for String List");
			hsAux.push(auxObj);
		};
		storer.parallelizeCalls(20,fncCreate,fncUnlock,5);
	});
	storer.save("testDynObjectList",hsAux);
});
System.webapp.addStep("Dynamic Object List",function(){
	storer.load("testDynObjectList",function(result){
		log("End Load Dynamic Object List:"+result);
	});
});




System.webapp.addStep("hashMap",function(){
	var fncCreateHashMap=function(iDeepMax){
		var hsAux=newHashMap();
		hsAux.autoSwing=false;
		if (iDeepMax<0) return hsAux;
		for (var i=0;i<10;i++){
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
		hsAux.autoSwing=true;
		hsAux.swing();
		return hsAux;
	}
	var hsAux=fncCreateHashMap(3);
	System.webapp.addStep("Saving hashMap",function(){
		storer.save("testHashMap",hsAux);
	});
	System.webapp.continueTask();
});

System.webapp.addStep("HashMap",function(){
	storer.load("testHashMap",function(result){
		log("End Load HashMap:"+result);
	});
});
*/
System.webapp.addStep("End Save and Load tests",function(){
	log("End Save and Load tests");
	System.webapp.continueTask();
});
