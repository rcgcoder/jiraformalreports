Array.prototype.saTrim = function () {
	var arrStrings=this;
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
};

Array.prototype.saIndexOf= function (sTag,bFindLast,bDivide,startPos,startSubArrayPos){
		var arrStrings=this;
		var objResult={bLocated:false,
				arrPrevious:[]};
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
					((!bHigherPart)&&(iPos>=0)) 
					|| 
					((bHigherPart)&&(iPos>auxStartPos))
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
	};
	
Array.prototype.saToString= function (){
		var saInput=this;
		var sAux="";
		saInput.forEach(function(sString){
			sAux=sAux+sString;
		});
		return sAux;
	};
	
Array.prototype.saReplaceInnerText=function(openTag,closeTag,replaceBy,bReplaceAll){
		var saInput=this;
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
	};
