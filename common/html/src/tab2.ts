import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab2',
  styles: [`
    .pane{
      padding: 1em;
    }
  `],
  template: `
    <div [hidden]="!active" class="pane">
      <ng-content>aaaaa</ng-content>
    </div>
  `
})
export class Tab2 {
  @Input('tabTitle') title: string;
  @Input() active = false;
}