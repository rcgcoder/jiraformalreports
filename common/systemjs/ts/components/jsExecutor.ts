import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'jsExecutor',
  templateUrl: System.composeUrl('systemjs/html/components/jsExecutor.html'),
})
export class jsExecutor {
    @Input() name: string = 'jsExecutor';
    editor:object;
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
        var theTextArea=System.getAngularDomObject(self.name+"-code")[0];
        var code=`"";
                 log("executing");
                 `+theTextArea.value+`
                 log("executed");
                 `;
        self.addStep("Executing text area code.... ",function(){
            log("executing the code:"+code);
            executeFunction([],code);
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        // apply
    }
}