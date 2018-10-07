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
	storer.save("testObject",{attString:"String to save",attFloat:6.2,attArray:["a","b",9,8,"z"]});
});
System.webapp.addStep("String",function(){
	log("End Save Tests");
});
