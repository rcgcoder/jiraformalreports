var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
var saveDataToFile = (data, fileName, mimeType) => {
	  const blob = new Blob([data], { type: mimeType });
	  const url = window.URL.createObjectURL(blob);
	  downloadURL(url, fileName, mimeType);
	  setTimeout(() => {
	    window.URL.revokeObjectURL(url);
	  }, 1000);
	};

var downloadURL = (data, fileName) => {
	  const a = document.createElement('a');
	  a.href = data;
	  a.download = fileName;
	  document.body.appendChild(a);
	  a.style = 'display: none';
	  a.click();
	  a.remove();
};