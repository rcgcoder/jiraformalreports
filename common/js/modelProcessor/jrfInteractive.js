var jrfInteractive=class jrfInteractive{//this kind of definition allows to hot-reload
	constructor(){
		var self=this;
		self.interactiveContents=newHashMap();
	}
	addInteractiveContent(idContent,content){
		var self=this;
		self.interactiveContents.add(idContent,content);
	}
	getInteractiveContent(idContent){
		var self=this;
		return self.interactiveContents.getValue(idContent);
	}
	elemShowHide(elemId){
		var self=this;
        System.webapp.addStep("Show/Hide element", function(){
        	//debugger;
    		var sContent=self.getInteractiveContent(elemId);
    		var jqElem=$('#'+elemId);
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
    		System.webapp.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN");
	}
	openNewWindow(elemId){
		var self=this;
		var otherWindow; 
        System.webapp.addStep("Open New Window", function(){
        	debugger; 
    		var sContent=self.getInteractiveContent(elemId);
    		otherWindow= window.open("", '_blank');
//    		otherWindow= window.open("", 'newWindow','width=300,height=250');
    		otherWindow.close();
    		otherWindow.document.body.innerHTML = sContent.saToString();
    		System.webapp.addStep("Including CSS files",function(){
    			var arrFiles=[	//"ts/demo.ts",
    				"css/RCGTaskManager.css",
    				"aui/css/aui.css",
                    "aui/css/aui-experimental.css",
    			 ]; //test
                System.webapp.loadRemoteFiles(arrFiles,undefined,otherWindow);
        	});
        	System.webapp.addStep("Showing the window",function(arrContents){
        		var auxHtml=otherWindow.document.body.innerHTML;
//        		otherWindow= window.open("", 'newWindow','width=300,height=250');
        		otherWindow= window.open("", '_blank');
        		otherWindow.document.body.innerHTML = auxHtml;
        	    System.webapp.continueTask();
        	});
    		System.webapp.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN");
	}
}

var modelInteractiveFunctions=new jrfInteractive();