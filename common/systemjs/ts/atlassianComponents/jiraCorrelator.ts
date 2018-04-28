import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jiraCorrelator',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraCorrelator.html'),
})
export class jiraCorrelator {
    @Input() name: string = 'jiraCorrelator';
    @Input() caption: string = 'Child Relations';
    addField(){
        log("adding Field hierarchy");
    }
    addLink(){
        log("adding Link hierarchy");
    }
    textAreaChanged(){
        log("TextArea Changed")
    }
}