var jrfStatistics=class jrfStatistics extends jrfLoopBase{//this kind of definition allows to hot-reload
	constructor(tag,reportElem,model){
		super(tag,reportElem,model);
		var self=this;
		self.operationSource=self.getAttrVal("operation");
		self.opType="";
		self.counter=0;
		self.accumulator=0;
	}
	loopStart(){
		var self=this;
		var op=replaceAll(self.operationSource.trim().toLowerCase()," ","");
		if (op=="count"){
			self.opType="count";
		} else if (op=="sum"){
			self.opType="sum";
		} else {
			self.opType="function";
		}
		self.counter=0;
		self.accumulator=0;
	}
	loopItemProcess(eachElem){
		var self=this;
		if (self.opType=="count"){
			self.counter++;
		}
		return true; //allways continue
	}
	loopEnd(){
		var self=this;
		if (self.opType=="count"){
			self.addHtml(self.counter);
		}
	}
}