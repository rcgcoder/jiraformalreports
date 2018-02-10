var filesystem={};
/*
var compression_mode = 1;
var my_lzma = LZMA; /// lzma_worker.js creates a global LZMA object. We store it as a new variable just to match simple_demo.html.
*/
function replaceAll(str, find, replace) {
	  return str.replace(new RegExp(find, 'g'), replace);
	}

/**
 * @param initCallBack
 * @param quota
 * @returns
 */
function InitializeFileSystem(initCallBack,quota){
	var iQuota=500*1024*124;
	if (typeof quota!=="undefined"){
		iQuota=quota;
	}
	filesystem.status="OK";
	filesystem.statusMSG="NOT INITIALIZED";
	filesystem.error_callback=initCallBack;
	var fsErrorHandler=function(e) {
/*	  var msg = '';
	  switch (e.code) {
		case FileError.QUOTA_EXCEEDED_ERR:
		  msg = 'QUOTA_EXCEEDED_ERR';
		  break;
		case FileError.NOT_FOUND_ERR:
		  msg = 'NOT_FOUND_ERR';
		  break;
		case FileError.SECURITY_ERR:
		  msg = 'SECURITY_ERR';
		  break;
		case FileError.INVALID_MODIFICATION_ERR:
		  msg = 'INVALID_MODIFICATION_ERR';
		  break;
		case FileError.INVALID_STATE_ERR:
		  msg = 'INVALID_STATE_ERR';
		  break;
		default:
		  msg = 'Unknown Error';
		  break;
	  };
*/
	  filesystem.status="ERROR";
	  filesystem.statusMSG="The error msg was deleted";
	  if (typeof filesystem.error_callback!=="undefined"){
		  filesystem.error_callback();
	  }
	  console.log('Error in filesystem initialization');
	}
	var onInitFs=function(fs) {
		console.log('File system ' + fs.name +" is opened.");
		filesystem.fs=fs;
		filesystem.status="OK";
		filesystem.statusMSG="INITIALIZED";
		initCallBack();
	}
	
	var theNavigator=navigator;
	var theStorage=theNavigator.webkitPersistentStorage || theNavigator.PersistentStorage || theNavigator.persistentStorage;
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	if (typeof theStorage!=="undefined") {
		theStorage.requestQuota(iQuota, 
			function(grantedBytes) {
			  console.log("Quota granted:"+grantedBytes);
			  window.requestFileSystem(window.PERSISTENT, grantedBytes, onInitFs, fsErrorHandler);
			}, 
			function(e) {
			  console.log('Error', e);
			});
	} else {
		window.requestFileSystem(window.PERSISTENT, iQuota, onInitFs, fsErrorHandler);
	}
	filesystem.ReadFile=function(filename,cbExistsAndLoaded,cbNotExists){
		var newName=replaceAll(filename,"/","_DIR_");
		filesystem.error_callback=cbNotExists;
		this.fs.root.getFile(newName, {create: false}, function(fileEntry) {
				fileEntry.file(function(file) {
					console.log("Reading File From Persistent Storage");
					var reader = new FileReader();
					reader.content="";
					reader.onload=function(event){
						reader.content+=event.target.result;
					};
					reader.onloadend = function() {
						// The file exists and is readable
						if (false) {
							var sReaded = LZString.decompress(reader.content);
							console.log("Archive sizes, compressed:"+reader.content.length+" uncompressed:"+sReaded.length);
							cbExistsAndLoaded(sReaded);
						} else if (true){
							var lastPerc=0.0;
							var timeStart=Date.now();
							var cntArr=reader.content;
							var bCompressed=false;
							bCompressed=("#COMPRESSED#"==cntArr.substring(0,"#COMPRESSED#".length));
							if (bCompressed){
								cntArr=cntArr.substring("#COMPRESSED#".length,cntArr.length);
								/*for (var xi=0;xi<16;xi++){
									log("b64["+xi+"]:"+cntArr[xi]);
								}*/
								var arrBytes=toByteArray(cntArr);
								/*for (var xi=0;xi<16;xi++){
									log("u8a["+xi+"]:"+arrBytes[xi]);
								}*/
								arrBytes = Array.from(arrBytes);
								/*for (var xi=0;xi<16;xi++){
									log("arr["+xi+"]:"+arrBytes[xi]);
								}*/
								my_lzma.decompress(arrBytes, 
									function on_decompress_complete(result) {
										/*for (var xi=0;xi<16;xi++){
											log("result["+xi+"]:"+result[xi]);
										}*/
										if (result==null){
											console.log("not compressed... direct load:"+reader.content.length);
											cbExistsAndLoaded(reader.contenido);
										} else {
											/*for (var xi=0;xi<16;xi++){
												log("result["+xi+"]:"+result[xi]);
											}*/
											console.log("Decompressed: " + result.length + "/"+arrBytes.length);
											cbExistsAndLoaded(result);
										}
									}, 
									function on_decompress_progress_update(percent) {
										if ((percent*100)-lastPerc>10){
											lastPerc=(percent*100);
											/// Decompressing progress code goes here.
											console.log("Decompressing: " + (percent * 100).toFixed(2) + "% "+((Date.now()-timeStart)/1000).toFixed(2)+" secs");
										}
									});
							} else {
								console.log("File not compressed:"+reader.content.length);
								cbExistsAndLoaded(reader.content);
							}
						}
					};
					reader.readAsText(file);
				}, fsErrorHandler);
			}, fsErrorHandler);
	}
	
	filesystem.SaveFile=function (filename,theString,endWriteCallback,errorCallback) {
		
		var newName=replaceAll(filename,"/","_DIR_");
		var onDelete=function(){
			this.fs.root.getFile(newName, {create: true},
					function(DatFile) {
						DatFile.isFile=true;
						DatFile.name=newName;
						DatFile.fullPath = '/'+newName;
						DatFile.createWriter(
							function(DatContent) {
								DatContent.onwriteend = function(e) {
	//								console.log('Write completed.');
									endWriteCallback(e);
								};			
								DatContent.onerror = function(e) {
									console.log('Write failed: ' + e);
									errorCallback(e);
								};
								var theBlob;
								if (false){
									var compressed = LZString.compress(theString);
									console.log("Compressed: " + theString.length+" to "+compressed.length);
									var decompressed=LZString.decompress(compressed);
									console.log("Works!: " + theString.length+" in "+compressed.length + " in "+decompressed.length);
									theBlob = new Blob([compressed], {type: "text/plain"});
									DatContent.write(theBlob);
								} else if(false){
									var timeStart=Date.now();
									var percInit=0.0;
									my_lzma.compress(theString, compression_mode, 
												function on_compress_complete(result) {
													console.log("Compressed: " + result.length);
													/*for (var xi=0;xi<16;xi++){
														log("Comp["+xi+"]:"+result[xi]);
													}*/
													var arr = new Uint8Array(result);
													/*for (var xi=0;xi<16;xi++){
														log("u8a["+xi+"]:"+arr[xi]);
													}*/
													var sB64=fromByteArray(arr);
													/*for (var xi=0;xi<16;xi++){
														log("b64["+xi+"]:"+sB64[xi]);
													}*/
	//												console.log("B64: " + sB64.length);
	//												console.log("======");
													sB64="#COMPRESSED#"+sB64;
													theBlob = new Blob([sB64], {type: "text/plain"});
													DatContent.write(theBlob);
												}, 
												function on_compress_progress_update(percent) {
													if (((percent*100)-percInit)>10){
														percInit=(percent*100);
														/// Compressing progress code goes here.
														console.log("Compressing: " + (percent * 100).toFixed(2) + "% "+((Date.now()-timeStart)/1000).toFixed(2)+" secs");
														
													}
												});
								} else {
									theBlob = new Blob([theString], {type: "text/plain"});
									DatContent.write(theBlob);
								}
							});
						});
		}
		//deleting file;
		this.fs.root.getFile(newName, {create: false}, function(fileEntry) {

			    fileEntry.remove(function() {
			      onDelete();
			    }, errorHandler);

			  }, errorHandler);		
		
		}
	filesystem.RemoveFile=function(filename){
		var newName=replaceAll(filename,"/","_DIR_");
		localstorage.root.getFile(newName, {create: false}, function(DatFile) { DatFile.remove(function() {}); })
	}
}