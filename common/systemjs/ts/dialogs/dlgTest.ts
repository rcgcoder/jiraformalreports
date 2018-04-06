import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'dlgTest',
  templateUrl: System.composeUrl('systemjs/html/dialogs/dlgTest.html'),
})
export class dlgTest {
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
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}