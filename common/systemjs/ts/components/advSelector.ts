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
        var self=this;
        System.addPostProcess(function(){
            var elem=AJS.$('[name="'+self.name+'"]');
            elem[0].angObject=self;
            self.getSelect().auiSelect2();
            
       });
    }
    fillOptions(arrOptions){
        var objSelector=AJS.$('[name="'+this.name+'-select"]');
        for (var i=0;i<arrOptions.length;i++){
            var opt=arrOptions[i];
            objSelector.append('<option value="'+opt.key+'">'+opt.name+'</option>');
        }
    }
    onSelected(selectedKeys: []) {
        log("Processing selection event");
        var theSelect=this.getSelect();
        theSelect.val(selectedKeys);
        theSelect.trigger('change'); // Notify any JS components that the value changed
    }
        
    onRetrieveTableData(theDlgSelector){
        var theAdvSelector=AJS.$('[name="'+this.name+'"]');
        var jqAdvSelector=$(theAdvSelector[0]);
        var scp=jqAdvSelector.scope();
        var theSelect=this.getSelect();
        var nOps=theSelect[0].length;
        var arrTable=[];
        for (var i=0;i<nOps;i++){
            var opt=theSelect[0][i];
            var key=opt.value;
            var name=opt.text;
            arrTable.push({key:key,name:name});
        }
        theDlgSelector.populateTable(arrTable);
    }
    onRetrievePreviousSelectedKeys(theDlgSelector){
        log("do nothing");
    }
}