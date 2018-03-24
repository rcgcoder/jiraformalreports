import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html'),
})

export class TabReports {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    addNewItem=function (){
        console.log("appending li to ul");
        $("#ulDwarfers").append('<li><a href="#">Menu item Dyn</a></li>');
    }
}