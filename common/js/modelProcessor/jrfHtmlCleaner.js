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
			nRemoved:0,
			nLocated:0,
			isOpen:false,
			log:function(){
				var sLog=("status ("+status.nTags+")"+(status.isOpen?" Open":"Closed")
						+": Opens:"+status.nOpens+" Closes:"+status.nCloses
						+" Located:"+status.nLocated
						+" Marked:"+status.nMarkedToRemove
						+" Removed:"+status.nRemoved
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
//				var newTextToDebug=status.initialTag.text();
//				newTextToDebug+=sContent;
				//log(newTextToDebug);
				status.initialTag[0].appendData(sContent);
				jqElem[0]["markedToRemove"]="true";
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
		var mustRemove=jqElem[0]["markedToRemove"];
		if (isUndefined(mustRemove)){
			mustRemove=false;
		} else {
			log(mustRemove);
			mustRemove=(mustRemove.toLowerCase()=="true");
		}
		return mustRemove;
	}
	removeMarked(jqElem,status){
		var self=this;
		var childs=jqElem.contents();
		var i=childs.length-1;
		var bRemovedItems=false;
		while (i>=0){
			var jqChild=$(childs[i]);
			self.removeMarked(jqChild,status);
			i--;
		}
		var afterContents=jqElem.contents().length;
		if (afterContents!=childs.length){
			//log("removed: "+(childs.length-afterContents)+" child contents");
			bRemovedItems=true;
		}
		if (afterContents==0){
			var mustRemove=self.isMustRemove(jqElem);
			if (mustRemove||bRemovedItems){
				//log ("Marked to remove");
				status.nRemoved++;
				jqElem.remove();
				status.log();
			} 
		}
	}
	clean(){
		var self=this;
		debugger;
		var sContent=self.inputHtml;
		var sOrigLength=sContent.length;
		log("original content length:"+sOrigLength);
		var jqContent=$(sContent);
		var status=self.newCleanProcessStatus();
		self.groupBlocks(jqContent,"{{","}}",status);
		status.log();
		self.removeMarked(jqContent,status);
		status.log();
		// needs to clean the content.
		var sContent=jqContent[0].outerHTML;
		log("original content length:"+sOrigLength+" cleaned content length:"+sContent.length);
		return sContent;
	}

}
