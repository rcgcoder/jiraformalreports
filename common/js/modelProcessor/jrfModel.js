var jrfModel=class jrfModel{ //this kind of definition allows to hot-reload
	constructor(theReport,inputHtml,actualElement){
		var self=this;
		System.webapp.getTaskManager().extendObject(self);
		self.functionCache=newHashMap();
		self.actualElement=actualElement;
		self.variables=new RCGVarEngine();
		self.directives=newHashMap();
		self.accumulatorList=newHashMap();
		self.includeCache=newHashMap();
		self.filters=newRCGFilterManager();
		//self.tokenBase=new jrfToken(self);
		if (isDefined(inputHtml)){
			self.inputHtml=inputHtml;
		} else {
			self.inputHtml=theReport.config.model;
		}
		self.htmlStack=[];
		self.markdownConverter = new showdown.Converter();
		self.report=theReport;
		self.processingRoot="";
		self.rootTag="";
		
		
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
				"TagText",
				"Preprocessed"]
				//arrAttributes
				,
				[]
				//arrAttributesPercs
				/*,
				"jrfTags"*/);
	}
	extractAccumulators(sHTML){
		var self=this;
		var sTag="fieldAccum";
		var sTypes=["Childs","AdvanceChilds","("];
		if (sHTML.substring(0,sTag.length)==sTag){
			sHTML="  "+sHTML;
		}
		var arrParts=sHTML.split("fieldAccum");
		var arrParams;
		var sPart;
		var bLocated;
		var j;
		var sToken;
		var hsAccumulators=newHashMap();
		for (var i=1;i<arrParts.length;i++){
			sPart=arrParts[i];
			bLocated=false;
			j=0;
			while ((j<sTypes.length)&&(!bLocated)){
				sToken=sTypes[j];
				if (sToken==sPart.substring(0,sToken.length)){
					bLocated=true;
				} else {
					j++;
				}
			}
			if (bLocated){ // if bLocated... sToken stores the type of call.
				//sPart=self.removeInnerTags(sPart,true); // remove all html tags that confluence can be inserted
				sPart=sPart.split(")")[0]; // sParts only have the params of the function Childs(.....) or ();
				sPart=sPart.substring(sPart.indexOf("(")+1,sPart.length);// now only the inner part
				arrParams=sPart.split(","); // , separated
				var typeRelation=sToken;
				if (sToken=="("){
					// the first param is the name of list (childs,advancechilds,... another custom
					typeRelation=replaceAll(arrParams[0],'"','');
					typeRelation=replaceAll(typeRelation,"'",'').trim();
					arrParts=arrParts.shift();
				}
				var fieldName=arrParams[0]; // the field name.... 
				fieldName=replaceAll(fieldName,'"','');
				fieldName=replaceAll(fieldName,"'",'').trim();
				var sKey=typeRelation+"."+fieldName;
				var hsAux;
				if (!hsAccumulators.exists(typeRelation)){
					hsAux=newHashMap();
					hsAccumulators.add(typeRelation,hsAux);
				} else {
					hsAux=hsAccumulators.getValue(typeRelation);
				}
				if (!hsAux.exists(sKey)){
					hsAux.add(sKey,{key:sKey,type:typeRelation,field:fieldName});
				}
			}
		}
		return hsAccumulators;
	}
