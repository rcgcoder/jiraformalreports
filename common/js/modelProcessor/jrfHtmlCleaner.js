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
	groupBlocks(jqElem,keyStart,keyStop,status){
		var self=this;
		if (jqElem.prop("nodeType")==3){
			var sContent=jqElem.text();
			var iOpens=self.occurrences(sContent,keyStart,false);
			var iEnds=self.occurrences(sContent,keyStop,false);
			var openCount=(iOpens-iEnds);
			if (status.isOpen){
				status.nOpens+=openCount;
				var newTextToDebug=status.initialTag.text();
				newTextToDebug+=" "+sContent;
				log(newTextToDebug);
				status.initialTag.text(newTextToDebug);
				jqElem.attr("markedToRemove",true);
				if (status.nOpens==0){
					// finish
					status.isOpen=false;
					status.endTag=rootTag;
					status.initialTag="";
				} 
			} else if (openCount>0) {
				status.isOpen=true;
				status.initialTag=jqElem;
				status.nOpens=openCount;
				// starts
			}
		} else {
			var childs=jqElem.children();
			for (var i=0;i<childs.length;i++){
				self.groupBlocks($(childs[i]),keyStart,keyStop,status);
			}
		}
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
			if (isUndefined(mustRemove)){
				mustRemove=false;
			}

			if (mustRemove){
				log ("Marked to remove");
				jqChild.remove();
				bRemovedItems=true;
			} 
			i--;
		}
		var nodeType=jqElem.prop("nodeType");
		if ((bRemovedItems &&(jqElem.children().length==0)&&(nodeType!=3))
			 ||
			 ((nodeType==3)&&(jqElem.text()==""))
			){
			jqElem.attr("markedToRemove",true);
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
