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
	clean(){
		var self=this;
		var sContent=self.inputHtml;
		var jqContent=$(sContent);
		// needs to clean the content.
		var sContent=jqContent[0].outerHTML;
		return sContent;
	}

}
