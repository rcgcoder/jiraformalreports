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
        var auxObj=System.getAngularObject(self.name+'-editor',true);
        var theScript=auxObj.getValue();

        var code=`"";
                 log("executing");
                 `+theScript+`
                 log("executed");
                 `;
        self.addStep("Executing text area code.... ",function(){
            log("executing the code:"+code);
            var mnCall=self.createManagedCallback(function(){
                executeFunction([],code);
            });
            mnCall();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        // apply
    }
}