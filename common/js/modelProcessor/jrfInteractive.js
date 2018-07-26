var jrfInteractive=class jrfInteractive{//this kind of definition allows to hot-reload
	constructor(baseWindow){
		var self=this;
		self.interactiveContents=newHashMap();
	}
	newInteractiveId(){
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
		return newId;
	}
	addInteractiveContent(content){
		var self=this;
		var newId=self.newInteractiveId();
		self.interactiveContents.add(newId,content);
		return newId;
	}
	getInteractiveContent(idContent){
		var self=this;
		return self.interactiveContents.getValue(idContent);
	}
	elemShowHide(elemId,actWindow,btnId,capHidden,capShowed){
		var self=this;
		var theWindow=window;
		if (isDefined(actWindow)){
			theWindow=actWindow;
		}
		var sContent=self.getInteractiveContent(elemId);
		var jqElem=$(theWindow.document.body).find('#'+elemId);
		var elem=jqElem[0];
		jqElem.html(sContent.saToString());
		if (isUndefined(elem.visible)
			||
			(isDefined(elem.visible)&&(!elem.visible))
			){
			jqElem.show();
			elem.visible=true;
		} else {
			jqElem.hide();
			elem.visible=false;
		}
		var jqBtn=$(theWindow.document.body).find('#'+btnId);
		if (elem.visible){
			jqBtn.prop('value', capShowed);
		} else {
			jqBtn.prop('value', capHidden);
		}
		
	}
	openNewWindow(elemId){
		var self=this;
		var otherWindow; 
		var saContent=self.getInteractiveContent(elemId);
		var saPrependContent=[];
		saPrependContent.push(`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//ES"
   					"http://www.w3.org/TR/html4/strict.dtd">
					<HTML>
 					<HEAD> 
					<meta http-equiv='Content-Type' content='Type=text/html; charset=utf-8'>
					<title>`+formatDate(new Date(),4)+` Jira Formal Report </title>					
					`);		
		var arrFiles=[	//"ts/demo.ts",
			"css/RCGTaskManager.css",
			"aui/css/aui.css",
            "aui/css/aui-experimental.css",
            ]; //test
		arrFiles.forEach(function (sRelativePath){
			var sAbsPath=System.webapp.composeUrl(sRelativePath);
			saPrependContent.push('<link rel="stylesheet" type="text/css" href="'+sAbsPath+'">');
		});
		saPrependContent.push("</HEAD><BODY>");
		while (saPrependContent.length>0){
			saContent.unshift(saPrependContent.pop());
		}
		saContent.push("</BODY></HTML>");
		var blobResult = new Blob(saContent, {type : "text/html"});
	    var blobUrl = window.URL.createObjectURL(blobResult);
		otherWindow= window.open(blobUrl , '_blank');
		otherWindow.modelInteractiveFunctions=modelInteractiveFunctions;
    	otherWindow.System=System;
	}
	alert(alertText){
		alert(alertText);
	}
	saveToFile(elemId){
		var self=this;
		var sContent=self.getInteractiveContent(elemId);
		saveDataToFile(sContent, "savedFile.html", "text/html");
	}
	getActiveWindow(actWindow){
		var theWindow=window;
		if (isDefined(actWindow)){
			theWindow=actWindow;
		}
		return theWindow;
	}
	changeDisplayChildRow(elemId,forceHide,actWindow){
		var self=this;
		log("Show childs rows of element:"+elemId);
		var theWindow=self.getActiveWindow(actWindow);
		var intContent=self.getInteractiveContent(elemId);
		var action="show";
		log(elemId+": is actually expanded:"+intContent.expanded);
		if (isDefined(intContent.expanded)&&(!intContent.expanded)){
			intContent.expanded=true;
			action="show";
		} else {
			intContent.expanded=false;
			action="hide";
		}
		if (isDefined(forceHide)&&forceHide){
			log("Force hide of element");
			intContent.expanded=false;			
			action="hide";
		}
		log(elemId+": action to do:"+action+" new expanded situation:"+intContent.expanded+" is loaded:"+intContent.loaded);
		
		if (!intContent.loaded){
			if (action=="hide") return;
			logError("Cannot Show unloaded row");
			return;
		}
		var hsParentRow=intContent.childs;
		var jqParent=$(theWindow.document.body).find('#'+elemId);
		
		var jqButton=$(theWindow.document.body).find('#btn'+elemId);
		var btnCaption=intContent.showCaption;
		if (action=="show") btnCaption=intContent.hideCaption;
		jqButton.html(btnCaption);
		var actRow=jqParent;
		hsParentRow.walk(function(intChild,iDeep,childId){
			log("Showing or Hide element"+childId);
			if (!intChild.loaded) {
				log("Element is not loaded");
				var newRow=$(intChild.html.saToString());
				log("inserting after row"+actRow.attr('id'))
				newRow.insertAfter(actRow);
				actRow=newRow;
				intChild.loaded=true;
			}
			var jqElem=$(theWindow.document.body).find('#'+childId);
			if (action=="show"){
				jqElem.css('display', '');
			} else {
				jqElem.css('display', 'none');
				intChild.expanded=false;
				self.changeDisplayChildRow(childId,true,theWindow);
			}
		});
	}
	exportTableToXlsx(btnId,actWindow){
		var self=this;
		var theWindow=self.getActiveWindow(actWindow);
		var jqButton=$(theWindow.document.body).find('#'+btnId);
		var parentTable=jqButton.parent();
		while (isDefined(parentTable)&&(parentTable.prop("nodeName")!="TABLE")){
			parentTable=parentTable.parent();
		}
		if (isUndefined(parentTable)){
			logError("Cannot export table because the jrf tag is outside of any table.");
			return;
		}
		log("Table Located!");
		var elt = parentTable[0]; //document.getElementById('data-table');
		var wb = theWindow.XLSX.utils.table_to_book(elt, {sheet:"ExportJRFTable"});
		var sheet=wb.Sheets["ExportJRFTable"];
	    var row;
	    var rowNum;
	    var colNum;
	    var cellValue;
	    var cellLength;
	    var cellEnd;
	    var fullRange=theWindow.XLSX.utils.decode_range(sheet['!ref']);
	    for(rowNum = fullRange.s.r; rowNum <= fullRange.e.r; rowNum++){
	       for(colNum=fullRange.s.c; colNum<=fullRange.e.c; colNum++){
	          var nextCell = sheet[
	        	  theWindow.XLSX.utils.encode_cell({r: rowNum, c: colNum})
	          ];
	          if( isDefined(nextCell)){
	        	  cellValue=nextCell.v;
	        	  if (isString(cellValue)){
	        		  cellValue=cellValue.trim();
		        	  cellLength=cellValue.length;
		        	  cellEnd=cellValue.substring(cellLength-2,cellLength);
		        	  if ((cellEnd==" €")
		        			  ||(cellEnd.toLowerCase()==" h")
		        			  ||(cellEnd.toLowerCase()==" %")){
		        		  cellValue=cellValue.substring(0,cellLength-2);
		        	  }
	        		  cellValue=cellValue.replace(".","");
	        		  cellValue=cellValue.replace(",",".");
		        	
	        		  if ($.isNumeric(cellValue)){
	        			  nextCell.t="n";
	        			  nextCell.v=parseFloat(cellValue);
	        		  }
	        	  }
	          }
	       }
	    }
//		return dl ? XLSX.write(wb, {bookType:type, bookSST:true, type: 'base64'}) :
		theWindow.XLSX.writeFile(wb, "jrfExportTable.xlsx"); 
	}
	
	openInWindow(idContent,iFrameId){
  
	    var jqDiv=$("#"+iFrameId);
	    var viewWidth=jqDiv.width();
	    var viewHeight=jqDiv.height();
	    
		loggerFactory.getLogger().enabled=true;
	    var hasHScroll=function(theIframe){
		    	//scrol 1px to the left
	    	if (isUndefined(theIframe)){
	    		log("the Iframe is undefined");
	    		return true;
	    	}
	    	var iframeDoc = theIframe.contentDocument || theIframe.contentWindow.document;
	    	if (isUndefined(iframeDoc)){
	    		log("Iframe Doc is undefined");
	    		return true;
	    	}
	    	$(iframeDoc).scrollLeft(1);

	    	if($(iframeDoc).scrollLeft() != 0){
	    	   //there's a scroll bar
	    		return true;
	    	}else{
	    	   //there's no scrollbar
	    		return false;
	    	}
	    	//scroll back to original location
	    	$(iframeDoc).scrollLeft(0);
	    }
	    var adjustIframeWidth=function(theIframe){
	    	if (hasHScroll(theIframe)){
	    		var actWidth=$(theIframe).width();
	    		log("Horizontal Scroll is viewing. Adjusting iframe width from "+actWidth+" to "+ (actWidth+50));
	    		$(theIframe).width(actWidth+50);
	    		setTimeout(function(){
	    			adjustIframeWidth(theIframe)});
	    	} else {
	    		log("Horizontal Scroll is not viewing. end of width adjust");
	    	}
	    };        
	    var ifr=document.getElementById('iFrameId');
	    ifr.onload=function(){
	    	$(ifr).width('100%');
	    	//	            this.style.display='block';
	       log('laod the iframe')
		   var iframeDoc = ifr.contentDocument || ifr.contentWindow.document;
		   iframeDoc.modelInteractiveFunctions=modelInteractiveFunctions;
		   iframeDoc.System=System;
	   	   var innerDiv=iframeDoc.getElementById('ResultInnerDiv');
	   	   if (isDefined(innerDiv)){
	  	    	   log("inner Scroll Height:"+innerDiv.scrollHeight);
		    	   $(ifr).height(innerDiv.scrollHeight+100);
	  	    	   if (isDefined(innerDiv.parentElement)){
	  	    		   log("inner Scroll Height:"+innerDiv.parentElement.scrollHeight);
	  	    	   } else {
	  	    		   log("Inner Div Parent does not exists");
	  	    	   }
	   	   } else {
	   		   log("Inner Div does not exists");
	   	   }
	   	   adjustIframeWidth(ifr);
	    };
	    
	    var pageContent=self.getInteractiveContent(idContent);
	    ifr.src=pageContent.blobUrl;
		loggerFactory.getLogger().enabled=true;
/*		self.result=sModelProcessedResult;
		if (self.config.NewWindow){
			self.openResultInNewTab();
		}*/
	}
}

var modelInteractiveFunctions=new jrfInteractive();