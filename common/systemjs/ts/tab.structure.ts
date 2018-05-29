import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
    configurations: array;
    configurationIssue: object;
    report: object;
    allIssues: object;
    setConfiguration(issue,arrConfigurations){
        var self=this;
        self.configurationIssue=issue;
        self.configurations=arrConfigurations;
        self.configurations.sort(function(a,b){
            if (a.timestamp<b.timestamp){
               return 1;
            } else if (a.timestamp>b.timestamp){
               return -1;
            } 
            return 0;
        })
        var reportIssueInfo=System.getAngularDomObject(self.name+"_reportIssue");
        reportIssueInfo.html(self.configurationIssue.key +" - "+  self.configurationIssue.fields.summary);
        var selConfs=System.getAngularObject("selConfigurations",true);
        var arrOptions=[];
        self.configurations.forEach(function(conf){
            arrOptions.push({key:conf.timestamp,name:"Configuration "+arrOptions.length+" "+conf.date,description:conf.comment});
        });
        selConfs.fillOptions(arrOptions);
        var tabs=System.Tabs_appMain;
        tabs.selectTabByTitle("Structure");
    }
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
    onChangeIssueLinkTypesConfiguration(arrTypes){
        var self=this;
        log("applying issue link types conf:"+arrTypes.length);
        System.webapp.setIssueLinkTypes(arrTypes); 
        System.getAngularObject('selInterestIssueLinkTypes',true).reloadItems();
        System.getAngularObject("tabConfig",true).updateCorrelators();
    }
    onChangeManualIssueFieldDefinitions(arrFields){
        var self=this;
        log("applying custom field manual definitions");
        var auxObj=System.getAngularObject('manualFieldDefinitions',true);
        var values=auxObj.getElements();
        var bKeyExists=false;
        values.forEach(function(value){
            if (value[0]=="Key"){
                bKeyExists=true;
            }
        });
        if (!bKeyExists){
            values.unshift(["Key","Issue Key"]);
        }
        System.webapp.setIssueOtherFields(values); 
        auxObj.setElements(values);
        System.getAngularObject("tabConfig",true).updateCorrelators();
    }
    executeReport(){
        var self=this;
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
                var theConfig=self.getActualReportConfig();
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
    getScopeNormalizedJQL(){
        log("getting the list of issues in the Scope.....");
        var auxObj=System.getAngularObject('selScope',true);
        var jql=auxObj.getJQLValue();
        var arrValues=auxObj.getSelectedValues();
        if ((arrValues.length==0)&&(jql!="")){
            return jql;
        } else if ((arrValues.length==0)&&(jql=="")){
            return "";
        } else {
            var sIssues="";
            for (var i=0;i<arrValues.length;i++){
                if (i<0){
                   sIssues+=",";
                }
                sIssues+=arrValues[i].key;
            }
            return "id in ("+sIssues+")";
        }
    }
    onGetFullListOfFields($event){
        log("getting the total list of fields.....");
        var self=this;
        var jira=System.webapp.getJira();
        var hsAllFields;
        self.addStep("Getting all field names from scope issues",function(){
            var jql=self.getScopeNormalizedJQL();
            log("Scope Normalized jql:["+jql+"]");
            jira.getFieldFullList(jql);
        });
        self.addStep("Getting all field names of the list",function(hsFields){
            var intFields=System.getAngularObject('selInterestFields',true);
            hsAllFields=hsFields;
            var arrAllFields=intFields.getAllElements();
            var hsIdentified=newHashMap();
            var hsResultFields=newHashMap();
            log("There is "+ hsFields.length()+" fields in all issues");
            for (var i=0;i<arrAllFields.length;i++){
                hsIdentified.add(arrAllFields[i].key,arrAllFields[i]);
            }
                
            var fncProcessNode=System.webapp.createManagedCallback(function(objStep){
                var objStepKey=objStep.actualNode.key;
                if (!hsIdentified.exists(objStepKey)){
                    hsResultFields.add(objStepKey,objStepKey);
                }
            });
            var fncProcessEnd=System.webapp.createManagedCallback(function(objStep){
                var objStepEnd=objStep;
                self.continueTask([hsResultFields]);
            });
            var fncBlockPercent=System.webapp.createManagedCallback(function(objStep){
                var objStepEnd=objStep;
                log("Block Percent");
            });
            var fncBlockTime=System.webapp.createManagedCallback(function(objStep){
                var objStepEnd=objStep;
                log("Block Time");
            });
            hsFields.walkAsync("Removing duplicate fields...",fncProcessNode,fncProcessEnd,fncBlockPercent,fncBlockTime);
        });
        self.addStep("Update selection table",function(hsResultFields){
            log("After discard identificied there is "+ hsResultFields.length()+"/"+hsAllFields.length()+" fields in all issues");
            var fieldDefs=System.getAngularObject('manualFieldDefinitions',true);
            var arrResultElements=[];
            var fncToItem=function(elem){
                arrResultElements.push([elem,elem]);
            }
            hsResultFields.walk(fncToItem);
            fieldDefs.setElements(arrResultElements);
            self.continueTask();
                
        });
        self.continueTask();
    }
    onGetFullListOfIssueTypes(){
        log("getting the total list of issue link types.....");
        var self=this;
        var jira=System.webapp.getJira();
        var hsAllFields;
        self.addStep("Getting all issue link types of Scope",function(){
            var jql=self.getScopeNormalizedJQL();
            log("Scope Normalized jql:["+jql+"]");
            jira.getIssueLinkFullList(jql);
        });
        self.addStep("Update selection table",function(hsLinkTypes){
            var selLinkTypes=System.getAngularObject('linkTypesConfiguration',true);
            var arrResultElements=[];
            var fncToItem=function(elem){
                arrResultElements.push(elem);
            }
            hsLinkTypes.walk(fncToItem);
            selLinkTypes.setElements(arrResultElements);
            self.continueTask();
        });
        self.continueTask();
    }
    onChangeConfiguration(event){
        var self=this;
        log("Change configuration:"+event);
        self.configurations.forEach(function(conf){
            if (conf.timestamp==event){
                self.applyConfig(conf);
            }
        });
       
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
}