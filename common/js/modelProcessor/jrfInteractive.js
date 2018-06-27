var jrfInteractive=class jrfInteractive {//this kind of definition allows to hot-reload
	elemShowHide(elemId){
		debugger;
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
	}
}