/*	extendToken(tagApplier,tag,reportElem){
		var self=this;
		System.webapp.getTaskManager().extendObject(tagApplier);
		self.tokenBase.extendObj(tagApplier,tag,reportElem);
	}*/
	pushHtmlBuffer(sText){
		var self=this;
		var indStack=self.htmlStack.length;
		if (isDefined(sText)){
			if (isString(sText)){
				self.htmlStack.push(sText);
			} else if (isArray(sText)){
				sText.forEach(function(sRow){
					if (sRow!="") self.pushHtmlBuffer(sRow);
				});
			}
		} 
		if (self.htmlStack.length<=indStack){
			self.htmlStack.push("");
		}
//		log("PUSH HTMLBuffer new length:"+indStack);
		return indStack;
	}
	topHtmlBuffer(fromIndex,bWithLineCount){
		var self=this;
//		var sResult="";
		var sResult=[];
		var newInd=self.htmlStack.length-1;
		if (isDefined(fromIndex)){
			if (fromIndex>=0){
				newInd=fromIndex;
			} else {
				newInd=self.htmlStack.length+fromIndex;
			}
		}
		if (self.htmlStack.length<=newInd){
			return "";
		}
		var i=newInd;
		for (var i=newInd;i<self.htmlStack.length;i++){
			if (isUndefined(bWithLineCount)|| (isDefined(bWithLineCount)&&bWithLineCount)){
				sResult.push("\n" + i +" - " + self.htmlStack[i]);
			} else {
				sResult.push(self.htmlStack[i]);
			}
		}
		return sResult;
	}
	popHtmlBuffer(fromIndex){
		var self=this;
		var htmlResult;
		var newInd=self.htmlStack.length-1;
		if (isDefined(fromIndex)){
			newInd=fromIndex;
		}
		if (newInd==self.htmlStack.length){
			log("HTMLBuffer error popping a html buffer");
		}
		htmlResult=self.htmlStack.splice(newInd);
		return htmlResult;
	}
	addHtml(sText){
		var self=this;
		if ((isDefined(sText)) && (sText!=null)){
			if (self.report.config.htmlDebug){
				try {
					log("<html>"+(""+sText).substring(0,150)+"...</html>");
				}
				catch(err) {
				    log("Mega Error");
				}
			}
			if (isArray(sText)){
				self.pushHtmlBuffer(sText);
			} else {
				self.pushHtmlBuffer("\n"+sText);
			}
		}
	}

	updateAttributes(tag){
		try {
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
		} catch(except){
			logError("The tag:"+tag.getTagText()+ "may be malformed.\n Please check the model");
			self.updateAttributes(tag);
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
	removeInnerTags(sHtml,bClear,arrReplacedTags,count){
		var sResult;
		var sResult=sHtml;
		if (isString(sHtml)) {
			sResult=[sHtml];
		}
		var sReplaceString=bClear?"":" ";
		var withArrTags=isDefined(arrReplacedTags);
		var fncReplaceByHtmlTag=function(saTagText){
			if (withArrTags) arrReplacedTags.push(saTagText);
			return sReplaceString;
		}
		var iCount=-1;
		if (isUndefined(count)){
			sResult=sResult.saReplaceInnerText("<",">",fncReplaceByHtmlTag,true,undefined,true);
		} else {
			iCount=count;
			for (var i=0;i<iCount;i++){
				sResult=sResult.saReplaceInnerText("<",">",fncReplaceByHtmlTag,false,undefined,true);
			}
		}
		return sResult;
	}
	processRecursive(arrJRFs,indexAct,parentTag,sInitialPrependText){
		var self=this;
		var auxIndex=indexAct;
		var sTagRest=sInitialPrependText;
		if (isUndefined(sTagRest)) sTagRest="";
		var sTagAttribs="";
		var indOpenTag;
		var indCloseTag;
		var indEmptyTag;
		var indWithCloseTag;
		var auxTag;
		var sTagText;
		var sNewPostText;
		
		while(auxIndex<arrJRFs.length){
			auxTag=self.tagFactory.new();
			parentTag.addChild(auxTag);
			
			var previousHtml=sTagRest;
			auxTag.setPreviousHTML(previousHtml);

			sTagText=arrJRFs[auxIndex];
			/*if (sTagText.indexOf("apt=7")>=0){
				//debugger;
			}*/
			log("JRF tag index:"+auxIndex);
			log("Row text:"+sTagText);
			sNewPostText="";
			indOpenTag=sTagText.indexOf("<");
			indCloseTag=sTagText.indexOf(">");
			indWithCloseTag=sTagText.indexOf("</JRF>");
			indEmptyTag=sTagText.indexOf("/>");
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
					auxTag.setTagText(sTagAttribs);
					self.updateAttributes(auxTag);
					
					sTagRest=sTagText.substring(indCloseTag+1,sTagText.length);

					if (indWithCloseTag<0) { // there is not a close tag...... there is more jrf tags inside actual
						var oAdvance=self.processRecursive(arrJRFs,auxIndex+1,auxTag,sTagRest); // the rest text without </jrf> if where in 
						sTagRest=oAdvance.text.saToString();
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
				logError("ERROR PARSING MODEL HTML");
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
	getTokenName(tag){
		var tagAttrs=tag.getAttributes();
		if (tag.getTagText().toLowerCase().indexOf("formula")>0){
			//debugger;
			log("Includes Formula");
		}
		var sTokenName="jrfNoop";
		if (tagAttrs.exists("foreach")){
			sTokenName="jrfForEach";
		} else if (tagAttrs.exists("export")){
			sTokenName="jrfExport";
		} else if (tagAttrs.exists("subset")){
			sTokenName="jrfSubset";
		} else if (tagAttrs.exists("stats")){
			sTokenName="jrfStatistics";
		} else if (tagAttrs.exists("formula")){
			sTokenName="jrfFormula";
		} else if (tagAttrs.exists("comment")){
			sTokenName="jrfComment";
		} else if (tagAttrs.exists("filter")){
			sTokenName="jrfFilter";
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
		} else if (tagAttrs.exists("include")){
			sTokenName="jrfInclude";
		} else if (tagAttrs.exists("directive")){
			sTokenName="jrfDirective";
//		} else if (tagAttrs.exists("if")){
//			sTokenName="jrfCondition";
		} else {
			sTokenName="jrfNoop";
		}
		return sTokenName;
	}
	prepareTag(tag,reportElem){
		var self=this;
		var sTokenName=self.getTokenName(tag);
		var tagApplier;
		tagApplier=new window[sTokenName](tag,reportElem,self);
		return tagApplier;
		
	}
	applyTag(tag,reportElem){
		var self=this;
		var htmlBufferIndex=self.pushHtmlBuffer();
		var tagApplier=self.prepareTag(tag,reportElem);
		if (tag.countParentsChild()==0){
			tagApplier.postProcess=false;
		}
		self.addStep("Encoding the tag... "+tagApplier.changeBrackets(tag.getTagText()),function(){
			tagApplier.encode(); // it has steps... into
		});
/*		self.addStep("Returning the html",function(){
			var sHtmlResult=self.popHtmlBuffer();
			self.addHtml(sHtmlResult);
		});
*/
	}
	encode(parentTag,reportElement){
		var self=this;
		var htmlBufferIndex=self.pushHtmlBuffer();
		var reportElem=reportElement;
		if (isUndefined(reportElem)){
			if (isUndefined(self.actualElement)){
				reportElem=self.report;
			} else {
				reportElem=self.actualElement;
			}
		}
		self.addStep("Applying tag recursively....",function(){
			self.applyTag(parentTag,reportElem);
		});
/*		self.addStep("Returning the html",function(){
			var sHtml=self.popHtmlBuffer(htmlBufferIndex);
			self.addHtml(sHtml);
		});
*/
	}
	parse(html,parentTag){
		var self=this;
		//debugger;
		var sModel=html;
		var arrJRFs=sModel.split("<JRF");
		if (sModel.indexOf("<JRF")==0){
			arrJRFs.unshift(""); // added a first element.....
		}
		self.addStep("Extracting tags", function(){
			var oAdvance=self.processRecursive(arrJRFs,1,parentTag,arrJRFs[0]);
			if (oAdvance.actIndex<arrJRFs.length){
				log("ERROR THERE IS NOT ALL TAG CLOSED");
			} else {
				var sTagRest=oAdvance.text;
				parentTag.setPostHTML(sTagRest);
			}
		});
		self.addStep("Processing Model Directives..", function(){
			self.processDirectiveTags();
		});
		self.addStep("Processing Includes", function(){
			self.processIncludeTags();
		});
		self.addStep("Getting accum properties of leafs", function(){
			self.preloadAccumPropertiesLeafs();
		});
	}
	preloadAccumPropertiesLeafs(){
		var self=this;
		var hsAccumulators=self.extractAccumulators(self.inputHtml);
//		var hsAccumAux=newHashMap();
		hsAccumulators.walk(function(hsAccum,iDeep,key){
			if (!self.accumulatorList.exists(key)){
				self.accumulatorList.add(key,hsAccum);
//				hsAccumAux.add(key,hsAccum);
			};
		});
		// add the accumulators identified in directives
		self.directives.walk(function(hsDirectives,iProof,sDirectiveKey){
			hsDirectives.walk(function(hsAccum,iDeep,sKey){
				log(sDirectiveKey + " directive setted:"+sKey);
				if (sDirectiveKey=="use") {
					//log("the use directive is processed by the report");
				} else if (sDirectiveKey=="accumulators"){
					//.....add(sKey,{key:sKey,type:typeRelation,field:fieldName});
					if (!self.accumulatorList.exists(sKey)){
						self.accumulatorList.add(sKey,hsAccum);
//						hsAccumAux.add(sKey,hsAccum);
					};
				}
			});
		});
	}
	processDirectiveTags(){
		var self=this;
		var hsUseDirectives;
		if (self.directives.exists("use")){
			hsUseDirectives=self.directives.getValue("use");
		} else {
			hsUseDirectives=newHashMap();
			self.directives.add("use",hsUseDirectives);
		}
		var hsAccumDirectives;
		if (self.directives.exists("accumulators")){
			hsAccumDirectives=self.directives.getValue("accumulators");
		} else {
			hsAccumDirectives=newHashMap();
			self.directives.add("accumulators",hsAccumDirectives);
		}

		self.tagFactory.list.walk(function(tag){
			if (self.getTokenName(tag)=="jrfDirective"){
				var auxTagApplier=self.prepareTag(tag);
				auxTagApplier.uses.walk(function(use){
					if (!hsUseDirectives.exists(use)){
						hsUseDirectives.add(use,use);
					}
				});
				auxTagApplier.accumulators.walk(function(accum){
					if (!hsAccumDirectives.exists(accum)){
						hsAccumDirectives.add(accum,accum);
					}
				});
			}
		});
	}
	processIncludeTags(){
		var self=this;
		self.sequentialProcess(self.tagFactory.list,function(tag){
			if (self.getTokenName(tag)=="jrfInclude"){
				if ((tag.getPreprocessed()=="")||(tag.getPreprocessed()==false)){
					log("needs preprocess");
					var auxTagApplier=self.prepareTag(tag);
					self.addStep("Processing include Tag",function(){
						return auxTagApplier.preload(tag);
					});
					self.addStep("Processing auxiliar model returned from preload",function(auxModel){
						return;
					});
				} else {
					log("do nothing");
				}
			}
		});
	}
	
	
	
	process(sPhase){
		var self=this;
		var auxPhase="all";
		if (isDefined(sPhase)||(sPhase!="")){
			auxPhase=sPhase;
		}
		if ((sPhase=="all")||(sPhase=="parse")) { 
			self.addStep("Parsing Model",function(){
				self.rootTag=self.tagFactory.new();
				self.rootTag.postProcess=false;

				self.parse(self.inputHtml,self.rootTag);
			});
		}
		if ((sPhase=="all")||(sPhase=="encode")) {
			var htmlBufferIndex;
			self.addStep("Encoding model with Jira Info",function(){
				htmlBufferIndex=self.pushHtmlBuffer();
				self.encode(self.rootTag);
			});
			self.addStep("Returning result HTML to process caller",function(){
	//			log(sHtml);
				var sHtml=self.popHtmlBuffer(htmlBufferIndex);
				return sHtml;
			});
		}
	}
	addFilter(name,sFilter){
		var self=this;
		var filters=self.filters;
		if (filters.exists(name)){
			filters.setValue(name,sFilter);
		} else {
			filters.add(name,sFilter);
		}
	}
}
