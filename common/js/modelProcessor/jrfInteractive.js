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
	elemShowHide(elemId,actWindow){
		var self=this;
		var theWindow=window;
		if (isDefined(actWindow)){
			theWindow=actWindow;
		}
//        System.webapp.addStep("Show/Hide element", function(){
        	debugger;
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
 //   		System.webapp.continueTask();
 //       },0,1,undefined,undefined,undefined,"GLOBAL_RUN");
	}
	openNewWindow(elemId,activeWindow){
		var self=this;
		var actWindow=window;
		if (isDefined(activeWindow)){
			actWindow=activeWindow;
		}
		log("Opening new Window. base window has focus:"+window.document.hasFocus()+ " active window has focus:"+actWindow.document.hasFocus());
		debugger;
		var otherWindow; 
		var sContent=self.getInteractiveContent(elemId);
		otherWindow= actWindow.open("", '_blank');
//    		otherWindow= window.open("", 'newWindow','width=300,height=250');
//		otherWindow.close();
		var jqBody=$(otherWindow.document.body);
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
 /*   	var auxHtml=jqBody.html();
    	var sUrl=System.webapp.composeUrl("proxy:html/empty.html");
    	sUrl="";
    	otherWindow= actWindow.open(sUrl, '_blank');
		$(otherWindow.document).ready(function(){
			log("execute de document ready");
    		otherWindow.document.body.innerHTML = auxHtml;
 */   		otherWindow.modelInteractiveFunctions=modelInteractiveFunctions;
    		otherWindow.System=System;
//		});
	}
}

var modelInteractiveFunctions=new jrfInteractive();