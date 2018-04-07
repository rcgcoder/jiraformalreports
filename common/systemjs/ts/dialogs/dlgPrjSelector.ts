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
    getDialog(){
        return AJS.dialog2("#"+"dlg_"+this.name);
    }
    doShowDialog(){
        log("it´s clicked show button");
        this.getDialog().show();
    }
    doAction(){
        log("It´s Clicked do action");
        this.getDialog().hide();
        this.onSelected.emit(["A","B","C"]);
    }
    doCancel(){
        log("It´s Clicked do cancel");
    }
    
    get selected():[]{return ["a","b","c"];
        
    }
    @Input() name: string = 'dlgProjectSelector';   
    @Input() footer: string = 'this is footer';
}