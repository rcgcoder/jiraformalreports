import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jsExecutor',
  templateUrl: System.composeUrl('systemjs/html/components/jsExecutor.html'),
})
export class jsExecutor {
    @Input() name: string = 'jsExecutor';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            System.webapp.getTaskManager().extendObject(self);
        });
    }
    
    execute(){
        var self=this;
        var theTextArea=System.getAngularDomObject(self.name+"-code");
        self.addStep("Saving to docx file.... ",function(){
            log("excuting the text area:"+theTextArea.value);
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        // apply
    }
}