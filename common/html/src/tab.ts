import { Component, Input } from '@angular/core';

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 1em;
    }
  `],
  template: `
    <div [hidden]="!active" class="pane">
    {{type}}
    <ng-content select="[type=Structure]"></ng-content>
    </div>
  `
})
export class Tab {
  @Input('tabTitle') title: string;
  @Input('tabType') type: string;
  @Input() active = false;
}