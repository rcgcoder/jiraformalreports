var RCGVarEngine=class RCGVarEngine{ //this kind of definition allows to hot-reload
	constructor(){
		var self=this;
		self.localVars=newHashMap();
	}

	pushVarEnv(){
		this.localVars.push(newHashMap());
	}
	popVarEnv(){
		return this.localVars.pop();
	}
	topVarEnv(){
		return this.localVars.top();
	}
	pushVar(varName,value,levelFromTop){
		var self=this;
		var hsVars=self.getVars(varName);
		if (hsVars==""){
			hsVars=newHashMap();
			var nEnvs=self.localVars.length();
			if (isDefined(levelFromTop)&&(levelFromTop!=0)){
				var nEnv=(nEnvs-1);// last env
				var auxVarEnv;
				nEnv-=Math.abs(levelFromTop);
				if (nEnv<=0){
					nEnv=0;
				}
				auxVarEnv=self.localVars.findByInd(nEnv);
			} else {
				auxVarEnv=self.topVarEnv();
				
			} 
			auxVarEnv.add(varName,hsVars);
		}
		hsVars.push(value);
	}
	
	popVar(varName,value){
		var self=this;
		var hsVars=self.getVars(varName);
		if (hsVars=="") return "";
		return hsVars.pop();
	}
	getVar(varName){
		var self=this;
		var hsVars=self.getVars(varName);
		if (hsVars=="") return "";
		return hsVars.top();
	}
	setVar(varName,value){
		var self=this;
		var hsVars=self.getVars(varName);
		if (hsVars!=""){
			if (hsVars.length()>0){
				hsVars.pop();
			} 
			hsVars.push(value);
		} else { // if not exists is a new local var
			self.pushVar(varName,value); 
		}
	}

	getVars(varName){ // get the hashmap contained in the variable name... all variables are array of values
		var self=this;
		// localVars is a Stack (hashmap without key) of Var Environments (hashmaps where the key is the var name)
		// take the top environment
		var nodEnv=self.localVars.getLast();
		var nodAux;
		var nodInd;
		var hsEnv;
		nodInd=nodEnv.brothers.length-1;
		while (nodInd>=0){
			nodAux=nodEnv.brothers[nodInd];
			hsEnv=nodAux.value;
			if (hsEnv.exists(varName)){
				return hsEnv.getValue(varName);
			}
			nodInd--;
		}
		hsEnv=nodEnv.value;
		if (hsEnv.exists(varName)){
			return hsEnv.getValue(varName);
		}
		return "";
	}
	flushVar(varName){
		var hsVars=getVars(varName);
		hsVars.clear();
	}
	initVar(varName){
		var self=this;
		var hsEnv=self.topVarEnv();
		if (hsEnv==""){
			self.pushVarEnv()
			hsEnv=self.topVarEnv();
		}
		if (hsEnv.exists(varName)){
			log("ERROR ... you can init a existin local variable");
			return;
		}
		hsEnv.add(varName,newHashMap());
	}
}