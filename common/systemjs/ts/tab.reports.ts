import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html'),
})
function addNewItem(){
    console.log("appending li to ul");
    AJS.$("#ulDwarfers").append('<li><a href="#">Menu item Dyn</a></li>');
}
setTimeout(addNewItem,5000);

export class TabReports {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}