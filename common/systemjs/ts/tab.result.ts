import { Component, Input, Output } from '@angular/core';
import { dlgPrjSelector } from './dialogs/dlgPrjSelector';
@Component({
  selector: 'tabResult',
  templateUrl: System.composeUrl('systemjs/html/tab.result.html'),
})
export class TabResult {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}