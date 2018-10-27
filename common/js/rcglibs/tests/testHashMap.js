debugger;
var nMaxItems=10;
var fncGetRandomKey=function(){
	return "key"+Math.floor(Math.random()*1000);
}
var key;
loggerFactory.getLogger().enabled=true;
var hsTest=newHashMap();
while (hsTest.length()<nMaxItems){
	key=fncGetRandomKey();
	if (!hsTest.exists(key)){
		hsTest.add(key,key);
	}
}
while (hsTest.length()>0){
	key=fncGetRandomKey();
	hsTest.remove(key);
}