//our root app component
import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {Tabs} from './tabs';
import {Tab} from './tab';
import {TabReports} from './tab.reports';
import {TabConfig} from './tab.config';
import {TabStructure} from './tab.structure';
import {TabResult} from './tab.result';


@Component({
  selector: 'my-app',
  templateUrl: System.composeUrl('systemjs/html/app.html')
})
class App {
  constructor() {
    this.name = 'Angular2';
    var self=this;
    var taskm=taskManager;
    var rTask=System.systemJSTask;
    log("--- initializing class app.ts");
    taskManager.extendObject(self);
    var fncCheckForFinishLoad = function(){
        var theApp=$("#appMain");
        taskm.setRunningTask(rTask);
        log("Checking if Systemjs app is loaded");
        if (theApp.length>0){
            log("App loaded!");
            self.popCallback();
        } else {
            log("App is not loaded... waiting");
            setTimeout(fncCheckForFinishLoad,1000);
        }
    };
    fncCheckForFinishLoad();
   }
}

@NgModule({
  imports: [ BrowserModule ],
  declarations: [ App, Tabs, Tab, TabReports, TabConfig, TabStructure, TabResult ],
  bootstrap: [ App ]
})
export class AppModule {}