import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabReports',
  templateUrl: composeUrl('systemjs/html/tab.reports.html'),
})
export class TabReports {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}