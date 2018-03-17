import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabReports',
  templateUrl: 'tab.reports.html',
})
export class CardComponent {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}