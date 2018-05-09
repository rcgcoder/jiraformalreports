class jrfModel{
	constructor(theReport){
		var self=this;
		self.report=theReport;
		self.tagFactory=newDynamicObjectFactory(
				[{name:"Child",description:"subTags",type:"object"},
				 {name:"Attribute",description:"Attributes of the Item",type:"String"}
					]
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
	}
	updateAttributes(tag){
		var sTag=tag.getTagText();
		if ((sTag=="")||(isUndefined(sTag))) return;
		var jqTag=$(sTag);
		var sResult="";
		var attrs=jqTag[0].attributes;
		for (var i=0;i<attrs.length;i++){
			var element=attrs[i];
			if (sResult!=""){
				sResult+="\n";
			}
			tag.addAttribute({id:element.name,value:element.value});
		}
	}
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
	processRecursive(arrJRFs,indexAct,parentTag,sInitialPrependText){
		var self=this;
		var auxIndex=indexAct;
		var sTagRest=sInitialPrependText;
		var sTagAttribs="";
		
		while (auxIndex<arrJRFs.length){

			var auxTag=self.tagFactory.new();
			parentTag.addChild(auxTag);

			var sTagText=arrJRFs[auxIndex];
			var sNewPostText="";
			
			var indCloseTag=sTagText.indexOf(">");
			var indEmptyTag=sTagText.indexOf("/>");
			var indWithCloseTag=sTagText.indexOf("</JRF>");
			
			auxTag.setPreviousHTML(sTagRest);
			
			if (indCloseTag>=0){ // the tag closes
				if ((indEmptyTag<indCloseTag)&&(indEmptyTag>=0)){ // the tag closes with "/>"
					// the tag does not have inner html it closes with />
					sTagAttribs=sTagText.substring(0,indEmptyTag);
					sTagAttribs="<JRF "+ sTagAttribs +" />";
					auxTag.setTagText(sTagAttribs);
					self.updateAttributes(auxTag);
					auxTag.setPostHTML("");
					sTagRest=sTagText.substring(indEmptyTag+2,sTagText.length);
				} else {
					sTagAttribs=sTagText.substring(0,indCloseTag);
					sTagAttribs="<JRF "+ sTagAttribs +" />";
					sTagRest=sTagText.substring(indCloseTag+1,sTagText.length);
					auxTag.setTagText(sTagAttribs);
					self.updateAttributes(auxTag);
					
					if (indWithCloseTag<0) { // there is not a close tag...... there is tags inside actual
						var oAdvance=self.processRecursive(arrJRFs,auxIndex+1,auxTag,sTagRest); // the rest text without </jrf> if where in 
						sTagRest=oAdvance.text;
						auxIndex=oAdvance.actIndex;			
					}

					// getting the posthtml text
					indWithCloseTag=sTagRest.indexOf("</JRF>");
					if (indWithCloseTag>=0){
						sNewPostText=sTagRest.substring(0,indWithCloseTag);
						auxTag.setPostHTML(sNewPostText);
						sTagRest=sTagRest.substring(indWithCloseTag+6,sTagRest.length); // extract text before </jrf>
					}
				}
				indWithCloseTag=sTagRest.indexOf("</JRF>");
				if (indWithCloseTag>=0){ // there is </jrf> .... closes parents... 
					return {text:sTagRest,actIndex:auxIndex}; // return al text of </jrf>
				}
			} else {
				log("ERROR PARSING MODEL HTML");
				return;
			}
			auxIndex++;
		}
		return {text:sTagRest,actIndex:auxIndex}; // return al text of </jrf>
	}
	traceTag(tag){
		var sResult="";
		var i=0;
		tag.getAttributes().walk(function(attr){
			if (sResult!=""){
				sResult+="\n";
			}
			sResult+=(i++)+" - Name:"+attr.id+" Value:"+attr.value;
		});
		return sResult;
	}
	applyTag(tag,reportElem){
		var self=this;
		var sHTML="";
		sHTML+="<!--" + tag.getTagText()+"-->";
		sHTML+="<!--" + self.traceTag(tag)+ "-->";
		var i=0;
		var tagApplier;
		var tagAttrs=tag.getAttributes();
		if (tagAttrs.exists("forEachRoot")){
			tagApplier=new jrfForEach(tag,reportElem,self);
		}
		if (isDefined(tagApplier)){ // if tag is defined... it manages the childs...
			sHTML+=tagApplier.apply(); 
		} else { // if tag is not defined ... show the childs..... for test
			sHTML+=tag.getPreviousHTML();
			sHTML+="<!--"+self.traceTag(tag)+"-->";
			if (tag.countChilds()>0){
				sHTML+="<!-  child list start       -->";
				tag.getChilds().walk(function(tagElem){
					sHTML+=self.encode(tagElem,reportElem);
				});
				sHTML+="<!-  child list stop       -->";
			}
			sHTML+=tag.getPostHTML();
		}
		return sHTML;
	}
	encode(parentTag,reportElement){
		var self=this;
		var sHTML="";
		var reportElem=reportElement;
		if (isUndefined(reportElem)){
			reportElem=self.report;
		}
		sHTML=self.applyTag(parentTag,reportElem);
		return sHTML;
	}
	parse(html,parentTag){
		var self=this;
		var sModel=replaceAll(html,"<jRf","<JRF",true);
		sModel=replaceAll(sModel,"jrF>","JRF>",true);
		var arrJRFs=sModel.split("<JRF");
		if (sModel.indexOf("<JRF")==0){
			arrJRFs.unshift(""); // added a first element.....
		}
		var oAdvance=self.processRecursive(arrJRFs,1,parentTag,arrJRFs[0]);
		if (oAdvance.actIndex<arrJRFs.length){
			log("ERROR THERE IS NOT ALL TAG CLOSED");
		} else {
			var sTagRest=oAdvance.text;
			parentTag.setPostHTML(sTagRest);
		}
	}
	process(){
		var self=this;
		var sModel=self.report.config.model;
		var rootJRF=self.tagFactory.new();
		self.parse(sModel,rootJRF);
		return self.encode(rootJRF);
	}
}