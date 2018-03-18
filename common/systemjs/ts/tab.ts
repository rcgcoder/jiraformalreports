import { Component, Input } from '@angular/core';
import { TabReports } from './tab.reports';
import { TabConfig } from './tab.config';
import { TabStructure } from './tab.structure';
import { TabResult } from './tab.result';

@Component({
  selector: 'tab',
  styles: [`
    .pane{
      padding: 1em;
    }
  `],
  templateUrl:System.composeUrl("systemjs/html/tab.html")
})
export class Tab {
  @Input('tabTitle') title: string;
  @Input('tabType') type: string;
  @Input() active = false;
}