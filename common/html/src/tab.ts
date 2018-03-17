import { Component, Input } from '@angular/core';
import { TabReports } from './tab.reports';

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 1em;
    }
  `],
  templateUlr:"./ngComponents/tab.html"
})
export class Tab {
  @Input('tabTitle') title: string;
  @Input('tabType') type: string;
  @Input() active = false;
}