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
	groupBlocks(rootTag,keyStart,keyStop,status){
		var self=this;
		if (rootTag.nodeType==3){
			var sContent=rootTag.nodeValue;
			var iOpens=self.occurrences(sContent,keyStart,false);
			var iEnds=self.occurrences(sContent,keyStop,false);
			var openCount=(iOpens-iEnds);
			if (status.isOpen){
				status.nOpens+=openCount;
				status.initialTag.nodeValue+=(" "+rootTag.nodeValue);
				rootTag.nodeValue="";
				var newTextToDebug=status.initialTag.nodeValue;
				log(newTextToDebug);
				$(rootTag).attr("markedToRemove",true);
				if (status.nOpens==0){
					// finish
					status.isOpen=false;
					status.endTag=rootTag;
					status.initialTag="";
				} 
			} else if (openCount>0) {
				status.isOpen=true;
				status.initialTag=rootTag;
				status.nOpens=openCount;
				// starts
			}
		} else {
			rootTag.childNodes.forEach(function(subNode){
				self.groupBlocks(subNode,keyStart,keyStop,status);
			});
		}
	}
	removeMarked(rootTag){
		var self=this;
		var i=rootTag.childNodes.length-1;
		var bRemovedItems=false;
		while (i>0){
			var subNode=rootTag.childNodes[i];
			self.removeMarked(subNode);
			subNode=$(subNode);
			var mustRemove=subNode.attr("markedToRemove");
			if (isUndefined(mustRemove)){
				mustRemove=false;
			}

			if (mustRemove){
				log ("Marked to remove");
				subNode.remove();
				bRemovedItems=true;
			} 
			i--;
		}
		if ((bRemovedItems &&(rootTag.childNodes.length==0)&&(rootTag.nodeType!=3))
			 ||
			 ((rootTag.nodeType==3)&&(rootTag.nodeValue==""))
			){
			$(rootTag).attr("markedToRemove",true);
		}
	}
	clean(){
		var self=this;
		debugger;
		var sContent=self.inputHtml;
		var jqContent=$(sContent);
		var status=self.newCleanProcessStatus();
		self.groupBlocks(jqContent[0],"{{","}}",status);
		self.removeMarked(jqContent[0]);
		// needs to clean the content.
		var sContent=jqContent[0].outerHTML;
		return sContent;
	}

}
