class jrfForEach{
	constructor(tag,reportElem){
		var self=this;
		self.tag=tag;
		self.reportElem=reportElem;
		self.type=self.getAttribute("type");
		self.subType=self.getAttribute("subtype");
		self.where=self.getAttribute("where");
		if (self.type="root"){
			
		} else if (self.type="child"){

		} else if (self.type="advchild"){
			
		}
	}
	apply(){
		var childRoots=self.report.childs();
		childRoots.walk(function(root){
			
		});
	}

}

