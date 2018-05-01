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
    initialized: boolean = false;
    elements: [] = [];
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
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            var theSelect=self.getSelect();
            if (self.multiple.toUpperCase()=="TRUE"){
                theSelect.attr("multiple",self.multiple);
            }
            theSelect.auiSelect2();
            log("Default...onRetrieveTableData:"+self.name);
            self.onRetrieveTableData();
            log("called onRetrieveTableData:"+self.name);
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
        var theSelect=this.getSelect();
        theSelect.val(arrAux);
        theSelect.trigger('change'); // Notify any JS components that the value changed
    }
    onSelected(selectedKeys: []) {
        log("Processing selection event");
        var self=this;
        self.setSelectedValues(selectedKeys);
    }
    isSomeOneObserving(){
        var self=this;
        log("Observers retrieve:"+self.onRetrieveData.observers.length);
        return (self.onRetrieveData.observers.length>0);
    }
    isSomeOneObservingFinish(){
        var self=this;
        log("Observers retrieve finish:"+self.onFinishedRetrieveData.observers.length);
        return (self.onFinishedRetrieveData.observers.length>0);
    }
    
    getValuesAsync(theDlgSelector){
        var self=this;
        log("Running getValuesAsync of "+self.name);
        if (self.isSomeOneObserving()){
            System.webapp.addStep("Getting Async options for "+self.name, function(){
                log("onRetrieveData to emit:"+self.name);
                self.onRetrieveData.emit(self);
                log("onRetrieveData emitted:"+self.name);
            });
            System.webapp.addStep("Retrieving options once they are loaded for "+self.name,
                function(optionList){
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
                        System.webapp.continueTask([optionList]);
                    } else {
                        var nSeconds=(Math.random()*2000)+3000;
                        log("The onRetrieveData function of "+ self.name+" returns undefined.... trying again in "+nSeconds+" millis");
                        setTimeout(System.webapp.createManagedCallback(function(){
                            System.webapp.addStep("Getting values of "+ self.name+" again...", function(){
                                self.getValuesAsync(theDlgSelector);
                            });
                            System.webapp.continueTask();
                        }),nSeconds);
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
                self.onFinishedRetrieveData.emit(self);
                System.webapp.continueTask();
            });
        System.webapp.continueTask();
    }
        
    onRetrieveTableData(theDlgSelector){
        var self=this;
        log("Event onRetrieveTableData:"+self.name);
        var barrierAux;
        if (self.initialized==false){
           barrierAux=System.webapp.initializationBarrier;
        }
        var fork=System.webapp.addStep("Getting values:"+self.name, function(){
            log("processing step Getting Values(get values async):"+self.name);
            self.getValuesAsync(theDlgSelector);
            log("launched get values async:"+self.name);
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",barrierAux);
//        System.webapp.continueTask();
    }
}