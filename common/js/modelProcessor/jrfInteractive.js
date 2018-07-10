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
	openNewWindow(elemId){
		var self=this;
		var otherWindow; 
		var sContent=self.getInteractiveContent(elemId);
		otherWindow= actWindow.open("", '_blank');
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
		otherWindow.modelInteractiveFunctions=modelInteractiveFunctions;
    	otherWindow.System=System;
	}
}

var modelInteractiveFunctions=new jrfInteractive();