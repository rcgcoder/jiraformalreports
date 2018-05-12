var jrfModel=class jrfModel{ //this kind of definition allows to hot-reload
	constructor(theReport){
		var self=this;
		self.variables=new RCGVarEngine();
		self.tokenBase=new jrfToken(self);
		self.htmlStack=newHashMap();
		self.html="";
		self.markdownConverter = new showdown.Converter();
		self.report=theReport;
		self.processingRoot="";
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
	extendToken(tagApplier,tag,reportElem){
		var self=this;
		self.tokenBase.extendObj(tagApplier,tag,reportElem);
	}
	pushHtmlBuffer(sText){
		var self=this;
		self.htmlStack.push(self.html);
		self.html="";
		if (isDefined(sText)){
			self.html=sText;
		}
	}
	popHtmlBuffer(){
		var self=this;
		var htmlAnt=self.html;
		var html=self.htmlStack.pop();
		self.html=html;
		return htmlAnt;
	}
	addHtml(sText){
		var self=this;
		if ((isDefined(sText)) && (sText!=null)){
			try {
				log((""+sText).substring(0,150));
			}
			catch(err) {
			    log("Mega Error");
			}
			self.html+="\n"+sText;
		}
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
			tag.addAttribute({id:element.name.trim(),value:element.value});
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
	removeInnerTags(sHtml,bClear){
		var sTagText=sHtml;
		var indCloseTag;
		var indOpenTag=sTagText.lastIndexOf("<");
		var sInnerChar=" ";
		if (isDefined(bClear)&&bClear){
			sInnerChar="";
		}
		while(indOpenTag>=0){
			indCloseTag=sTagText.indexOf(">",indOpenTag+1);
			sTagText=sTagText.substring(0,indOpenTag)+ sInnerChar +sTagText.substring(indCloseTag+1,sTagText.length);
			indOpenTag=sTagText.lastIndexOf("<");
		}
		return sTagText;
	}
	processRecursive(arrJRFs,indexAct,parentTag,sInitialPrependText){
		var self=this;
		var auxIndex=indexAct;
		var sTagRest=sInitialPrependText;
		var sTagAttribs="";
		
		while (auxIndex<arrJRFs.length){

			var auxTag=self.tagFactory.new();
			parentTag.addChild(auxTag);
			
			auxTag.setPreviousHTML(sTagRest);
			

			var sTagText=arrJRFs[auxIndex];
			var sNewPostText="";
			sTagText=self.removeInnerTags(sTagText);
			
			var indCloseTag=sTagText.indexOf(">");
			var indEmptyTag=sTagText.indexOf("/>");
			var indWithCloseTag=sTagText.indexOf("</JRF>");
			
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
		self.pushHtmlBuffer();
		self.addHtml("<!-- " + tag.getTagText()+" -->");
		self.addHtml("<!-- " + self.traceTag(tag)+ " -->");
		var i=0;
		var tagApplier;
		var tagAttrs=tag.getAttributes();
		var sTokenName="jrfNoop";
		if (tagAttrs.exists("foreach")){
			sTokenName="jrfForEach";
		} else if (tagAttrs.exists("formula")){
			sTokenName="jrfFormula";
		} else if (tagAttrs.exists("field")){
			sTokenName="jrfField";
		} else if (tagAttrs.exists("formula")){
			sTokenName="jrfFormula";
		} else if (tagAttrs.exists("getvar")){
			sTokenName="jrfGetVar";
		} else if (tagAttrs.exists("sum")){
			sTokenName="jrfSum";
		} else {
			sTokenName="jrfNoop";
		}
		tagApplier=new window[sTokenName](tag,reportElem,self);

		self.addHtml(tagApplier.encode()); 
		
		return self.popHtmlBuffer();
	}
	encode(parentTag,reportElement){
		var self=this;
		self.pushHtmlBuffer();
		var reportElem=reportElement;
		if (isUndefined(reportElem)){
			reportElem=self.report;
		}
		self.addHtml(self.applyTag(parentTag,reportElem));
		return self.popHtmlBuffer();
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
		var sHtml=self.encode(rootJRF);
		log(sHtml);
		return sHtml;
	}
}