import { Component, Input, Output } from '@angular/core';
import { dlgPrjSelector } from './dialogs/dlgPrjSelector';
@Component({
  selector: 'tabResult',
  templateUrl: System.composeUrl('systemjs/html/tab.result.html'),
})
export class TabResult {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("TabResults constructor called");
            System.webapp.getTaskManager().extendObject(self);
        });
    }
    doInNewWindow(){
//        var fork=System.webapp.addStep("Opening the report in a new tab", function(){
            var report=System.webapp.theReport;
            report.openResultInNewTab();
//            System.webapp.continueTask();
 //       },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
    doSaveToFile(){
        var report=System.webapp.theReport;
        report.saveResultToFile();
    }
    doRepeatReport(){
        System.getAngularObject('tabStructure',true).executeReport();
    }
    doCleanBlankLines(){
        var self=this;
        self.addStep("Updating and processing report...", function(){
      //      System.getAngularObject('tabStructure',true).executeReport();
            var ifr=document.getElementById("reportResultDiv");
            var contentId=ifr.interactiveContentId;
            modelInteractiveFunctions.cleanContent(contentId);
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);


/*        openInWindow(thePageId,fncCallback,,"reportResultDiv");
        openInWindow(idContent,callback,iFrameId,divShellId){

        thePageId,fncCallback,"ReportResult","reportResultDiv");        
*/    }
    doDownloadAsDocx(){
        var self=this;
        self.addStep("Updating and processing report...", function(){
            self.addStep("Loading docx engine.... ",function(){
                var arrFiles=[  "js/rcglibs/RCGUploadUtils.js",
                                "js/rcglibs/RCGDownloadUtils.js"
                             ]; //test
                System.webapp.loadRemoteFiles(arrFiles);
            });
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
}