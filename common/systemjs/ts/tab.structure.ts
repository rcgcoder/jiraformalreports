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
        });
    }
 
    onGetBillingRelationships(event){
        log("GettingRelationships");
        self.continueTask([System.webapp.getListRelations()]);
    }
    onGetBillingFields(event){
       log("structure fields event.... onGetBillingFields");
       self.continueTask([System.webapp.getListFields()]);
    }
    onLoadIssuesTest(event){
        var self=this;
        var fork=self.addStep("Testing Load Issues:"+self.name, function(){
            log("Testing end:"+self.name);
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
//        self.continueTask();
        
    }
    executeReport(){
        var self=this;
        var auxObj=$('#toggle_ForceReloadFiles');
        var bForceReloadFiles=(auxObj.attr("checked")=="checked");


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
                theReport.execute(bDontReload);
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
    }
}