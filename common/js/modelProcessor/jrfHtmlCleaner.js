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
			nCloses:0,
			nTags:0,
			isOpen:false
		}
		return status;
	}
	groupBlocks(jqElem,keyStart,keyStop,status){
		var self=this;
		status.nTags++;
		var childs=jqElem.children();
		if (childs.length==0){
			var sContent=jqElem.text();
			status.nOpens+=self.occurrences(sContent,keyStart,false);
			status.nCloses+=self.occurrences(sContent,keyStop,false);
			var openCount=(status.nOpens-status.nCloses);
			if (status.isOpen){
				var newTextToDebug=status.initialTag.text();
				newTextToDebug+=" "+sContent;
				log(newTextToDebug);
				status.initialTag.text(newTextToDebug);
				jqElem.attr("markedToRemove","true");
				if (openCount<=0){
					// finish
					status.isOpen=false;
					status.initialTag="";
				} 
			} else if (openCount>0) {
				status.isOpen=true;
				status.initialTag=jqElem;
				status.nOpens=openCount;
				// starts
			}
		} else {
			for (var i=0;i<childs.length;i++){
				self.groupBlocks($(childs[i]),keyStart,keyStop,status);
			}
		}
		log("status ("+status.nTags+")"+(status.isOpen?" Open":"Closed")+": Opens:"+status.nOpens+" Closes:"+status.nCloses);
	}
	removeMarked(jqElem){
		var self=this;
		var childs=jqElem.children();
		var i=childs.length-1;
		var bRemovedItems=false;
		while (i>0){
			var jqChild=$(childs[i]);
			self.removeMarked(jqChild);
			var mustRemove=jqChild.attr("markedToRemove");
			log(mustRemove);
			if (isUndefined(mustRemove)){
				mustRemove=false;
			} else {
				debugger;
				mustRemove=(mustRemove.toLowerCase()=="true");
			}

			if (mustRemove){
				log ("Marked to remove");
				jqChild.remove();
				bRemovedItems=true;
			} 
			i--;
		}
		if (bRemovedItems &&(jqElem.children().length==0)){
			jqElem.attr("markedToRemove","true");
		}
	}
	clean(){
		var self=this;
		debugger;
		var sContent=self.inputHtml;
		var jqContent=$(sContent);
		var status=self.newCleanProcessStatus();
		self.groupBlocks(jqContent,"{{","}}",status);
		self.removeMarked(jqContent);
		// needs to clean the content.
		var sContent=jqContent[0].outerHTML;
		return sContent;
	}

}
