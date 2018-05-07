class jrfModel{
	constructor(theReport){
		var self=this;
		self.report=theReport;
	}
	process(){
		var sModel=self.report.config.model
		sModel=replaceAll(sModel,"<jrf","<JRF",true);
		sModel=replaceAll(sModel,"jrf>","JRF>",true);
		var arrJRFs=sModel.split("<JRF");
		newDynamicObjectFactory(
				["Childs"]
				//arrAttributeList
				,
				["PreviousHTML", /* 		rootjrf
				 					...html (previous>...<jrf> 
												...(previous).. <jrf/> 
												...(previous).. <jrf> 
												...(postHtml)... </jrf> 
												...(previous).. <jrf> 
													...(previous).. <jrf> 
													...(postHtml)... </jrf> 
												...(postHtml)... </jrf> 
												...(previous).. <jrf> 
													...(previous).. <jrf/> 
												...(postHtml)... </jrf> 
											...(postHtml).. </jrf> 
									...(postHTML) html....
									*/
				"PostHTML",
				"TagText"]
				//arrAttributes
				,
				[]
				//arrAttributesPercs
				,
				"jrfTags");
		var rootJRF=jrfTags.new();
		var prependText=arrJRFs[0];
		var sTagRest="";
		var sInnerHtml="";
		var sTagAttribs="";
		rootJRF.setPreviousHTML(prependText);
		/* 
		   <A/>
		   <jrf 1 /> 
		 		<B/> 
		   <jrf 2 > 
		   		<C/> 
		   		<jrf 3> 
		   			<D/> 
		   		</jrf> 
		   		<E/> 
		   </jrf> 
		   		<F/> 
		   <jrf 4> 
		   		<G/> 
		   </jrf> 
		   <H/>
		*/
		// in array
		/*
		 *  <A/>
		 *  1 /> <B/> 
		 *  2 > <C/> 
		 *  3> <D/> </jrf> <E/> </jrf> <F/>
		 *  4> <G/> </jrf> <H/>
		 */
		var fncProcessRecursive=function(arrJRFs,indexAct,parentTag,prependTextAct){
			var sNewPrepend=prependTextAct;				
			var auxIndex=indexAct;
			while (auxIndex<arrJRFs.length){
				var auxTag=jrfTags.new();
				parentTag.addChild(auxTag);

				var sTagText=arrJRFs[auxIndex];
				var sNewPostText="";
				var indCloseTag=sTagText.indexOf(">");
				var indEmptyTag=sTagText.indexOf("/>");
				var indWithCloseTag=sTagText.indexOf("</JRF>");
				auxTag.setPreviousHTML(sNewPrepend);
				if (indCloseTag>=0){ // the tag closes
					if (indEmptyTag<indCloseTag){ // the tag closes with "/>"
						// the tag does not have inner html it closes with />
						sTagAttribs=sTagText.substring(0,indEmptyTag);
						sTagRest=sTagText.substring(indEmptyTag+2,sTagText.length);
						sTagAttribs="<JRF "+ sTagAttribs +" />";
						auxTag.setPostHTML("");
						auxTag.setTagText(sTagAttribs);
						if (indWithCloseTag>=0){ // there is </jrf> .... closes parents... 
							sNewPostText=sTagText.subString(indEmptyTag+2,indWithCloseTag); // get text before </jrf>
							auxTag.setPostHTML(sNewPostText); //save it in actual tag
							sTagRest=sTagText.subString(indWithCloseTag+6,sTagText.length); // extract text before </jrf>
							return sTagRest; // return al text of </jrf>
						} else { // there is not </jrf>..... the tag is ended.... or the text is a prepend text of another tag
							sNewPrepend=sTagRest;
						}
					} else if (indWithCloseTag<0) { // there is not a close tag...... the next tags are inside actual
						sTagAttribs=sTagText.substring(0,indCloseTag);
						sTagAttribs="<JRF "+ sTagAttribs +" />";
						auxTag.setTagText(sTagAttribs);
						var sNewPrepend=sTagText.substring(indCloseTag+1,sTagText.length);
						sTagRest=fncProcessRecursive(arrJRFs,auxIndex+1,auxTag,sNewPrepend); // the rest text without </jrf> if where in 
						var indNextCloseTag=sTagRest.indexOf("</JRF>");
						if (indNextCloseTag>=0){
							sNewPostText=sTagRest.substring(0,indNextCloseTag);
							sTagRest=sTagRest.subString(indNextCloseTag+6,sTagText.length); // extract text before </jrf>
							auxTag.setPostHTML(sNewPostText);
							return sTagRest;
						} else {
							sNewPrepend=sTagRest;
						}
					}
				}
				auxIndex++;
			}
		}
		fncProcessRecursive(rootJRF,1,rootJRF,prependText);

	}
}