import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabResult',
  templateUrl: composeUrl('systemjs/html/tab.result.html'),
})
export class TabResult {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}