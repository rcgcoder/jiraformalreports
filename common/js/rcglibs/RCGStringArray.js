Array.prototype.saTrim = function () {
	var arrStrings=this;
	if (isUndefined(arrStrings)) return [];
	if (arrStrings.length==0) return arrStrings;
	if (isString(arrStrings)){
		arrStrings=[arrStrings];
	}
	while ((arrStrings.length>0)&&(arrStrings[0].trimLeft()=="")){
		arrStrings.shift();
	}
	if (arrStrings.length>0) arrStrings[0]=arrStrings[0].trimLeft();

	while ((arrStrings.length>0)&&(arrStrings[arrStrings.length-1].trimRight()=="")){
		arrStrings.pop();
	}
	if (arrStrings.length>0) arrStrings[arrStrings.length-1]=arrStrings[arrStrings.length-1].trimRight();
	
	return arrStrings;
};
Array.prototype.saAppend= function (sText){
	var self=this;
	self.push(sText);
}
Array.prototype.saExists= function (sTag){
	var self=this;
	if (isString(self))return (self.indexOf(sTag)>=0);
	if (self.length==0) return false;
	for (var i=0;i<self.length;i++) {
		if (self[i].indexOf(sTag)>=0) return true;
	}
	var sRow;
	var i=0;
	sRow=self[i];
	var sLength=self.length;
	var stLength=sTag.length;
	while (i<sLength){
		while ((sRow.length<stLength)&&(i<sLength)){
			i++;
			sRow+=self[i];
		}
		if (sRow.indexOf(sTag)>=0) return true;
		i++;
		if (i>=sLength) return false;
		sRow=sRow.substring(sRow.length-stLength,sRow.length)+self[i];
	}
	return false;
}

