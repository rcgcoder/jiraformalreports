//our root app component
import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {Tabs} from './tabs';
import {Tab} from './tab';
import {Tab} from './tab2';

@Component({
  selector: 'my-app',
  template: `
    <tabs>
      <tab [tabTitle]="'Tab 1'">Tab 1 Content</tab>
      <tab2 tabTitle="Tab 2">Tab 2 Content</tab>
    </tabs>
  `
})
class App {
  constructor() {
    this.name = 'Angular2'
  }
}

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ App, Tabs, Tab ],
  bootstrap: [ App ]
})
export class AppModule {}