var jrfInteractive=class jrfInteractive{//this kind of definition allows to hot-reload
	elemShowHide(elemId){
        System.webapp.addStep("Show/Hide element", function(){
        	//debugger;
    		var jqElem=$('#'+elemId);
    		var elem=jqElem[0];
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
        System.webapp.addStep("Open New Window", function(){
        	debugger;
    		var win = window.open("", '_blank');
    		window.focus();
    		
    		var jqElem=$('#'+elemId);
    		win.document.body.innerHTML = jqElem.html();
    		System.webapp.addStep("Including CSS files",function(){
    			var arrFiles=[	//"ts/demo.ts",
    				"css/RCGTaskManager.css",
    				"aui/css/aui.css",
                    "aui/css/aui-experimental.css",
    			 ]; //test
                System.webapp.loadRemoteFiles(arrFiles,win);
        	});
        	System.webapp.addStep("Showing the window",function(arrContents){
        	    win.focus();
        	    self.continueTask();
        	});
    		System.webapp.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN");
	}
}

var modelInteractiveFunctions=new jrfInteractive();