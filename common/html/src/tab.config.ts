import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabConfig',
  templateUrl: './ngComponents/tab.config.html',
})
export class TabConfig {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}