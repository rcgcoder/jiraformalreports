var jrfModel=class jrfModel{ //this kind of definition allows to hot-reload
	constructor(theReport){
		var self=this;
		System.webapp.getTaskManager().extendObject(self);
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
		System.webapp.getTaskManager().extendObject(tagApplier);
		self.tokenBase.extendObj(tagApplier,tag,reportElem);
	}
	pushHtmlBuffer(sText){
		var self=this;
		var indStack=self.htmlStack.length();
		self.htmlStack.push(self.html);
		self.html="";
		if (isDefined(sText)){
			self.html=sText;
		}
		log("PUSH HTMLBuffer new length:"+indStack);
		return indStack;
	}
	popHtmlBuffer(fromIndex){
		var self=this;
		var html=self.html;
		var newInd=self.htmlStack.length()-1;
		if (isDefined(fromIndex)){
			newInd=fromIndex;
		}
		if (newInd==self.htmlStack.length()){
			log("HTMLBuffer error popping a html buffer");
		}
		while (self.htmlStack.length()>(newInd+1)){
			html=self.htmlStack.pop()+html;
		}
		self.html=self.htmlStack.pop();
		log("Stack Length after pop("+fromIndex+"):"+self.htmlStack.length()+" == "+fromIndex);
		log("POP HTMLBuffer new length:"+self.htmlStack.length());
		return html;
	}
	addHtml(sText){
		var self=this;
		if ((isDefined(sText)) && (sText!=null)){
			try {
				log("<html>"+(""+sText).substring(0,150)+"...</html>");
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
	changeBrackets(sText){
		var sResult=replaceAll(sText,"{{{","{ { {");
		sResult=replaceAll(sResult,"}}}","} } }");
		sResult=replaceAll(sResult,"{{","{ {");
		sResult=replaceAll(sResult,"}}","} }");
		return sResult;
	}
	applyTag(tag,reportElem){
		var self=this;
		var htmlBufferIndex=self.pushHtmlBuffer();
		self.addHtml("<!-- " + self.changeBrackets(tag.getTagText())+" -->");
		self.addHtml("<!-- " + self.changeBrackets(self.traceTag(tag))+ " -->");
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
		} else if (tagAttrs.exists("debug")){
			sTokenName="jrfDebug";
		} else {
			sTokenName="jrfNoop";
		}
		tagApplier=new window[sTokenName](tag,reportElem,self);
		self.addStep("Encoding the tag...",function(){
			tagApplier.encode(); // it has steps... into
		});
/*		self.addStep("Returning the html",function(){
			var sHtmlResult=self.popHtmlBuffer();
			self.addHtml(sHtmlResult);
			self.continueTask();
		});
*/		self.continueTask();
	}
	encode(parentTag,reportElement){
		var self=this;
		var htmlBufferIndex=self.pushHtmlBuffer();
		var reportElem=reportElement;
		if (isUndefined(reportElem)){
			reportElem=self.report;
		}
		self.addStep("Applying tag recursively....",function(){
			self.applyTag(parentTag,reportElem);
		});
/*		self.addStep("Returning the html",function(){
			var sHtml=self.popHtmlBuffer(htmlBufferIndex);
			self.addHtml(sHtml);
			self.continueTask();
		});
*/		self.continueTask();
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
		var htmlBufferIndex;
		self.addStep("Parsing Model",function(){
			self.parse(sModel,rootJRF);
			self.continueTask();
		});
		self.addStep("Encoding model with Jira Info",function(){
			htmlBufferIndex=self.pushHtmlBuffer();
			self.encode(rootJRF);
		});
		self.addStep("Returning last HTML to process caller",function(){
//			log(sHtml);
			var sHtml=self.popHtmlBuffer(htmlBufferIndex);
			if ((self.html.length>0)||(self.htmlStack.length()>0)){
				log("There si more html in the buffer.... Maybe someone has push hmtl without pop");
			}
			self.continueTask([sHtml]);
		});
		self.continueTask();
	}
}