import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgPrjSelector',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgPrjSelector.html'),
})
export class dlgPrjSelector {
    constructor(){
        System.addPostProcess(function(){
             // Shows the dialog when the "Show dialog" button is clicked
             AJS.$("#dialog-show-button").click(function(e) {
                 e.preventDefault();
                 AJS.dialog2("#demo-dialog").show();
             });
             // Hides the dialog
             AJS.$("#dialog-submit-button").click(function (e) {
                 e.preventDefault();
                 AJS.dialog2("#demo-dialog").hide();
             });
        });
    }
    get selected():[]{return ["a","b","c"];
        
    }
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}