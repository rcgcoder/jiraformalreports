//our root app component
import {Component, NgModule, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {Tabs} from './tabs';
import {Tab} from './tab';
import {TabReports} from './tab.reports';
import {TabConfig} from './tab.config';
import {TabStructure} from './tab.structure';
import {TabResult} from './tab.result';
import {advSelector} from "./components/advSelector";
import {listEditor} from "./components/listEditor";
import {docxSaver} from "./components/docxSaver";
import {jsExecutor} from "./components/jsExecutor";
import {dlgEditableList} from "./dialogs/dlgEditableList";
import {dlgSelectionTable} from './dialogs/dlgSelectionTable';
import {jqlExtendedParser} from './components/jqlExtendedParser';
import {jqlSelector} from "./atlassianComponents/jqlSelector";
import {atlassianSelector} from "./atlassianComponents/atlassianSelector";
import {jiraCorrelator} from "./atlassianComponents/jiraCorrelator";
import {jrf} from "./modelProcessor/jrf";



@Component({
  selector: 'my-app',
  templateUrl: System.composeUrl('systemjs/html/app.html')
})
class App {

//  constructor() {
  ngOnInit() {
    this.name = 'Angular2';
    var self=this;
    var taskm=taskManager;
//    var rTask=System.systemJSTask;
    log("--- initializing class app.ts");
    taskManager.extendObject(self);
    var fncCheckForFinishLoad = function(){
        debugger;
        var theApp=$("#appMain");
//        taskm.setRunningTask(rTask);
        log("Checking if Systemjs app is loaded");
        if (theApp.length>0){
            log("App loaded!... launching systemjs initialization global thread");
            debugger;
            self.addStep("Systemjs components Initializacion",function(){
                
                log("Running global systemjs components initialization");
                self.addStep("Applying AUI and other interface components.... ",function(){
                    var arrFiles=[
                                  "js/libs/flatpickr/flatpickr.css",
                                  "js/libs/flatpickr/flatpickr.js",
                                  "aui/js/aui.js",
                                  "aui/css/aui.css",
                                  "aui/css/aui-experimental.css",
                                  "aui/js/aui-experimental.js",
                                  "aui/js/aui-datepicker.js",
                                  "aui/js/aui-soy.js"
                               ]; //test
                              System.webapp.loadRemoteFiles(arrFiles);
                });
                self.addStep("Postprocessing systemjs components.... ",function(){
/*                    var fncAddPostProcessStep=function(i){
                        self.addStep("PostProcessing..."+i+"/"+System.postProcess.length,function(){
                            System.postProcess[i]();
                            self.continueTask();
                        });
                    }   

                    self.parallelizeCalls(System.postProcess.length,undefined,fncAddPostProcessStep,5);
*/                  System.postProcess.forEach(function(postProcessFunction){
                        postProcessFunction();
                      //  fncAddPostProcessStep(i);
                    });
                    self.continueTask();
                });
                self.continueTask();
           },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        } else {
            log("App is not loaded... waiting");
            setTimeout(fncCheckForFinishLoad,1000);
        }
    };
    fncCheckForFinishLoad();
   }
}

@NgModule({
  schemas: [
            CUSTOM_ELEMENTS_SCHEMA
        ],
  imports: [ BrowserModule ],
  declarations: [   App, 
                    Tabs, 
                    Tab, 
                    TabReports, 
                    TabConfig, 
                    TabStructure, 
                    TabResult, 
                    dlgSelectionTable,
                    advSelector,
                    listEditor,
                    docxSaver,
                    jsExecutor,
                    dlgEditableList,
                    jqlExtendedParser,
                    jqlSelector,
                    atlassianSelector,
                    jiraCorrelator,
                    jrf
                ],
  bootstrap: [ App ]
})
export class AppModule {}