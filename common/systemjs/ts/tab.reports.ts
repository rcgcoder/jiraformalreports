import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html'),
})

export class TabReports {
    constructor(){
        log("TabReports constructor called");
    }
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}