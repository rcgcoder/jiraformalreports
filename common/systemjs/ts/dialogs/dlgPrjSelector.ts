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
    @Output() onRetrieveAllProjects = new EventEmitter<{}>();
    @Output() onRetrievePreviousSelectedProjects = new EventEmitter<{}>();
    getDialog(){
        return AJS.dialog2("#"+"dlg_"+this.name);
    }
    populateAllProjects(arrProjects){
        log("Populating table");
    }
    selectProjects(arrProjects){
        log("Selecting previous projects");
    }
    doShowDialog(){
        var self=this;
        log("it´s clicked show button");
        var arrValues=[];
        self.onRetrieveAllProjects.emit(self);
        self.onRetrievePreviousSelectedProjects.emit(self);
        log("Showind the dialog");
        self.getDialog().show();
    }
    doAction(){
        log("It´s Clicked do action");
        this.getDialog().hide();
        this.onSelected.emit(["A","B","C"]);
        log("Emmited event");
    }
    doCancel(){
        log("It´s Clicked do cancel");
    }
    
    get selected():[]{return ["a","b","c"];
        
    }
    @Input() name: string = 'dlgProjectSelector';
    @Input() obtainData: string ='';
    @Input() footer: string = 'this is footer';
}