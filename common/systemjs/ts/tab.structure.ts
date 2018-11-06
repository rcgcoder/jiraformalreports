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
    allIssues: object;
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
        var fork=self.addStep("Testing Load Issues:"+self.name, function(){
            log("Testing end:"+self.name);
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
//        self.continueTask();
        
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
            self.addStep("Refresh de Commit Id for update de report class", function(){
                var antCommitId=System.webapp.github.commitId;
                System.webapp.pushCallback(function(){
                   log("commit updated");
                   if (antCommitId!=System.webapp.github.commitId){
                       bDontReload=false;
                   }
                   self.continueTask();
                });
                System.webapp.github.updateLastCommit();
            });
            self.addStep("Dynamic load de report class", function(){
                if (bForceReloadFiles) bDontReload=false; 
                if (bDontReload){
                    self.continueTask();
                } else {
                    var arrFiles=[                  
                                 "js/jrfReport.js"
                                 ]; //test
                    System.webapp.loadRemoteFiles(arrFiles);
                }
            });
            self.addStep("Executing Report", function(){
                var theConfig=System.getAngularObject('tabConfig',true).getActualReportConfig();
                var auxObj=System.getAngularObject('selInterestFields',true);
                theConfig["allFields"]=auxObj.getAllElements();
                var theReport=new jrfReport(theConfig);
                if (theConfig.reuseIssues){
                    theReport.allIssues=self.allIssues;
                    theReport.reuseAllIssues=true;
                }
                self.report=theReport;
                System.webapp.theReport=theReport;
                theReport.execute(bDontReload);
            });
            self.addStep("Save result to file", function(){
                if (bSaveToFile){
                    saveDataToFile(self.report.result,"result.html","text/html");
                }
                self.continueTask();
            });
            self.addStep("Save issueList for next run", function(){
                if (self.report.config.reuseIssues){
                    self.allIssues=self.report.allIssues;
                }
                self.continueTask();
            });
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
    freeMemory(){
        var self=this;
        var jqResult=$("#ReportResult");
        jqResult.html("");
        if (isDefined(self.report)){
            if (!self.report.isReusingIssueList()){
                self.report.allIssues=undefined; // unassing allIssues.... to free memory
                self.report.childs.clear();
                self.report.advanceChilds.clear();
                self.report.rootElements.clear();
                self.report.rootIssues.clear();
                self.report.rootProjects.clear();
            }
            self.report.rootIssues.clear();
            self.report=undefined;
            
        }
        if (isDefined(self.allIssues)){
            self.allIssues=undefined;
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