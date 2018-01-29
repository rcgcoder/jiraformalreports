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
var nContJSFilesLoading=0;
function reloadJSFiles(callback){
		log("Recargando Ficheros Javascripts");
		for (var i=0;i<arrJSFiles.length;i++){
			nContJSFilesLoading++;
			log("Cargando el fichero "+arrJSFiles[i]+" "+nContJSFilesLoading+" de "+arrJSFiles.length);
			loadjscssfile(arrJSFiles[i],"js");
		}
		var fncChekLoadJSFiles=function(){
			if (nContJSFilesLoading==0){
				log("Ficheros JS actualizados");
				callback();
			} else {
				log("Esperando que se recarguen los "+nContJSFilesLoading+" ficheros Javascript que faltan");
				setTimeout(fncChekLoadJSFiles,1000);
			}
		}
		fncChekLoadJSFiles();
	}
