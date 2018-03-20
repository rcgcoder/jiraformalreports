'use strict';
class RCGMathUtils{
	rndMinMax(vMin,vMax,bNoRound){
		if ((typeof bNoRound==="undefined")||(!bNoRound)){
			return Math.round(vMin+(Math.random()*(vMax-vMin)));
		} else {
			return (vMin+(Math.random()*(vMax-vMin)));
		}
	}
}
if (isInNodeJS()){
	module.exports=RCGMathUtils;
}
