class jrfVariables{
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
		if (!self.localVars.top().exists(varName)){
			self.localVars.top().add(varName,newHashMap());
		}
		self.localVars.top().getValue(varName).push(value);
	}
	
	popVar(varName,value){
		return this.localVars.top().getValue(varName).pop();
	}
	getVar(varName){
		var self=this;
		var hsVars=self.getVars(varName);
		return hsVars.top();
	}
	setVar(varName,value){
		var self=this;
		var hsVars=self.getVars(varName);
		var nodAux=hsVars.getLast();
		nodAux.value=value;
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

		self.localVars=newHashMap();
		self.globalVars=newHashMap();
}