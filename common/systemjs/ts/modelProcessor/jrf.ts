import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'jrf',
  templateUrl: System.composeUrl('systemjs/html/modelProcessor/jrf.html'),
})
export class jrf {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}