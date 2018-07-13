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
		var sContent=self.getInteractiveContent(elemId);
		otherWindow= window.open("", '_blank');
//		var winPath=System.webapp.composeUrl("html/empty.html");
//		otherWindow= window.open(winPath, '_blank');
		var jqBody=$(otherWindow.document.head);
		jqBody.html(sContent.saToString());
		var arrFiles=[	//"ts/demo.ts",
			"css/RCGTaskManager.css",
			"aui/css/aui.css",
            "aui/css/aui-experimental.css",
            ]; //test
		arrFiles.forEach(function (sRelativePath){
			var sAbsPath=System.webapp.composeUrl(sRelativePath);
			jqBody.append('<link rel="stylesheet" type="text/css" href="'+sAbsPath+'">');

		});
		var arrFiles=[	//"ts/demo.ts",
			"aui/js/aui.min.js",
            "aui/js/aui-experimental.min.js",
			"aui/js/aui-soy.min.js"
            ]; //test
		var sHtmlJSFunction= `var fncLoadJS=function(sAbsPath){
								document.createElement('script');
								oScript.type = "text\/javascript";
								oScript.onerror = function(){console.log("Error applying javascrip");};
								oHead.appendChild(oScript);
								oScript.src=sAbsPath;
							}`;
		arrFiles.forEach(function (sRelativePath){
			var sAbsPath=System.webapp.composeUrl(sRelativePath);
			sHtmlJSFunction+="\n fncLoadJS('"+sAbsPath+"');";
		});
		var oHead=(otherWindow.document.head || otherWindow.document.getElementsByTagName("head")[0]);
		var oScript = otherWindow.document.createElement("script");
		oScript.type = "text\/javascript";
		oScript.onerror = function(){console.log("Error applying javascrip");};
		oHead.appendChild(oScript);
		//oScript.src= sAbsPath;
		oScript.innerHTML =sHtmlJSFunction;
		
		
		otherWindow.modelInteractiveFunctions=modelInteractiveFunctions;
    	otherWindow.System=System;
	}
	saveToFile(elemId){
		var self=this;
		var sContent=self.getInteractiveContent(elemId).saToString();
		saveDataToFile(sContent, "savedFile.html", "text/html");
	}

}

var modelInteractiveFunctions=new jrfInteractive();