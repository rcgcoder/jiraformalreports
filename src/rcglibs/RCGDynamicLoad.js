function loadjscssfile(filename, filetype){
    if (filetype=="js"){ //if filename is a external JavaScript file
        var fileref=document.createElement('script')
        fileref.setAttribute("type","text/javascript")
        fileref.setAttribute("src", filename)
    }
    else if (filetype=="css"){ //if filename is an external CSS file
        var fileref=document.createElement("link")
        fileref.setAttribute("rel", "stylesheet")
        fileref.setAttribute("type", "text/css")
        fileref.setAttribute("href", filename)
    }
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}
var nTotalJSFilesToLoad=0;
var nContJSFilesLoading=0;
function reloadJSFile(jsFile, callback){
	log("Reloading Javascript or CSS file:"+jsFile);
	nTotalJSFilesToLoad++;
	nContJSFilesLoading++;
	log("Loading File "+jsFile+" "+nContJSFilesLoading+" / "+nTotalJSFilesToLoad);
	loadjscssfile(jsFile,"js");
	var fncCheckLoadJSFile=function(){
		if (nContJSFilesLoading==0){
			log("All files reloaded");
			callback();
		} else {
			log("Waiting form reload... "+nContJSFilesLoading+" files remain of "+nTotalJSFilesToLoad);
			setTimeout(fncCheckLoadJSFile,1000);
		}
	}
	fncChekLoadJSFile();
}


function reloadJSFiles(arrJSFiles, callback){
		log("Reloading Javascripts and CSS files");
		for (var i=0;i<arrJSFiles.length;i++){
			nContJSFilesLoading++;
			log("Loading File "+arrJSFiles[i]+" "+nContJSFilesLoading+" / "+arrJSFiles.length);
			loadjscssfile(arrJSFiles[i],"js");
		}
		var fncChekLoadJSFiles=function(){
			if (nContJSFilesLoading==0){
				log("All files reloaded");
				callback();
			} else {
				log("Waiting form reload... "+nContJSFilesLoading+" files remain");
				setTimeout(fncChekLoadJSFiles,1000);
			}
		}
		fncChekLoadJSFiles();
	}
