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
    elements: [] = [];
    getSelect(){
        return AJS.$('[name="'+this.name+'-select"]');
    }
    getDialogObj(){
        var objDlg=System.getAngularObject('dlgSelectionTable[ng-reflect-name="'+this.name+'-SelTable"]');
        return objDlg;
    }
    setDialogWaiting(bWaiting){
        var objDlg=this.getDialogObj();
        objDlg.setWaiting(bWaiting);
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            var theSelect=self.getSelect();
            if (self.multiple.toUpperCase()=="TRUE"){
                theSelect.attr("multiple",self.multiple);
            }
            theSelect.auiSelect2();
            System.bindObj(self);
            self.onRetrieveTableData();
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
    onSelected(selectedKeys: []) {
        log("Processing selection event");
        var theSelect=this.getSelect();
        theSelect.val(selectedKeys);
        theSelect.trigger('change'); // Notify any JS components that the value changed
    }
        
    onRetrieveTableData(theDlgSelector){
        var self=this;
        System.webapp.addStep("Getting options", function(){
            if (self.onRetrieveData.observers.length>0){
                self.onRetrieveData.emit(self);
            } else {
                System.webapp.continueTask([]);
            }
        });
        System.webapp.addStep("Retrieving options once they are loaded",
            function(optionList){
                log(optionList.length);
                var options=[];
                for (var i=0;i<issueList.length;i++){
                    var issue=issueList[i];
                    options.push({key:issue.key,name:issue.fields.summary,description:issue.fields.summary});
                }
                self.fillOptions(options);
                System.webapp.continueTask();
            });
        System.webapp.addStep("Populating the table",function(){
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
                    theDlgSelector.endPopulate();
                }
                System.webapp.continueTask();
            });
        System.webapp.continueTask();
    }
}