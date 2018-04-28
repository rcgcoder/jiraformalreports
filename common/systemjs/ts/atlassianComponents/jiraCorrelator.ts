import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jiraCorrelator',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraCorrelator.html'),
})
export class jiraCorrelator {
    @Input() name: string = 'jiraCorrelator';
    @Input() caption: string = 'Child Relations';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            self.changeVisibilityAndOr();
        });
    }
    
    addField(){
        log("adding Field hierarchy");
    }
    addLink(){
        log("adding Link hierarchy");
    }
    changeVisibilityAndOr(){
        var self=this;
        var txtArea=System.getAngularDomObject(self.name+"-text");
        txtArea=$(txtArea);
        if (txtArea.val()!=""){
            $(System.getAngularDomObject(self.name+"-addOrField")).show();
            $(System.getAngularDomObject(self.name+"-addOrLink")).show();
        } else {
            $(System.getAngularDomObject(self.name+"-addOrField")).hide();
            $(System.getAngularDomObject(self.name+"-addOrLink")).hide();
        }
        
    }
    textAreaChanged(event){
        log("TextArea Changed")
        this.changeVisibilityAndOr();
    }
}