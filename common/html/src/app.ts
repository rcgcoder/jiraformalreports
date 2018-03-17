//our root app component
import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {Tabs} from './tabs';
import {Tab} from './tab';
import {Tab2} from './tab2';

@Component({
  selector: 'my-app',
  template: `
    <tabs>
      <tab [tabTitle]="'Tab 1'">Tab 1 Content</tab>
      <tab2 tabTitle="Tab 2">Tab 2 Content</tab2>
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
  declarations: [ App, Tabs, Tab, Tab2 ],
  bootstrap: [ App ]
})
export class AppModule {}