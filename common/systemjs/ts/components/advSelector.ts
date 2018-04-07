import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'advSelector',
  templateUrl: System.composeUrl('systemjs/html/components/advSelector.html'),
})
export class advSelector {
    @Input() name: string = 'advSelection';
    @Input() typeDescriptor: string = 'elements';
    
    getSelect(){
        return AJS.$('[name="'+this.name+'-select"]');
    }
    constructor(){
        System.addPostProcess(function(){
            this.getSelect().auiSelect2();
       });
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
            arrTable.push({key:key,name:name});
        }
        theDlgPrjSelector.populateTable(arrTable);
    }
    onRetrievePreviousSelectedKeys(theDlgPrjSelector){
        log("do nothing");
    }
}