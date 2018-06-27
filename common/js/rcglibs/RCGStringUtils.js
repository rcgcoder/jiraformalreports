'use strict';
// creates a list of global functions for habitual use of strings

String.prototype.trimLeft = String.prototype.trimLeft || function () {
    var start = -1;
    while( this.charCodeAt(++start) < 33 );
    return this.slice( start, this.length);
};

String.prototype.trimRight = String.prototype.trimRight || function () {
    var start = this.length;
    while( this.charCodeAt(--start) < 33 );
    return this.slice( 0,start);
};

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
	replaceAllWithBrackets(sText,find,replace){
		return sText.replace(find, replace);
	}
	replaceAllWithoutBrackets(sText,find,replace,bModulator){
		return sText.replace(new RegExp(find, bModulator), replace);
	}
	replaceAll(str, find, replace, bInsensitive) {
		  if (isUndefined(str)||(str==null)) return "";
		  var bModulator='g';
		  if (isDefined(bInsensitive)&&(bInsensitive)){
			  bModulator="i"+bModulator;
		  }
		  var replaceFnc;
		  if ((find.indexOf("[")>=0)||(find.indexOf("]")>=0)){
			  /*
			   * [ ] are special cases in find.... 
			   */
			  replaceFnc=replaceAllWithBrackets;
		  } else {
			  replaceFnc=replaceAllWithoutBrackets;
		  }
		  if (isString(str)){
			  return replaceFnc(str,find,replace,bModulator);
		  }
		  if (!isArray(str)) return "";
		  if (str.length==0) return "";
		  var sResult=[];
		  var sAux;
		  var sSubstr;
		  var fLength=find.length;
		  var strLength=(str.length-1);
		  var bNext=true;
		  var iRow=-1;
		  while (iRow<strLength){
			  if (bNext){
				  iRow++;
				  sAux=sAux+str[iRow];
			  }
			  if ((sAux=="")||(sAux.length<fLength)){
				  bNext=true;
			  } else {
				  sAux=replaceFnc(sAux,find,replace,bModulator);
				  if (sAux.length>fLength){// there is more letter... cut
					  sSubstr=sAux.substring(0,sAux.length-fLength);
					  sResult.push(sSubstr);
					  sAux=sAux.substring(sAux.length-fLength,sAux.length);
					  bNext=true;
				  }
			  }
		  }
		  if (sAux!=""){
			  if (sAux.length>fLength){
				  sAux=replaceFnc(sAux,find,replace,bModulator);
			  }
			  sResult.push(sAux);
		  }
		  if (sResult.length==1){
			  return sResult[0];
		  } else if (sResult.length==0){
			  return "";
		  } else return sResult;
	};

	stringArray_trim(arrStrings){
		// first left
		if (isUndefined(arrStrings)) return [];
		if (arrStrings.length==0) return arrStrings;
		if (isString(arrStrings)){
			arrStrings=[arrStrings];
		}
		while ((arrStrings.length>0)&&(arrStrings[0].trimLeft()=="")){
			arrStrings.unshift();
		}
		if (arrStrings.length>0) arrStrings[0]=arrStrings[0].trimLeft();

		while ((arrStrings.length>0)&&(arrStrings[arrStrings.length-1].trimRight()=="")){
			arrStrings.unshift();
		}
		if (arrStrings.length>0) arrStrings[arrStrings.length-1]=arrStrings[arrStrings.length-1].trimRight();
		
		return arrStrings;
	}
	
	stringArray_indexOf(arrStrings,sTag,bFindLast,bDivide,startPos,startSubArrayPos){
		var objResult={bLocated:false,
				arrPrevious:[]};
		var bLast=(isDefined(bLast)&&(bLast));
		var iPos=0;
		var iPosLocated=-1;
		var bLocated=false;
		var vSubArray;
		var vProcessArray;
		var bWithSubArrays=false;
		var auxStartPos;
		var auxSubArrayStartPos;
		var bDefinedSubStartPos=isDefined(startSubArrayPos);
		var bDefinedStartPos=isDefined(startPos);
		
		if (isString(arrStrings)){
			bDefinedSubStartPos=false;
			bDefinedStartPos=false;
			vProcessArray=[arrStrings];
		} else {
			var vSubArray=arrStrings[0];
			if (isArray(vSubArray) ){
				bWithSubArrays=true;
				vProcessArray=[];
				var iAux=0;
				var arrAux;
				for (var i=0;i<arrStrings.length;i++){
					arrAux=arrStrings[i];
					if (bDefinedSubStartPos){
						if (i<auxSubArrayStartPos){
							iAux+=arrAux.length;
						} else if(i==auxSubArrayStartPos) {
							if (bDefinedStartPos){
								iAux+=startPos;
							} else {
								iAux+=arrAux.length-1;
							}
							auxStartPos=iAux;
						}
					}
					vProcessArray=vProcessArray.concat(arrAux);
				}
			} else {
				bDefinedSubStartPos=false;
				vProcessArray=arrStrings;
			}
		}
		if (!bDefinedSubStartPos){
			if (bDefinedStartPos){
				auxStartPos=startPos;
			} else {
				auxStartPos=(bLast?vProcessArray.length-1:0);
			}
		}
		var iPos=auxStartPos;
		var indOf;
		var sRow;
		var iSubArray=auxSubArrayStartPos;
		bLocated=false;
		var bHigherPart=false;
		if (bLast){
			while ((!bLocated) && (
					((!bHiggerPart)&&(iPos>=0)) 
					|| 
					((bHiggerPart)&&(iPos>auxStartPos))
					)
				   ){
				sRow=vProcessArray[iPos];
				if (iPos>0){
					sRow=vProcessArray[iPos-1]+sRow;
				}
				indOf=sRow.lastIndexOf(sTag);
				if (indOf>=0){
					bLocated=true;
					if (iPos>0) {
						if (indOf>vProcessArray[iPos-1].length){
							indOf-=vProcessArray[iPos-1].length;
						} else {
							iPos--;
						}
					}
				} else {
					iPos--;
					if ((iPos<0)&&(!bHiggerPart)){
						bHiggerPart=true;
						iPos=vProcessArray.length-1;
					}
				}
			}
		} else {
			var vLength=vProcessArray.length;
			bHiggerPart=true;
			while ((!bLocated) && (
					((bHiggerPart)&&(iPos<vLength)) 
					|| 
					((!bHiggerPart)&&(iPos<auxStartPos))
					)
				   ){
				sRow=vProcessArray[iPos];
				if (iPos<vLength){
					sRow+=vProcessArray[iPos+1];
				}
				indOf=sRow.indexOf(sTag);
				if (indOf>=0){
					bLocated=true;
					if (indOf>vProcessArray[iPos].length){
						indOf-=vProcessArray[iPos].length;
						iPos++;
					}
				} else {
					iPos++;
					if ((iPos>=vLength)&&(bHiggerPart)){
						bHiggerPart=false;
						iPos=0;
					}
				}
			}
		}
		
		var arrPrevious=[];
		var arrPosterior=[];
		var strPos=-1;
		var sTrgString="";
		if (bLocated) {
			arrPrevious=vProcessArray.slice(0,iPos-1);
			arrPosterior=vProcessArray.slice(iPos+1);
			sTrgString=arrText[iPos];
			if (bLast) {
				strPos=sTrgString.lastIndexOf(sTag);
			} else {
				strPos=sTrgString.indexOf(sTag);
			}
			if (isDefined(bDivide)&&bDivide){
				var sAux=sTrgString.substring(0,strPos);
				arrPrevious.push(sAux);
				sAux=sTrgString.substring(strPos+sTag.length,sTrgString.length);
				arrPosterior.unshift(sAux);
				sTrgString=sTag;
				strPos=0;
			}
		} else {
			arrPrevious = vProcessArray;
		}
		var objResult={bLocated:bLocated,
						arrPrevious:arrPrevious,
						arrPosterior:arrPosterior,
						sString:sTrgString,
						iPos:strPos
						};
		return objResult;
	}
	
	stringArray_toString(saInput){
		var sAux="";
		saInput.forEach(function(sString){
			sAux=sAux+sString;
		});
		return sAux;
	}
	
	stringArray_replaceInnerText(saInput,openTag,closeTag,replaceBy,bReplaceAll){
		var saAux=saInput;
		var bRetry=true;
		var openInd;
		var closeInd;
		var objResult={bLocated:false,
				       nReplaced:0,
					   arrPrevious:saAux};
		var bLocated;
		var bReplace=false;
		if (isDefined(replaceBy)){
			bReplace=true;
		}
		var findStartPos=saAux.length;
		var replaceCount=0;
		while (bRetry){
			bLocated=false;
			openInd=stringArray_indexOf(saAux,openTag,true,true,findStartPos);
			if (openInd.bLocated){
				closeInd=stringArrayIndexOf(openInd.arrPosterior,closeTag,false,true);
				if (closeInd.bLocated){
					objResult={bLocated:true,
							nReplaced:0,
							arrPrevious:openInd.arrPrevious,
							arrPosterior:closeInd.arrPosterior,
							arrInner:closeInd.arrPrevious,
							};
					bLocated=true;
				}
			}
			if ((!bReplace)||(!bLocated)){
				objResult.bLocated=bLocated;
				bRetry=false;
				return objResult;
			} else if (bLocated) {
				var vReplaceAux=replaceBy;
				if (isMethod(replaceBy)){
					vReplaceAux=replaceBy(objResult.arrInner);
				}
				if (isString(vReplaceAux)){
					objResult.arrPrevious.push(vReplaceAux);
					objResult.arrInner=[];
				} else if (isArray(vReplaceAux)){
					objResult.arrPrevious.concat(vReplaceAux);
					objResult.arrInner=[];
				} else {
					log ("error");
				}
				replaceCount++;
				if (bReplaceAll){
					findStartPos=objResult.arrPrevious.length;
					sAux=[objResult.arrPrevious,objResult.arrPosterior];
					bRetry=true;
				} else {
					objResult.bLocated=true;
					objResult.nReplaced=replaceCount;
					return objResult;
				}
			}
		}
	}
	
	
	
	
	decodeEntities(encodedString) {
	    var textArea = document.createElement('textarea');
	    textArea.innerHTML = encodedString;
	    return textArea.value;
	}
	removeInnerTags(sHtml,bClear){
		var sTagText=sHtml;
		var indCloseTag;
		var sInnerChar=" ";
		if (isDefined(bClear)&&bClear){
			sInnerChar="";
		}
		

		var indFirstCloseTag=sTagText.indexOf(">");
		var indOpenTag=sTagText.substring(0,indFirstCloseTag).lastIndexOf("<");

		while((indOpenTag>=0)&&(indOpenTag<indFirstCloseTag)){
			indCloseTag=sTagText.indexOf(">",indOpenTag+1);
			sTagText=sTagText.substring(0,indOpenTag)+ sInnerChar +sTagText.substring(indCloseTag+1,sTagText.length);
			indFirstCloseTag=sTagText.indexOf(">");
			indOpenTag=sTagText.substring(0,indFirstCloseTag).lastIndexOf("<");
		}
		return sTagText;
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
