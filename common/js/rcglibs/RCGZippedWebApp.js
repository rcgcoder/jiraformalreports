/*
Class for download a Zip File with a lot of js files.
.... extract files to persistent 
.... load all files to memory
*/

zip.useWebWorkers=false;
/*
var workerScriptsPath = 'https://rawgit.com/rcgcoder/jiraformalreports/master/src/libs/zip';
zip.workerScripts = {
		  deflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/deflate.js'],
		  inflater: [workerScriptsPath+'/z-worker.js', workerScriptsPath+'/inflate.js']
		};
*/
class ZipModel{
	constructor(){
		this.URL = window.webkitURL || window.mozURL || window.URL;
		this.md5="";
		this.ZipFile="";
		this.ZipData="";
	}
	
	downloadAndGetEntries(urlZipFile,onend){
		var self=this;
		self.ZipFile=urlZipFile;
		var xhr = new XMLHttpRequest();
		xhr.open('GET', urlZipFile, true);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
		  if (this.status == 200) {
		    var myBlob = this.response;
		    self.ZipData=myBlob;
		    var md5=SparkMD5.ArrayBuffer.hash(myBlob);
		    self.md5=md5;
		    // myBlob is now the blob that the object URL pointed to.
		    self.getEntries(myBlob,onend);
		  }
		};
		xhr.send();	
	}
		
	getEntries(file, onend) {
		zip.createReader(new zip.BlobReader(file), function(zipReader) {
			zipReader.getEntries(onend);
		}, onerror);
	}
	getEntryFile(entry, creationMethod, onend, onprogress) {
		var writer, zipFileEntry;

		function getData() {
			entry.getData(writer, function(blob) {
				var blobURL = creationMethod == "Blob" ? URL.createObjectURL(blob) : zipFileEntry.toURL();
				onend(blobURL);
			}, onprogress);
		}

		if (creationMethod == "Blob") {
			writer = new zip.BlobWriter();
			getData();
		} else {
			createTempFile(function(fileEntry) {
				zipFileEntry = fileEntry;
				writer = new zip.FileWriter(zipFileEntry);
				getData();
			});
		}
	}
}

class ZippedApp{
	constructor(){
		var self=this;
		self.urlBase="";
		log("ZippedApp Created");
		self.requestFileSystem = window.webkitRequestFileSystem 
								|| window.mozRequestFileSystem 
								|| window.requestFileSystem;
		self.storage="";
	}
	onerror(message) {
		alert(message);
	}
	createTempFile(callback) {
		var self=this;
		var tmpFilename = "tmp.dat";
		self.requestFileSystem(TEMPORARY, 4 * 1024 * 1024 * 1024, 
			function(filesystem) {
				function create() {
					filesystem.root.getFile(tmpFilename, {
						create : true
					}, function(zipFile) {
						callback(zipFile);
					});
				}
				filesystem.root.getFile(tmpFilename, null, function(entry) {
					entry.remove(create, create);
				}, create);
			});
	}
	deploy(theZips,callback,storage){
		log("Deploying WebApp");
		var arrZips;
		if (!isArray(theZips)){
			arrZips=[theZips];
		} else {
			arrZips=theZips;
		}
		var model=new ZipModel();
		model.storage=storage;
/*		function download(entry, li, a) {
			model.getEntryFile(entry
								, creationMethodInput.value
								, function(blobURL) {
				var clickEvent = document.createEvent("MouseEvent");
				if (unzipProgress.parentNode)
					unzipProgress.parentNode.removeChild(unzipProgress);
				unzipProgress.value = 0;
				unzipProgress.max = 0;
				clickEvent.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
				a.href = blobURL;
				a.download = entry.filename;
				a.dispatchEvent(clickEvent);
			}, function(current, total) {
				unzipProgress.value = current;
				unzipProgress.max = total;
				li.appendChild(unzipProgress);
			});
		}
*/		var fncLoadZip=function(iZip){
			if (iZip>=arrZips.length){
				callback();
			} else {
				var sZipUrl=arrZips[iZip];
				log("Download Zip File:"+sZipUrl);
				model.downloadAndGetEntries(sZipUrl, function(entries) {
					entries.forEach(function(entry) {
						log("Entry read:"+entry.filename);
/*						var li = document.createElement("li");
						var a = document.createElement("a");
						a.textContent = entry.filename;
						a.href = "#";
						a.addEventListener("click", function(event) {
							if (!a.download) {
								download(entry, li, a);
								event.preventDefault();
								return false;
							}
						}, false);
						li.appendChild(a);
						fileList.appendChild(li);*/
					});
					fncLoadZip(iZip+1);
				});
			}
		}
		fncLoadZip(0);
	}
	run(){
		
	}
}
/*
run(theZips,bFileSystem){
}


(function(obj) {



	(function() {
		var fileInput = document.getElementById("file-input");
		var unzipProgress = document.createElement("progress");
		var fileList = document.getElementById("file-list");
		var creationMethodInput = document.getElementById("creation-method-input");


		if (typeof requestFileSystem == "undefined")
			creationMethodInput.options.length = 1;
		fileInput.addEventListener('change', function() {
			fileInput.disabled = true;
			model.getEntries(fileInput.files[0], function(entries) {
				fileList.innerHTML = "";
				entries.forEach(function(entry) {
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.textContent = entry.filename;
					a.href = "#";
					a.addEventListener("click", function(event) {
						if (!a.download) {
							download(entry, li, a);
							event.preventDefault();
							return false;
						}
					}, false);
					li.appendChild(a);
					fileList.appendChild(li);
				});
			});
		}, false);
	})();




})(this);


		var xhr = new XMLHttpRequest();
		xhr.open('GET', "https://api.github.com/repos/rcgcoder/jiraformalreports/commits/master", true);
		xhr.responseType = 'json';
		xhr.onload = function(e) {
		  if (this.status == 200) {
		    var myBlob = this.response;
		    self.ZipData=myBlob;
		    var md5=SparkMD5.ArrayBuffer.hash(myBlob);
		    self.md5=md5;
		    // myBlob is now the blob that the object URL pointed to.
		    self.getEntries(myBlob,onend);
		  }
		};
		xhr.send();	

	 
	 
	 
	 
	 	var storage;
	
		function loadPersistentStorage() {
		   // load persistent store after the DOM has loaded
		   Persist.remove('cookie');
		   Persist.remove('gears');
		   Persist.remove('flash');
		   Persist.remove('globalstorage');
		   Persist.remove('ie');
		   storage = new Persist.Store('JiraFormalReports');
		}



*/

