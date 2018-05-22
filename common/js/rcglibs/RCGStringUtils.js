'use strict';
// creates a list of global functions for habitual use of strings
class RCGStringUtils{
	number_format(number,ndecimals,decPoint,milesPoint){
		var nAux=parseFloat(number).toFixed(ndecimals);
		var nStr = ''+nAux;
		var x = nStr.split('.');
		var x1 = x[0];
		var x2 = x.length > 1 ? decPoint + x[1] : '';
		var rgx = /(\d+)(\d{3})/;
		while (rgx.test(x1)) {
			x1 = x1.replace(rgx, '$1' + milesPoint + '$2');
		}
		return x1 + x2;
	};
    normalFormatNumber(number,bClearZero){
		var numAux=number+""; // por si es un string
		if (numAux==""){
			numAux=0;
		}
		numAux=parseFloat(numAux).toFixed(2);
		if (numAux==0) {
			if (typeof bClearZero!=="undefined"){
				if (bClearZero){
					return "";
				}
			} else {
				return "0,00";
			}
		}
		numAux=number_format(numAux,2,",",".");
		return numAux;
    }
	
    inSeconds(number,bClearZero){
    	var sAux=normalFormatNumber((number/1000.0),bClearZero);
    	if (bClearZero){
    		if ((sAux=="")||(sAux=="0,00")) {
    			return "";
    		}
    	}
    	sAux+="s";
    	return sAux;
    }	
    inPercent(number,bClearZero){
    	var sAux=normalFormatNumber((number*100.0),bClearZero);
    	if (bClearZero){
    		if ((sAux=="")||(sAux=="0,00")) {
    			return "";
    		}
    	}
    	sAux+="%";
    	return sAux;
    }	
	inEuros(number,bWithMoneySign,bClearZero,sMoneyChars){
		var sAux=normalFormatNumber(number,bClearZero); // por si es un string
    	if (bClearZero){
    		if ((sAux=="")||(sAux=="0,00")) {
    			return "";
    		}
    	}
		if (typeof bWithMoneySign!=="undefined"){
			if (bWithMoneySign){
				if (typeof sMoneyChars!=="undefined"){
					sAux+=" "+sMoneyChars;
				} else {
					sAux+=" €";
				}
			}
		}
		return sAux;
	};
	
	fillCharsLeft(iNumChars,sString,sCharFill){
		var sChar="0";
		if (typeof sCharFill!=="undefined"){
			sChar=sCharFill;
		}
		var sResult=sString+"";
		while (sResult.length<iNumChars){
			sResult=sChar+sResult;
		}
		return sResult;
	};
	
	replaceAll(str, find, replace, bInsensitive) {
		  var bModulator='g';
		  if (isDefined(bInsensitive)&&(bInsensitive)){
			  bModulator="i"+bModulator;
		  }
		  /*
		   * [ ] are special cases in find.... 
		   */
		  if ((find.indexOf("[")>=0)||(find.indexOf("]")>=0)){
			  return str.replace(find, replace);
		  } else {
			  return str.replace(new RegExp(find, bModulator), replace);
		  }
	};
	decodeEntities(encodedString) {
	    var textArea = document.createElement('textarea');
	    textArea.innerHTML = encodedString;
	    return textArea.value;
	}
	prepareComparation(str,bCaseInsensitive,bRemoveSpecials){
			var sValue=str;
			if (typeof bCaseInsensitive !=="undefined"){
				if (bCaseInsensitive){
					sValue=sValue.toUpperCase();
				}
			}
			if (typeof bRemoveSpecials!=="undefined"){
				if (bRemoveSpecials){
					sValue=replaceAll(sValue,'Á','A');
					sValue=replaceAll(sValue,'É','E');
					sValue=replaceAll(sValue,'Í','I');
					sValue=replaceAll(sValue,'Ó','O');
					sValue=replaceAll(sValue,'Ú','U');
					sValue=replaceAll(sValue,'á','a');
					sValue=replaceAll(sValue,'é','e');
					sValue=replaceAll(sValue,'í','i');
					sValue=replaceAll(sValue,'ó','o');
					sValue=replaceAll(sValue,'ú','u');
				}
			}
					
			return sValue;
	};
}
registerClass(RCGStringUtils);
