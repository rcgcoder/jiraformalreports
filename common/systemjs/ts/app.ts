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