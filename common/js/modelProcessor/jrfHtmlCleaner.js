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
			nMarkedToRemove:0,
			nLocated:0,
			isOpen:false,
			log:function(){
				var sLog=("status ("+status.nTags+")"+(status.isOpen?" Open":"Closed")
						+": Opens:"+status.nOpens+" Closes:"+status.nCloses
						+" Marked:"+status.nMarkedToRemove+" Located:"+status.nLocated
						);
				log(sLog);
				return sLog;
			}
		}
		return status;
	}
	groupBlocks(jqElem,keyStart,keyStop,status){
		var self=this;
		status.nTags++;
		var childs=jqElem.contents();
		if (childs.length==0){
			var sContent=jqElem.text();
			status.nOpens+=self.occurrences(sContent,keyStart,false);
			status.nCloses+=self.occurrences(sContent,keyStop,false);
			var openCount=(status.nOpens-status.nCloses);
			if (status.isOpen){
				var newTextToDebug=status.initialTag.text();
				newTextToDebug+=" "+sContent;
				//log(newTextToDebug);
				status.initialTag.text(newTextToDebug);
				jqElem.attr("markedToRemove","true");
				jqElem.prop("markedToRemove","true");
				jqElem[0]["markedToRemove"]="true";
				jqElem["markedToRemove"]="true";
				jqElem.text("markedToRemove");
				status.nMarkedToRemove++;
				if (openCount<=0){
					// finish
					status.isOpen=false;
					status.initialTag="";
				} 
			} else if (openCount>0) {
				status.isOpen=true;
				status.initialTag=jqElem;
				status.nLocated++;
				// starts
			}
		} else {
			for (var i=0;i<childs.length;i++){
				self.groupBlocks($(childs[i]),keyStart,keyStop,status);
			}
		}
//		status.log();
	}
	isMustRemove(jqElem){
		if (isDefined(jqElem.attr("markedToRemove"))
			||isDefined(jqElem.prop("markedToRemove"))
			||isDefined(jqElem[0]["markedToRemove"])
			||(jqElem.text="markedToRemove")
			||isDefined(jqElem["markedToRemove"])){
			debugger;
		}
		var mustRemove=jqElem.attr("markedToRemove");
		log(mustRemove);
		if (isUndefined(mustRemove)){
			mustRemove=false;
		} else {
			debugger;
			mustRemove=(mustRemove.toLowerCase()=="true");
		}
		return mustRemove;
	}
	removeMarked(jqElem){
		var self=this;
		var childs=jqElem.contents();
		var i=childs.length-1;
		var bRemovedItems=false;
		while (i>=0){
			var jqChild=$(childs[i]);
			self.removeMarked(jqChild);
			var mustRemove=self.isMustRemove(jqChild);
			if (mustRemove){
				log ("Marked to remove");
				jqChild.remove();
				bRemovedItems=true;
			} 
			i--;
		}
		if (jqElem.contents().length==0){
			var mustRemove=self.isMustRemove(jqElem);
			if (mustRemove||bRemovedItems){
				log ("Marked to remove");
				jqElem.remove();
			} 
		}
	}
	clean(){
		var self=this;
		debugger;
		var sContent=self.inputHtml;
		var jqContent=$(sContent);
		var status=self.newCleanProcessStatus();
		self.groupBlocks(jqContent,"{{","}}",status);
		status.log();
		self.removeMarked(jqContent);
		// needs to clean the content.
		var sContent=jqContent[0].outerHTML;
		return sContent;
	}

}
