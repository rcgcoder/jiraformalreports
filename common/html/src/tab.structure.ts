import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: 'html/ngComponents/tab.structure.html',
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}