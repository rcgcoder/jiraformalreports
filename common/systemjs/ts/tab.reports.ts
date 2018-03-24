import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html'),
})
var addNewItem=function (){
    console.log("appending li to ul");
    $("#ulDwarfers").append('<li><a href="#">Menu item Dyn</a></li>');
}
setTimeout(addNewItem,5000);

export class TabReports {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}