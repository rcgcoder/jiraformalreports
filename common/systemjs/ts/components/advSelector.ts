import { Component, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'advSelector',
  templateUrl: System.composeUrl('systemjs/html/components/advSelector.html'),
})
export class advSelector {
    @Input() name: string = 'advSelection';
    @Input() typeDescriptor: string = 'elements';
    @Input() openDialogCaption: string = '...';
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
        objDlg.changeWaiting(bWaiting);
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            self.getSelect().auiSelect2();
            System.bindObj(self);
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
    fillOptions(arrOptions){
        this.elements=arrOptions;
        var objSelector=this.getSelect();
        var j=0;
        while (j<objSelector.length){
                j++;
        }
        for (var i=0;i<arrOptions.length;i++){
            var opt=this.elements[i];
            var sKey=opt.key;
            var sName=opt.name;
            var sDescription=opt.description;
            if (typeof sDescription==="undefined"){
                sDescription=sName;
            }
            objSelector.append('<option value="'+sKey+'">'+sName+'</option>');
        }
    }
    onSelected(selectedKeys: []) {
        log("Processing selection event");
        var theSelect=this.getSelect();
        theSelect.val(selectedKeys);
        theSelect.trigger('change'); // Notify any JS components that the value changed
    }
        
    onRetrieveTableData(theDlgSelector){
        var theSelect=this.getSelect();
        var nOps=theSelect[0].length; 
        var arrTable=[];
        for (var i=0;i<nOps;i++){
            var opt=theSelect[0][i];
            var key=opt.value;
            var name=opt.text;
            var isSelected=opt.selected;
            var description=name;
            var bLocated=false;
            for (var j=0;(!bLocated)&&(j<this.elements.length);j++){
                var elem=this.elements[j];
                if (elem.key==key){
                    bLocated=true;
                    if (typeof elem.description!=="undefined"){
                        description=elem.description;
                    }
                }
            }
            arrTable.push({key:key,name:description,selected:isSelected});
        }
        theDlgSelector.populateTable(arrTable);
    }
    onRetrievePreviousSelectedKeys(theDlgSelector){
        log("do nothing");
    }
}