Array.prototype.saIndexOf= function (sTag,bFindLast,bDivide,startPos,startSubArrayPos){
		var arrStrings=this;
		var objResult={bLocated:false,
				arrPrevious:[],
				arrPosterior:[]};
		var bLast=(isDefined(bFindLast)&&(bFindLast));
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
		var nSelectedBlocks=0;
		
		if (isString(arrStrings)){
			bDefinedSubStartPos=false;
			bDefinedStartPos=false;
			vProcessArray=[arrStrings];
		} else {
			var vSubArray=arrStrings[0];
			if (isArray(vSubArray) ){
//				debugger;
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
					((!bHigherPart)&&(iPos>=0)) 
					|| 
					((bHigherPart)&&(iPos>auxStartPos))
					)
				   ){
				sRow=vProcessArray[iPos];
				nSelectedBlocks=1;
				if (iPos>0){
					nSelectedBlocks=2;
					sRow=vProcessArray[iPos-1]+sRow;
				}
				indOf=sRow.lastIndexOf(sTag);
				if (indOf>=0){
					bLocated=true;
					if (iPos>0) {
						iPos--;
					}
				} else {
					iPos--;
					if ((iPos<0)&&(!bHigherPart)){
						bHigherPart=true;
						iPos=vProcessArray.length-1;
					} 
				}
			}
		} else {
			var vLength=vProcessArray.length;
			bHigherPart=true;
			while ((!bLocated) && (
					((bHigherPart)&&(iPos<vLength)) 
					|| 
					((!bHigherPart)&&(iPos<auxStartPos))
					)
				   ){
				bInterStrings=false;
				sRow=vProcessArray[iPos];
				nSelectedBlocks=1;
				if (iPos<(vLength-1)){
					nSelectedBlocks=2;
					sRow+=vProcessArray[iPos+1];
				}
				indOf=sRow.indexOf(sTag);
				if (indOf>=0){
					bLocated=true;
					// do not change the iPos
				} else {
					iPos++;
					if ((iPos>=vLength)&&(bHigherPart)){
						bHigherPart=false;
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
			if (iPos<=0){
				arrPrevious=[];
			} else {
				arrPrevious=vProcessArray.slice(0,iPos);
			}
			arrPosterior=vProcessArray.slice(iPos+nSelectedBlocks);
			sTrgString=sRow;
			strPos=indOf;
			if (isDefined(bDivide)&&bDivide){
				var sAux=sTrgString.substring(0,strPos);
				if (sAux!="") arrPrevious.push(sAux);
				sAux=sTrgString.substring(strPos+sTag.length,sTrgString.length);
				if (sAux!="") arrPosterior.unshift(sAux);
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
	};
Array.prototype.saFindPos=function(sTargetText,bFromEnd,initPos){
	var self=this;
	var bReverse=bFromEnd;
	if (self.length==0) return -1;
	if (isUndefined(bReverse)){
		bReverse=false;
	}
	var tgtLength=sTargetText.length;
	var selfLength=self.length;
	var iBlock;
	fncGotoInitPos=function(){
		var result={located:false,iBlockResult:0,sTextPart:""};
		if (isUndefined(initPos)) return result;
		var accumLetters=0;
		var sAux;
		var iBlockAnt=iBlock;
		iBlock=0;
		while (iBlock<selfLength){
			sAux=self[iBlock];
			accumLetters+=sAux.length;
			if (accumLetters<initPos){
				iBlock++;
			} else {
				if (accumLetters>initPos){
					accumLetters-=sAux.length;
				}
				var nStart=initPos-accumLetters;
				result.located=true;
				result.iBlockResult=iBlock;
				if (bReverse){
					result.sTextPart=sAux.substring(0,nStart);					
				} else {
					result.sTextPart=sAux.substring(nStart,sAux.length);					
				}
				return result;
			}
		}
		return result;
	}
	var iPos=-1;
	var auxCad="";
	var gotoResult;
	var bCustomStart=false;
	if (bReverse){
		iBlock=selfLength-1;
		gotoResult=fncGotoInitPos();
		if (gotoResult.located){
			iBlock=gotoResult.iBlockResult-1;
			auxCad=gotoResult.sTextPart;
			bCustomStart=true;
		}
		while (bCustomStart||((iBlock>=0)&&(iPos<0))){
			bCustomStart=false;
			while ((auxCad.length<tgtLength)&&(iBlock>=0)){
				auxCad=self[iBlock]+auxCad;
				iBlock--;
			}
			if (auxCad.length<tgtLength) return -1;
			iPos=auxCad.indexOf(sTargetText);
			if (iPos<0){
				auxCad=auxCad.substring(0,tgtLength-1);
			} else {
				var iPosAux=iPos;
				iBlock++;
				while (self[iBlock].length<iPosAux){
					iPosAux-=self[iBlock].length;
					iBlock++;
				}
				iPos=iPosAux;
			}
		}
		if (iPos<0) return -1;
	} else {
		iBlock=0;
		gotoResult=fncGotoInitPos();
		if (gotoResult.located){
			iBlock=gotoResult.iBlockResult+1;
			auxCad=gotoResult.sTextPart;
			bCustomStart=true;
		}
		while (bCustomStart||((iBlock<selfLength)&&(iPos<0))){
			bCustomStart=false;
			while ((auxCad.length<tgtLength)&&(iBlock<selfLength)){
				auxCad=auxCad+self[iBlock];
				iBlock++;
			}
			if (auxCad.length<tgtLength) return -1;
			iPos=auxCad.indexOf(sTargetText);
			if (iPos<0){
				auxCad=auxCad.substring(auxCad.length-(tgtLength-1),auxCad.length);
			} else {
				var sBlockStr="";
				var iLengthAux=auxCad.length;
				var iPosAux=iPos;
				iBlock--;
				sBlockStr=self[iBlock];
				while ((iLengthAux-self[iBlock].length)>iPosAux){
					sBlockStr=self[iBlock];
					iLengthAux-=sBlockStr.length;
					iBlock--;
				}
				var iPosRest=iPosAux-(iLengthAux-sBlockStr.length);
				iPos=iPosRest;
			}
		}
		if (iPos<0) return -1;
	}
	// iBlock is the string element that contains the target text .... or a first part of it
	iBlock--;
	var nLetters=0;
	while (iBlock>=0){
		nLetters+=self[iBlock].length;
		iBlock--;
	}
	iPos+=nLetters;
	return iPos;
}
Array.prototype.saSubstring=function(iPosStart,iPosEnd){
	var self=this;
	var iPos=0;
	var nLetters=-1;
	if (isDefined(iPosEnd)){
		nLetters=iPosEnd-iPosStart;
	}
	var iBlock=0;
	var sAux="";
	var accumLetters=0;
	var selfLength=self.length;
	var iPosAux=iPosStart;
	var sResult="";
	while (iBlock<selfLength){
		sAux=self[iBlock];
		if (iPosAux-sAux.length>0){
			iPosAux-=sAux.length;
		} else {
			sResult=sAux.substring(iPosAux,sAux.length);
			if (nLetters>0);{
				if (sResult.length>nLetters){
					return sResult.substring(0,nLetters);
				}
			}
		}
		iBlock++;
	}
	return sResult;
}
Array.prototype.saReplace=function(iPosStart,nLetters,sTextToSet){
	// first goto to the block....
	var self=this;
	var iPos=0;
	var sReplace="";
	if (isDefined(sTextToSet)){
		sReplace=sTextToSet;
	}
	var iBlock=0;
	var sAux="";
	var accumLetters=0;
	var selfLength=self.length;
	var iPosAux=iPosStart;
	while (iBlock<selfLength){
		sAux=self[iBlock];
		if (iPosAux-sAux.length>0){
			iPosAux-=sAux.length;
			iBlock++;
		} else {
			var sResult=sAux.substring(0,iPosAux);
			sResult+=sReplace;
			sResult+=sAux.substring(iPosAux+nLetters,sAux.length);
			self[iBlock]=sResult;
			return;
		}
	}
}
Array.prototype.saRemoveInnerHtmlTags= function (sReplaceText){
	var arrStrings=this;
	var replaceBy="";
	if (isDefined(sReplaceText)) replaceBy=sReplaceText;
	var objResult=this.saReplaceInnerText("<",">",replaceBy,true);
	var saResult=objResult.arrPrevious;
	if (isDefined(objResult.arrInner)&&(objResult.arrInner.length>0)){
		saResult=saResult.concat(objResult.arrInner);
	}
	if (isDefined(objResult.arrPosterior)&&(objResult.arrPosterior.length>0)){
		saResult=saResult.concat(objResult.arrPosterior);
	}
	return saResult;
};


String.prototype.saRemoveInnerHtmlTags= function (sReplaceText){
	return [this].saRemoveInnerHtmlTags(sReplaceText);
};

String.prototype.saSubstring= function (iPosStart,iPosEnd){
	return [this].saSubstring(iPosStart,iPosEnd);
};
String.prototype.saToString= function (){
	return this;
};
String.prototype.saTrim= function (){
	return this.trim();
};
String.prototype.saAppend= function (sText){
	return this+sText;
};
String.prototype.saFindPos= function (sText,bFromEnd){
	return [this].saFindPos(sText,bFromEnd);
};
String.prototype.saReplace= function (iPos,nLetters,sReplacement){
	return [this].saReplace(iPos,nLetters,sReplacement);
};

String.prototype.saIndexOf= function (sTag,bFindLast,bDivide,startPos,startSubArrayPos){
	return [this].saIndexOf(sTag,bFindLast,bDivide,startPos,startSubArrayPos);
}
String.prototype.saExists= function (sTag){
	return (this.indexOf(sTag)>=0);
}

	
Array.prototype.saToString= function (){
		var saInput=this;
		var sAux="";
		saInput.forEach(function(sString){
			sAux=sAux+sString;
		});
		return sAux;
	};
	
Array.prototype.saReplaceInnerText=function(openTag,closeTag,replaceBy,bReplaceAll,otherParams){
		var saInput=this;
		var saAux=saInput;
		var bRetry=true;
		var openInd;
		var closeInd;
		var objResult={bLocated:false,
				       nReplaced:0,
				       arrPosterior:[],
					   arrPrevious:saAux};
		var bLocated;
		var bReplace=false;
		if (isDefined(replaceBy)){
			bReplace=true;
		}
		var findStartPos=saAux.length-1;
		var replaceCount=0;
		while (bRetry){
			bLocated=false;
			openInd=saAux.saIndexOf(openTag,true,true,findStartPos);
			if (openInd.bLocated){
				closeInd=openInd.arrPosterior.saIndexOf(closeTag,false,true);
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
					vReplaceAux=replaceBy(objResult.arrInner,otherParams);
				}
				if (isString(vReplaceAux)){
					objResult.arrPrevious.push(vReplaceAux);
					objResult.arrInner=[];
				} else if (isArray(vReplaceAux)){
					objResult.arrPrevious.concat(vReplaceAux);
					objResult.arrInner=[];
				} else if (isObject(vReplaceAux)) {
					log ("error");
 				} else { // is primitive
					objResult.arrPrevious.push(vReplaceAux+"");
					objResult.arrInner=[]; 					
 				}
				replaceCount++;
				if (bReplaceAll){
					findStartPos=objResult.arrPrevious.length-1;
					saAux=[objResult.arrPrevious,objResult.arrPosterior];
					bRetry=true;
				} else {
					objResult.bLocated=true;
					objResult.nReplaced=replaceCount;
					return objResult;
				}
			}
		}
	};
