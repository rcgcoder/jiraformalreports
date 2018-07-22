var jrfHtmlCleaner=class jrfHtmlCleaner{ //this kind of definition allows to hot-reload
	constructor(inputHtml,pairsClean){
		var self=this;
		self.inputHtml=inputHtml;
		self.outputHtml="";
		self.tagPairs=[];
		if (isDefined(pairsClean)){
			pairsClean.forEach(function (pair){
				self.tagPairs.push(pair);
			});
		}
	}
	addPair(startString,endString){
		this.tagPairs.push([startString,endString]);
	}
	
	occurrences(string, subString, allowOverlapping) {

	    string += "";
	    subString += "";
	    if (subString.length <= 0) return (string.length + 1);

	    var n = 0,
	        pos = 0,
	        step = allowOverlapping ? 1 : subString.length;

	    while (true) {
	        pos = string.indexOf(subString, pos);
	        if (pos >= 0) {
	            ++n;
	            pos += step;
	        } else break;
	    }
	    return n;
	}
	newCleanProcessStatus(){
		var status={
			initialTag:"",
			nOpens:0,
			isOpen:false,
			endTag:""
		}
		return status;
	}
	cleanBlock(rootTag,keyStart,keyStop,status){
		var self=this;
		if (rootTag.nodeType==3){
			var sContent=rootTag.nodeValue;
			var iOpens=self.occurrences(sContent,keyStart,false);
			var iEnds=self.occurrences(sContent,keyStop,false);
			var openCount=(iOpens-iEnds);
			if (status.isOpen){
				status.nOpens+=openCount;
				if (status.nOpens==0){
					status.isOpen=false;
					status.endTag=rootTag;
					// finish
					
				}
			} else if (openCount>0) {
				status.isOpen=true;
				status.initialTag=rootTag;
				status.nOpens=openCount;
				// starts
			}
		} else {
			rootTag.childNodes.forEach(function(subNode){
				self.cleanBlock(subNode,keyStart,keyStop,status);
			});
		}
	}
	clean(){
		var self=this;
		debugger;
		var sContent=self.inputHtml;
		var jqContent=$(sContent);
		var status=self.newCleanProcessStatus();
		self.cleanBlock(jqContent[0],"{{","}}",status);
		// needs to clean the content.
		var sContent=jqContent[0].outerHTML;
		return sContent;
	}

}
