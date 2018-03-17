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
      <tab [tabTitle]="'Reports'">Reports</tab>
      <tab tabTitle="Config">R. Config</tab>
      <tab tabTitle="Structure">R. Structure</tab>
      <tab tabTitle="Result">R. Result</tab>
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