import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
/*    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
        });
    }
*/    getBillingFieldSelect(){
        var selAux=AJS.$('#selBillingField');
        return selAux;
    }
    fillBillingFields(arrOps){
        var selAux=this.getBillingFieldSelect();
        for (var i=0;i<arrOps.length;i++){
            var op=arrOps[i];
            selAux.append('<option value="'+op.key+'">'+op.name+'</option>');
        }
    }
    onGetBillingFields(event){
        log("structure fields event.... onGetBillingFields");
        System.webapp.continueTask();
    }
}