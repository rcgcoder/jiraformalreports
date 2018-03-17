//our root app component
import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {Tabs} from './tabs';
import {Tab} from './tab';

@Component({
  selector: 'my-app',
  template: `
    <tabs>
      <tab tabTitle="Reports" tabType="Reports">Reports</tab>
      <tab tabTitle="Config" tabType="Config">R. Config</tab>
      <tab tabTitle="Structure" tabType="Structure">R. Structure</tab>
      <tab tabTitle="Result" tabType="Result">R. Result</tab>
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