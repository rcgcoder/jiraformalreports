import { Component, Input } from '@angular/core';
import { TabReports } from './tab.reports';

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
    <ng-content select="[tab-reports]"></ng-content>
    </div>
  `
})
export class Tab {
  @Input('tabTitle') title: string;
  @Input('tabType') type: string;
  @Input() active = false;
}