import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
@Component({
  selector: 'docxSaver',
  templateUrl: System.composeUrl('systemjs/html/components/docxSaver.html'),
})
export class docxSaver {
    @Input() name: string = 'docxSaver';
    @Input() htmlElementId: string = 'docxSaverHtmlId';
    @Input() baseUrl: string = 'docxSaverBaseUrl';
    @Input() fileNameBase: string = 'docxSaverFileName';
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
            
            self.addStep("Refresh de Commit Id for update de dockSaver class", function(){
                var antCommitId=System.webapp.github.commitId;
                System.webapp.pushCallback(function(){
                   log("commit updated");
                   self.continueTask();
                });
                System.webapp.github.updateLastCommit();
            });
            
            self.addStep("Loading docx templater engine.... ",function(){
                var arrFiles=[  //"ts/demo.ts",
                                "js/rcglibs/RCGUploadUtils.js",
                                "js/rcglibs/RCGDownloadUtils.js",
                                "js/rcglibs/RCGDocxSaver.js"
                                ]; //test
                System.webapp.loadRemoteFiles(arrFiles);
            });
            self.addStep("Launching docx saver engine",function(){
                var vDocx=new RCGDocxSaver(self.getTaskManager(),self.htmlElementId,self.baseUrl,self.fileNameBase);
                vDocx.process();
            });
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
        // apply
    }
}