class jrfModel{
	constructor(theReport){
		var self=this;
		self.htmlStack=newHashMap();
		self.html="";
		self.markdownConverter = new showdown.Converter();
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
	extendObj(obj){
		var self=this;
		obj.pushHtmlBuffer=function(){self.pushHtmlBuffer();};
		obj.popHtmlBuffer=function(){return self.popHtmlBuffer();};
		obj.addHtml=function(sHtml){self.addHtml(sHtml);};
		obj.getAttrVal=self.getAttrVal;
	}
	pushHtmlBuffer(){
		var self=this;
		self.htmlStack.push(self.html);
		self.html="";
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
//		log(sText);
		self.html+="\n"+sText;
	}
	getAttrVal(idAttr){
		var self=this;
		var attr=self.tag.getAttributeById(idAttr.toLowerCase());
		if (isDefined(attr)){
			var vAux=attr.value;
			if (isUndefined(vAux)){
				vAux="";
			}
			return vAux;
		}
		return "";
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
	removeInnerTags(sHtml){
		var sTagText=sHtml;
		var indCloseTag=sTagText.indexOf(">");
		var indOpenTag=sTagText.indexOf("<");
		while ((indOpenTag>=0)&&(indOpenTag<indCloseTag)){// there is </p> into the jrf tag
			sTagText=sTagText.substring(0,indOpenTag)+ " " +sTagText.substring(indCloseTag+1,sTagText.length);
			indCloseTag=sTagText.indexOf(">");
			indOpenTag=sTagText.indexOf("<");
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
			//sTagText=self.removeInnerTags(sTagText);
			
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
		if (tagAttrs.exists("foreach")){
			tagApplier=new jrfForEach(tag,reportElem,self);
		} else if (tagAttrs.exists("field")){
			tagApplier=new jrfField(tag,reportElem,self);
		}
		if (isDefined(tagApplier)){ // if tag is defined... it manages the childs...
			self.addHtml(tagApplier.apply()); 
		} else { // if tag is not defined ... show the childs..... for test
			self.addHtml(tag.getPreviousHTML());
			self.addHtml("<!-- "+self.traceTag(tag)+" -->");
			if (tag.countChilds()>0){
				self.addHtml("<!-  child list start       -->");
				tag.getChilds().walk(function(tagElem){
					self.addHtml(self.encode(tagElem,reportElem));
				});
				self.addHtml("<!-  child list stop       -->");
			}
			self.addHtml(tag.getPostHTML());
		}
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