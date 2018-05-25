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
            System.webapp.getTaskManager().extendObject(self);
        });
    }
    
    saveDocx(){
        var self=this;
        self.addStep("Saving to docx file.... ",function(){
            // download the docxtemplater.js
            self.addStep("Loading docx templater engine.... ",function(){
                var arrFiles=[  //"ts/demo.ts",
                                "js/libs/docxtemplater.v3.6.3.js"
                                ]; //test
                System.webapp.loadRemoteFiles(arrFiles);
            });
            
            // download the docx template
            self.addStep("Downloading Template",function(){
               System.webapp.loadRemoteFile("docx/html.docx"); 
            });
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        // apply
    }
}