import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgPrjSelector',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgPrjSelector.html'),
})
export class dlgPrjSelector {
    constructor(){
        System.addPostProcess(function(){
             // Shows the dialog when the "Show dialog" button is clicked
/*             AJS.$("#dlgProjectSelector-show").click(function(e) {
                 e.preventDefault();
                 AJS.dialog2("#dlgProjectSelector").show();
             });
 */            // Hides the dialog
/*             AJS.$("#dlgProjectSelector-action").click(function (e) {
                 e.preventDefault();
                 AJS.dialog2("#dlgProjectSelector").hide();
             });
 */       });
    }
    @Output() onSelected = new EventEmitter<[]>();    
    doShowDialog(){
        log("it´s clicked show button");
        AJS.dialog2("#dlgProjectSelector").show();
    }
    doAction(){
        log("It´s Clicked do action");
        AJS.dialog2("#dlgProjectSelector").hide();
        this.onSelected.emit(["A","B","C"]);
    }
    doCancel(){
        log("It´s Clicked do cancel");
    }
    
    get selected():[]{return ["a","b","c"];
        
    }
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}