function arrayBufferToBase64(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var byteString = '';
    for(var i=0; i < byteArray.byteLength; i++) {
        byteString += String.fromCharCode(byteArray[i]);
    }
    var b64 = window.btoa(byteString);

    return b64;
}

function addNewLines(str) {
    var finalString = '';
    while(str.length > 0) {
        finalString += str.substring(0, 64) + '\n';
        str = str.substring(64);
    }

    return finalString;
}

function toPEM(privateKey) {
//    var b64 = addNewLines(arrayBufferToBase64(privateKey));
    var b64 = addNewLines(privateKey);
    var pem = "-----BEGIN PRIVATE KEY-----\n" + b64 + "-----END PRIVATE KEY-----";
    
    return pem;
}

function base64toHEX(base64) {
	  var raw = atob(base64);
	  var HEX = '';
	  for ( i = 0; i < raw.length; i++ ) {
	    var _hex = raw.charCodeAt(i).toString(16)
	    HEX += (_hex.length==2?_hex:'0'+_hex);
	  }
	  return HEX.toUpperCase();
	}
