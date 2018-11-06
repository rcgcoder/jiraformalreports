import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'advSelector',
  templateUrl: System.composeUrl('systemjs/html/components/advSelector.html'),
})
export class advSelector {
    @Input() name: string = 'advSelection';
    @Input() typeDescriptor: string = 'elements';
    @Input() multiple: string = "false";
    @Input() maxCharsInSelect: integer = 17;
    @Input() openDialogCaption: string = '...';
    @Output() onRetrieveData = new EventEmitter<{}>();
    @Output() onSelected = new EventEmitter<{}>();
    elements: [] = [];
    initialized: boolean = false;
    getSelect(){
        return AJS.$('[name="'+this.name+'-select"]');
    }
    getDialogObj(){
        var objDlg=System.getAngularObject(this.name+'-SelTable',true);
        return objDlg;
    }
    setDialogWaiting(bWaiting){
        var objDlg=this.getDialogObj();
        objDlg.setWaiting(bWaiting);
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing (advSelector):"+self.name);
            System.bindObj(self);
            var objSel=System.getAngularDomObject(self.name+"-tooMuch");
            objSel.hide();
            var theSelect=self.getSelect();
            if (self.multiple.toUpperCase()=="TRUE"){
                theSelect.attr("multiple",self.multiple);
            }
            theSelect.auiSelect2();
            log("Default...onRetrieveTableData:"+self.name);
            return self.onRetrieveTableData();
        });
    }
    
    testNearley(){
        var p = new nearley.Parser(arithmetic.ParserRules, arithmetic.ParserStart);
        try {
            var sFormula=(Math.random()*40)+"+"+(Math.random()*35);
            p.feed(sFormula);
            if (!p.results[0]) {
                throw new Error();
            }
            if (isNaN(p.results[0]) || p.results[0] === Infinity) {
                throw new Error();
            }
            log("Parsing: "+sFormula+" Result:<"+p.results[0].toString()+">"):
        } catch(e) {
            log("Parsing: "+sFormula+" Result:<ERROR>:<"+e.toString());
        }
    }
    getOptions(){
        return this.elements;
    }
    findElement(key,source){
        var srcAux=source;
        if (typeof srcAux==="undefined"){
            srcAux=this.elements;
        }
        var bFound=false;
        for (var j=0;(!bFound)&&(j<srcAux.length);j++){
            var elem=srcAux[j];
            if (elem.key==key){
                return elem;
                bFound=true;
            }
        }
        return "";
    }
    fillOptions(arrOptions){
        // key ---> the issue key
        // name ---> the name of the issue
        // description --> for the table
        var self=this;
        var objSelector=this.getSelect();
        var prevElements=self.elements;
        self.elements=[];
        $(objSelector).find('option').each(function(){
            if (!this.selected) {
                $(this).remove();
            } else {
                var elem=self.findElement($(this).val(),prevElements);
                if (elem!=""){
                    self.elements.push(elem);
                }
            }
        });
        for (var i=0;i<arrOptions.length;i++){
            var opt=arrOptions[i];
            var sKey=opt.key;
            var elem=self.findElement(sKey);
            if (elem==""){
                var sName=opt.name;
                var sDescription=opt.description;
                this.elements.push(opt);
                if (typeof sDescription==="undefined"){
                    sDescription=sName;
                }
                var auxName=("["+sKey+"] "+sName);
                if (auxName.length>self.maxCharsInSelect){
                    auxName=auxName.substring(0,(self.maxCharsInSelect-3))+"...";
                }
                objSelector.append('<option value="'+sKey+'">'+auxName+'</option>');
            }
        }
    }
    getSelectedValues(){
        var self=this;
        var theSelect=this.getSelect();
        var nOps=theSelect[0].length; 
        var arrResults=[];
        for (var i=0;i<nOps;i++){
            var opt=theSelect[0][i];
            var key=opt.value;
            var elem=self.findElement(key);
            if (elem==""){
                log("Error.....the "+key+" element is not exists in elements array");
            }
            var name=elem.name;
            var isSelected=opt.selected;
            if (isSelected) {
                arrResults.push({key:key,name:name});
            }
        }
        return arrResults;
    }
    updateSelected(){
        var self=this;
        var theSelect=this.getSelect();
        theSelect.val(self.valuesSelected);
        theSelect.trigger('change'); // Notify any JS components that the value changed
        var objTooMuch=System.getAngularDomObject(self.name+"-tooMuch");
        var objSel=System.getAngularDomObject("s2id_"+self.name+"-select");
        if (self.getSelectedValues().length>10){
            objTooMuch.html("<br><em>["+self.getSelectedValues().length+" items selected]</em>");
            objTooMuch.show();
            objSel.hide(); 
        } else {
            objTooMuch.hide();
            objSel.show();
        }
    }
    setSelectedValues(selectedElems: []) {
        var self=this;
        var arrAux=[];
        if (typeof selectedElems!=="undefined"){
            log("selecting "+selectedElems.length+" elements");
            arrAux=selectedElems;
            if (selectedElems.length>0){
                if (typeof selectedElems[0]!=="string"){
                    arrAux=[];
                    for (var i=0;i<selectedElems.length;i++){
                        arrAux.push(selectedElems[i].key);
                    }
                }
            }
        }
        self.valuesSelected=arrAux;
        self.updateSelected();
    }
    onSelectedEvent(selectedKeys: []) {
        log("Processing selection event");
        var self=this;
        self.setSelectedValues(selectedKeys);
        self.onSelected.emit(selectedKeys);
    }
    isSomeOneObserving(){
        var self=this;
        log("Observers retrieve:"+self.onRetrieveData.observers.length);
        return (self.onRetrieveData.observers.length>0);
    }
                
    retrieved(values){
//        debugger;
        System.webapp.addStep("Returning the value of Getting Async options for " +self.name, function(){
            return values;
        });
    }
    
    getValuesAsync(theDlgSelector){
  //      debugger;
        var self=this;
        log("Running getValuesAsync of "+self.name);
        if (self.isSomeOneObserving()){
            System.webapp.addStep("Getting Async options for "+self.name, function(){
                log("onRetrieveData to emit:"+self.name);
                var emitResult=self.onRetrieveData.emit(self);
                log("onRetrieveData emitted:"+self.name);
                //return System.webapp.waitForEvent();
            });
            System.webapp.addStep("Retrieving options once they are loaded for "+self.name,function(optionList){
                if (typeof optionList!=="undefined"){
                    log(optionList.length);
                    var options=[];
                    for (var i=0;i<optionList.length;i++){
                        var opt=optionList[i];
                        options.push({key:opt.key,
                                      name:opt.name,
                                      description:opt.description});
                    }
                    self.fillOptions(options);
                    return optionList;
                } else {
                    var nSeconds=(Math.random()*2000)+3000;
                    log("The onRetrieveData function of "+ self.name+" returns undefined.... trying again in "+nSeconds+" millis");
                    setTimeout(System.webapp.createManagedCallback(function(){
                        System.webapp.addStep("Getting values of "+ self.name+" again...", function(){
                            return self.getValuesAsync(theDlgSelector);
                        });
                    }),nSeconds);
                    return System.webapp.waitForEvent();
                }
            });
        }
        System.webapp.addStep("Populating the table of "+self.name,function(optionList){
            var theSelect=self.getSelect();
            var nOps=theSelect[0].length; 
            var arrTable=[];
            for (var i=0;i<nOps;i++){
                var opt=theSelect[0][i];
                var key=opt.value;
                var elem=self.findElement(key);
                if (elem==""){
                    log("Error.....the "+key+" element is not exists in elements array");
                }
                var name=elem.name;
                var isSelected=opt.selected;
                var description=elem.description;
                arrTable.push({key:key,name:name,description:description,selected:isSelected});
            }
            if (typeof theDlgSelector!=='undefined'){
                theDlgSelector.populateTable(arrTable);
                theDlgSelector.endPopulating();
            }
            if (!self.initialized){
               self.initialized=true;
            }
            self.updateSelected();
        });
    }
        
    onRetrieveTableData(theDlgSelector){
        var self=this;
        //debugger;
        log("Event onRetrieveTableData:"+self.name);
        var barrierAux;
        if (self.initialized==false){
           barrierAux=System.webapp.initializationBarrier;
           log(self.name+" is not initialized... geting barrier "+barrierAux.id+" to link the global thread to it");
        } else {
           log(self.name+" is initialized... running without barrier");
        }
                        
        var fork=System.webapp.addStep("Fork Getting values:"+self.name, function(){
            log("processing step Getting Values(get values async):"+self.name);
            return self.getValuesAsync(theDlgSelector);
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",barrierAux);
        //System.webapp.continueTask();
    }
    onChangeSelect(event){
        var self=this;
        log("Changed element "+event);
        self.onSelected.emit([event]);
   }
                        
}