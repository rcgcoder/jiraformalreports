var jrfInteractive=class jrfInteractive{//this kind of definition allows to hot-reload
	constructor(baseWindow){
		var self=this;
		self.interactiveContents=newHashMap();
	}
	addInteractiveContent(content){
		var self=this;
		var newId=(new Date()).getTime()+"-"+Math.round(Math.random()*1000);
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
		saPrependContent.push(`<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN"
   					"http://www.w3.org/TR/html4/strict.dtd">
					<HTML>
 					<HEAD> 
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
	saveToFile(elemId){
		var self=this;
		var sContent=self.getInteractiveContent(elemId).saToString();
		saveDataToFile(sContent, "savedFile.html", "text/html");
	}
	changeDisplayChildRow(elemId,forceHide,actWindow,sShowText,sHideText){
		var self=this;
		var theWindow=window;
		if (isDefined(actWindow)){
			theWindow=actWindow;
		}
		var hsParentRow=self.getInteractiveContent(elemId);
		var jqParent=$(theWindow.document.body).find('#'+elemId);
		var action="show";
		if (isDefined(jqParent[0].jrfExpanded)){
			if (jqParent[0].jrfExpanded){
				action="hide";
			}
			jqParent[0].jrfExpanded=(!jqParent[0].jrfExpanded);
		} else {
			jqParent[0].jrfExpanded=true;
		}
		if (isDefined(forceHide)&&forceHide){
			jqParent[0].jrfExpanded=false;			
			action="hide";
		}
		var jqButton=$(theWindow.document.body).find('#btn'+elemId);
		var btnCaption=sShowText;
		if (action=="show") btnCaption=sHideText
		jqButton.html(btnCaption);
		
		hsParentRow.walk(function(hsChild,iDeep,childId){
			var jqElem=$(theWindow.document.body).find('#'+childId);
			if (action=="show"){
				jqElem.css('display', '');
			} else {
				jqElem.css('display', 'none');
			}
			if (jqElem.length>0){
				jqElem[0].jrfExpanded=true;
			}
			var jqButton=$(theWindow.document.body).find('#btn'+childId);
			if (jqButton.length>0){
				jqButton.click();
			}
		});
	}

}

var modelInteractiveFunctions=new jrfInteractive();