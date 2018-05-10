class RCGVarEngine{
	constructor(){
		var self=this;
		self.localVars=newHashMap();
		self.globalVars=newHashMap();
	}

	pushLocalVarEnv(){
		this.localVars.push(newHashMap());
	}
	popLocalVarEnv(){
		return this.localVars.pop();
	}
	pushVar(varName,value){
		var self=this;
		var hsVars=self.getVars(varName);
		if (hsVars==""){
			hsVars=newHashMap();
			self.localVars.add(varName,hsVars);
		}
		hsVars.push(value);
	}
	
	popVar(varName,value){
		var self=this;
		var hsVars=self.getVars(varName);
		return hsVars.pop();
	}
	getVar(varName){
		var self=this;
		var hsVars=self.getVars(varName);
		return hsVars.top();
	}
	setVar(varName,value){
		var self=this;
		var hsVars=self.getVars(varName);
		if (hsVars!=""){
			var nodAux=hsVars.getLast();
			nodAux.value=value;
		} else { // if not exists is a new local var
			self.pushVar(varName,value); 
		}
	}

	getVars(varName){
		var self=this;
		var nodAux=self.localVars.getLast();
		var hsAux=nodAux.value;
		while ((nodAux!="")&&(nodAux.key!=varName)){
			nodAux=nodAux.previous;
		}
		if (nodAux!=""){
			return nodAux.value;
		}
		return self.getVarsGlobal(varName);
	}

	pushVarGlobal(varName,value){
		var self=this;
		if (!self.globalVars.exists(varName)){
			self.globalVars.add(varName,newHashMap());
		}
		self.getVarsGlobal(varName).push(value);
	}
	getVarsGlobal(varName){
		return self.globalVars.getValue(varName);
	}
	getVarGlobal(varName){
		var self=this;
		var hsValues=self.getVarsGlobal(varName);
		if (hsValues!=""){
			return hsValues.top();
		}
		return "";
	}
}