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
		var saItem=self.getInteractiveContent(elemId);
		var saContent=saItem.html;
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
		var sContentWrapper=self.getInteractiveContent(elemId);
		var sContent=sContentWrapper.html;
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
	
	openInWindow(idContent,callback,iFrameId,divShellId){
		debugger;
		var self=this;
		if (isUndefined(iFrameId)||iFrameId==""){
			self.openNewWindow(idContent);
			if (isDefined(callback))callback();
			return;
		}
	    var jqDiv=$("#"+divShellId);
	    var viewWidth=jqDiv.width();
	    var viewHeight=jqDiv.height();
	    jqDiv[0].interactiveContentId={idContent:idContent,callback:callback,idIframe:iFrameId,divId:divShellId};
	    
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
				if (isDefined(callback))callback();
	    	}
	    };        
	    var ifr=document.getElementById(iFrameId);
	    ifr.onload=function(){
	    	$(ifr).width('100%');
	    	//	            this.style.display='block';
	       log('load the iframe')
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
	    var blobResult = new Blob(pageContent.html, {type : "text/html"});
        var blobUrl = window.URL.createObjectURL(blobResult);
	    ifr.src=blobUrl ;
		loggerFactory.getLogger().enabled=true;
/*		self.result=sModelProcessedResult;
		if (self.config.NewWindow){
			self.openResultInNewTab();
		}*/
	}
	getResultFromBrowser(idIframe){
		var ifr=document.getElementById(idIframe);
		var ifrDoc=ifr.contentDocument;
		var ifrBodyHtml=ifrDoc.body.innerHTML;
		var arrHtml=[];
		var iInit=0;
		while (iInit<ifrBodyHtml.length){
		     arrHtml.push(ifrBodyHtml.substring(iInit,iInit+4096));
		     iInit+=4096;
		}
		var sModelProcessedResult=arrHtml;
        var saPrependContent=[];
		saPrependContent.push(`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//ES"
				"http://www.w3.org/TR/html4/strict.dtd">
				<HTML>
				<HEAD> 
				<meta http-equiv='Content-Type' content='Type=text/html; charset=utf-8'>
				<script type="text/javascript" src="https://unpkg.com/xlsx/dist/shim.min.js"></script>
				<script type="text/javascript" src="https://unpkg.com/xlsx/dist/xlsx.full.min.js"></script>
				
				<script type="text/javascript" src="https://unpkg.com/blob.js@1.0.1/Blob.js"></script>
				<script type="text/javascript" src="https://unpkg.com/file-saver@1.3.3/FileSaver.js"></script>`
				);
		var arrFiles=[	//"ts/demo.ts",
			"css/RCGTaskManager.css",
			"aui/css/aui.css",
            "aui/css/aui-experimental.css",
            ]; //test
		arrFiles.forEach(function (sRelativePath){
			var sAbsPath=System.webapp.composeUrl(sRelativePath);
			saPrependContent.push('<link rel="stylesheet" type="text/css" href="'+sAbsPath+'">');
		});
		saPrependContent.push(`
				<script type="text/javascript" >
				function onBodyLoadEvent(){
					alert("Is Full Loaded");
				}
				</script>
				</HEAD> <BODY>
				`);		
		var vAux;
		while (saPrependContent.length>0){
			vAux=saPrependContent.pop();
			sModelProcessedResult.unshift(vAux);
		}
		sModelProcessedResult.push("</BODY></HTML>");
		return sModelProcessedResult;
	}
	removeHiddenElements(iFrameDocument){
		$(iFrameDocument.body).find("tr").not(":visible").remove(); 
	}
	cleanContent(oContent){
        var self=this;
	    var intContent=self.getInteractiveContent(oContent.idContent);
	    
		var ifr=document.getElementById(oContent.idIframe);
		var ifrDoc=ifr.contentDocument;
		self.removeHiddenElements(ifrDoc);
		
		var sModelAux=self.getResultFromBrowser("ReportResult");
        intContent.html=sModelAux;
        var webapp=System.webapp;
		webapp.addStep("Removing empty lines of HTML ",function(){
			debugger;
			var otherSpace=String.fromCharCode(160);
			var pairs=[ [" <br>","<br>",0]
						,[" <p>","<p>",0]
						,[" </p>","</p>",0]
						,[" <div>","<div>",0]
						,["\n<div>","<div>",0]
						,["\n<p>","<p>",0]
						,["\n<br>","<br>",0]
						,["\n</p>","</p>",0]
						,["\n</span>","</p>",0]
						,[otherSpace+"<div>","<div>",0]
						,[otherSpace+"<p>","<p>",0]
						,[otherSpace+"<br>","<br>",0]
						,[otherSpace+"</p>","</p>",0]
						,["<br><p>","<p>",0]
						,["<br><br>","<br>",0]
						,["<p><br>","<p>",0]
						,["<p></p>","",0]
						,["<p><span></p>","<br>",0]
						,["<p><span></span></p>","<br>",0]
						,["<span >","<span>",0]
						,["<span></span>","",0]
						,['<p >','<p>',0]		
					];
			var iPairClean=0;
			var nPairs=pairs.length;
//			var sControl="";
//			var sControl2="";
//			var sControl3="";
			var fncAddStep=webapp.createManagedCallback(function(pair){
				webapp.addStep("Removing pair ["+ pair[0]+"] -> ["+pair[1]+"]"+" time:"+pair[2],function(){
					var sTgt=pair[0];
					var sRpl=pair[1];
					pair[2]++;
/*					sControl=sModelAux.saToString();
					var iPos=sControl.indexOf(sTgt);
					var isaPos=sModelAux.saFindPos(sTgt,false,0);
					if (iPos!=isaPos){
						logError("not equals...");
						isaPos=sModelAux.saFindPos(sTgt,false,0);
					} else if ((iPos>=0)&&(!sModelAux.saExists(sTgt))){
						logError("Exists error...");
					} else if ((iPos<0)&&(sModelAux.saExists(sTgt))){
						logError("Exists error 2...");
					}
*/					if (sModelAux.saExists(sTgt)){
						sModelAux=sModelAux.saReplaceAll(sTgt,sRpl,true);
						iPairClean=0;
					} else {
						iPairClean++;
					}
					if (iPairClean<nPairs){
						fncAddStep(pair);
					}
					webapp.continueTask();
				});
			});
			pairs.forEach(function(pair){
				fncAddStep(pair);
			});
			webapp.continueTask([sModelAux]);
		});
		webapp.addStep("change content in result window",function(){
			self.openInWindow(oContent.idContent,oContent.callback,oContent.idIframe,oContent.divId);
			webapp.continueTask();
		});
	}
}

var modelInteractiveFunctions=new jrfInteractive();