debugger;
loggerFactory.getLogger().enabled=true;
var hsTest=newHashMap();
for (var i=0;i<1000;i++){
	hsTest.add("key"+i,"key"+i);
}
while (hsTest.length()>0){
	hsTest.remove("key"+Math.floor(Math.random()*1000));
}