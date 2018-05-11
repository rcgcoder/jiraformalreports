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
			if (hsVars.length()>0){
				var nodAux=hsVars.getLast();
				nodAux.value=value;
			} else {
				hsVars.push(value);
			}
		} else { // if not exists is a new local var
			self.pushVar(varName,value); 
		}
	}

	getVars(varName){
		var self=this;
		var nodAux=self.localVars.getLast();
		var hsAux;
		var nBrothers;
		while (nodAux!=""){
			nBrothers=nodAux.brothers.length;
			nBrothers--;
			while (nBrothers>=0){
				hsAux=nodAux.brothers[nBrothers].value;
				if (hsAux.exists(varName)){
					return hsAux.getValue(varName);
				} else { 
					nBrothers--
				}
			}
			hsAux=nodAux.value;
			if (hsAux.exists(varName)){
				return hsAux.getValue(varName);
			} else { 
				nodAux=nodAux.previous;
			}
		}
		return "";
	}
	initVarLocal(varName){
		var self=this;
		if (!self.localVars.top().exists(varName)){
			self.localVars.top().add(varName,newHashMap());
		}
	}
}