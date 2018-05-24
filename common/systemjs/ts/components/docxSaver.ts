import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'docxSaver',
  templateUrl: System.composeUrl('systemjs/html/components/docxSaver.html'),
})
export class docxSaver {
    @Input() name: string = 'advSelection';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
        });
    }
    saveDocx(){
        log("Saving to file");
    }
}