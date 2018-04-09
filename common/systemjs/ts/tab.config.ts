import { Component, Input, Output } from '@angular/core';
import { nearley } from 'nearley'
@Component({
  selector: 'tabConfig',
  templateUrl: System.composeUrl('systemjs/html/tab.config.html'),
})
export class TabConfig {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}