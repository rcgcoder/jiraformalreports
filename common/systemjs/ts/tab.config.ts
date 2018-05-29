import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabConfig',
  templateUrl: System.composeUrl('systemjs/html/tab.config.html'),
})
export class TabConfig {
    
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    onChangeInterest(event){
        this.updateCorrelators();
    }
    updateCorrelators(){
        var arrFields=[];
        
        var auxObj=System.getAngularObject('selInterestFields',true);
        var arrValues=auxObj.getSelectedValues();
        arrFields=arrFields.concat(arrValues);
        
        auxObj=System.getAngularObject('selInterestOtherFields',true);
        arrValues=auxObj.getSelectedValues();
        arrFields=arrFields.concat(arrValues);

        auxObj=System.getAngularObject('selInterestIssueLinkTypes',true);
        var arrLinks=auxObj.getSelectedValues();
        
        System.getAngularObject('BillingHierarchy',true).fillFields(arrFields);
        System.getAngularObject('AdvanceHierarchy',true).fillFields(arrFields);
        System.getAngularObject('BillingHierarchy',true).fillLinks(arrLinks);
        System.getAngularObject('AdvanceHierarchy',true).fillLinks(arrLinks);
    }

}