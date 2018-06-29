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
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN");
	}
}

var modelInteractiveFunctions=new jrfInteractive();