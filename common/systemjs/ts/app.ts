//our root app component
import {Component, NgModule, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
//import {util} from 'util';
//import {url} from 'url';
/*//import {querystring} from 'querystring';
/*import {punycode} from 'punycode';
import {isBuffer} from 'isBuffer';
*/
//import {crypto} from 'crypto';
//import {sha1} from 'sha1';
import {OAuth} from 'oauth';
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
//    alert("The app is initializing"):
 //   debugger;
    var self=this;
//    var taskm=taskManager;
    log("--- initializing class app.ts");
    taskManager.extendObject(self);
    var fncProcessFinishLoad=function(){
        log("App loaded!... launching systemjs initialization global thread");
        //debugger; 
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
                            //  "js/libs/oauth/oauth.js"
                           ]; //test
                return System.webapp.loadRemoteFiles(arrFiles);
            });
            self.addStep("Postprocessing systemjs components.... ",function(){
    			log("Initialize ends.. ");
                return self.parallelizeProcess(System.postProcess.length,function(iPostFunction){
                    //log("PostProcess "+iPostFunction);
                    return System.postProcess[iPostFunction]();
                });
            });
       //},0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
       });
    }

    var rTask=System.systemJSTask;
    var prevTask=self.getRunningTask();
    self.setRunningTask(rTask);
    var fncManagedProcessFinishLoad=self.createManagedCallback(fncProcessFinishLoad);
    self.setRunningTask(prevTask);
    
    var fncCheckForFinishLoad = function(){
        //debugger;
        var theApp=$("#appMain");
//        taskm.setRunningTask(rTask);
        log("Checking if Systemjs app is loaded");
        if (theApp.length>0){ 
            fncManagedProcessFinishLoad();
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
  imports: [ BrowserModule,Oauth],
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