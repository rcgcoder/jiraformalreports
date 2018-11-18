import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
    report: object;
//    allIssues: object;
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
            System.webapp.getTaskManager().extendObject(self);
            var toggle = $('#toggle_DebugLogs');
            toggle.change(function(e) {
                var bWithLog=(toggle.attr("checked")=="checked");
                loggerFactory.getLogger().enabled=bWithLog;
            });
            var toggle = $('#toggle_HTMLDebugLogs');
            toggle.change(function(e) {
                if (isDefined(self.report)){
                    var bWithHtmlLog=(toggle.attr("checked")=="checked");
                    self.report.config.htmlDebug=bWithHtmlLog;
                }
            });
            var toggle = $('#toggle_ReuseLoadedIssues');
            toggle.change(function(e) {
                if (isDefined(self.report)){
                    var bReuseIssues=(toggle.attr("checked")=="checked");
                    self.report.config.reuseIssues=bReuseIssues;
                }
            });
            flatpickr("#ReportInitDate", {
                enableTime: true,
                dateFormat: "d/m/Y H:i",
            });
            flatpickr("#ReportEndDate", {
                enableTime: true,
                dateFormat: "d/m/Y H:i",
            });
            flatpickr("#ContractInitDate", {
                enableTime: true,
                dateFormat: "d/m/Y H:i",
            });
            flatpickr("#ContractEndDate", {
                enableTime: true,
                dateFormat: "d/m/Y H:i",
            });
            flatpickr("#ContractAdvancedDate", {
                enableTime: true,
                dateFormat: "d/m/Y H:i",
            });
            
        });
    }
 
    onGetBillingRelationships(event){
        log("GettingRelationships");
        return System.webapp.getListRelations();
    }
    onGetBillingFields(event){
       log("structure fields event.... onGetBillingFields");
       return System.webapp.getListFields();
    }
    onLoadIssuesTest(event){
        var self=this;
        /*
        self.addStep("Testing Load Issues:"+self.name, function(){
            log("Testing end:"+self.name);
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
*/
    }
    executeReport(){
        var self=this;
        var auxObj=$('#toggle_ForceReloadFiles');
        var bForceReloadFiles=(auxObj.attr("checked")=="checked");
        var auxObj=$('#toggle_ForceReloadFiles');
        var bForceReloadFiles=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_SaveResult');
        var bSaveToFile=(auxObj.attr("checked")=="checked");


        self.addStep("Updating and processing report...", function(){
            var bDontReload=isDefined(window.jrfReport);
            if (System.webapp.github!=""){
                self.addStep("Refresh de Commit Id for update de report class", function(){
                    var antCommitId=System.webapp.github.commitId;
                    self.addStep("Update last Commit info",function(){
                        return System.webapp.github.updateLastCommit();
                    });
                    self.addStep("Analyze commit id",function(){
                       log("commit updated");
                       if (antCommitId!=System.webapp.github.commitId){
                           bDontReload=false;
                       }
                    });
                });
            }
            self.addStep("Dynamic load de report class", function(){
                if (bForceReloadFiles) bDontReload=false; 
                if (bDontReload){
                    return;
                } else {
                    var arrFiles=[                  
                                 "js/jrfReport.js"
                                 ]; //test
                    return System.webapp.loadRemoteFiles(arrFiles);
                }
            });
            self.addStep("Executing Report", function(){
                var theConfig=System.getAngularObject('tabConfig',true).getActualReportConfig();
                var auxObj=System.getAngularObject('selInterestFields',true);
                theConfig["allFields"]=auxObj.getAllElements();
                var theReport=new jrfReport(theConfig);
/*                if (theConfig.reuseIssues){ 
                    theReport.allIssues=self.allIssues;
                    theReport.reuseAllIssues=true;
                }
*/
                self.report=theReport;
                System.webapp.theReport=theReport;
                debugger;
                return theReport.execute(bDontReload);
            });
            self.addStep("Save result to file", function(){
                if (bSaveToFile){
                    return saveDataToFile(self.report.result,"result.html","text/html");
                }
            });
/*            self.addStep("Save issueList for next run", function(){
                if (self.report.config.reuseIssues){
                    self.allIssues=self.report.allIssues;
                }
            });
*/        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
    freeMemory(){
        var self=this;
        var frame = document.getElementById("ReportResult"),
        frameDoc = frame.contentDocument || frame.contentWindow.document;
        frameDoc.documentElement.innerHTML = "";
        if (isDefined(self.report)&&(self.report!=="")){
            self.report.freeMemory();
            self.report="";
        }
        if (isDefined(window.gc)){
            window.gc();
        }
    }
    killTasks(){
        var self=this;
        var tm=self.getTaskManager();
        tm.killTasks();
        var auxObj=$('#toggle_ForceReloadFiles');
        auxObj.attr("checked","checked");
        setTimeout(function(){tm.killTasks()},1000);

    }
    doEditSelectedModel(){
        var win = window.open("js/libs/contentEditor/index.html", '_blank');
        win.focus();
        win.addEventListener('load', function(){
            log("Window Loaded");
            //win.document.body.innerHTML = "<html><header></header><body>Test editor loaded</body></html>";
        }, true);
    }
}