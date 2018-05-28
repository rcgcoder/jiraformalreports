import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
    configuration: object;
    configurationIssue: object;
    report: object;
    allIssues: object;
    setConfiguration(issue,oConfiguration){
        var self=this;
        self.configurationIssue=issue;
        self.configuration=oConfiguration;
        var tabs=window["Tabs_"+"appMain"];
        tabs.selectTab(self);
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
    saveDefaultReport(){
        var self=this;
        var actualConfig=self.getActualReportConfig();
        var fileName="defaultReportConfig.json";
        var contentType=System.webapp.getContentTypeFromExtension(fileName);
        contentType.isCacheable=true;
        var content=JSON.stringify(actualConfig);
        System.webapp.saveFileToStorage(fileName,content,contentType);
    }
    getActualReportConfig(){
        var dfReport={};
        var auxObj;
        var arrValues;
        var jql;
        var value;
        
        
        auxObj=$('#toggle_ReuseLoadedIssues');
        dfReport["reuseIssues"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_DebugLogs');
        dfReport["logDebug"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_HTMLDebugLogs');
        dfReport["logHtmlDebug"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_RootsByJQL');
        dfReport["rootsByJQL"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_RootsByProject');
        dfReport["rootsByProject"]=(auxObj.attr("checked")=="checked");
        
        auxObj=System.getAngularObject('selProjectsToReport',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["rootProjects"]=arrValues;

        auxObj=System.getAngularObject('selInterestIssueLinkTypes',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["useIssueLinkTypes"]=arrValues;
        
        auxObj=System.getAngularObject('selInterestFields',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["useFields"]=arrValues;
        
        auxObj=System.getAngularObject('selInterestOtherFields',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["useOtherFields"]=arrValues;
        
        auxObj=System.getAngularObject('selScope',true);
        jql=auxObj.getJQLValue();
        arrValues=auxObj.getSelectedValues();
        dfReport["jqlScope"]={jql:jql,values:arrValues};

        auxObj=System.getAngularObject('selIssuesToReport',true);
        jql=auxObj.getJQLValue();
        arrValues=auxObj.getSelectedValues();
        dfReport["rootIssues"]={jql:jql,values:arrValues};
        auxObj=System.getAngularObject('BillingHierarchy',true);
        value=auxObj.getValue();
        dfReport["billingHierarchy"]=value;
        auxObj=System.getAngularObject('AdvanceHierarchy',true);
        value=auxObj.getValue();
        dfReport["advanceHierarchy"]=value;
        auxObj=System.getAngularObject('linkTypesConfiguration',true);
        value=auxObj.getElements();
        dfReport["allIssueLinkTypes"]=value;

        auxObj=System.getAngularObject('manualFieldDefinitions',true);
        value=auxObj.getElements();
        dfReport["otherFieldDefinitions"]=value;

        return dfReport;
    }
    applyConfig(config){
        var self=this;
        var auxObj;

        auxObj=$('#toggle_ReuseLoadedIssues');
        if(isDefined(config.reuseIssues))auxObj.attr("checked","checked");
        auxObj=$('#toggle_RootsByJQL');
        if(isDefined(config.rootsByJQL)&&config.rootsByJQL)auxObj.attr("checked","checked");
        auxObj=$('#toggle_RootsByProject');
        if(isDefined(config.rootsByProject)&&config.rootsByProject)auxObj.attr("checked","checked");

        auxObj=System.getAngularObject('linkTypesConfiguration',true);
        if (isDefined(config.allIssueLinkTypes)){
            auxObj.setElements(config.allIssueLinkTypes);
            System.webapp.setIssueLinkTypes(config.allIssueLinkTypes); 
            System.getAngularObject('selInterestIssueLinkTypes',true).reloadItems();
        }
        auxObj=System.getAngularObject('selProjectsToReport',true);
        if (isDefined(config.rootProjects)) auxObj.setSelectedValues(config.rootProjects);

        auxObj=System.getAngularObject('selInterestIssueLinkTypes',true);
        if (isDefined(config.useIssueLinkTypes)) auxObj.setSelectedValues(config.useIssueLinkTypes);
        
        auxObj=System.getAngularObject('selInterestFields',true);
        if (isDefined(config.useFields)) auxObj.setSelectedValues(config.useFields);
        auxObj=System.getAngularObject('selIssuesToReport',true);
        if (isDefined(config.rootIssues)) {
            var jql=config.rootIssues.jql;
            auxObj.setJQLValue(jql);
            auxObj.setSelectedValues(config.rootIssues.values);
        }
        
        auxObj=System.getAngularObject('selScope',true);
        if (isDefined(config.jqlScope)) {
            var jql=config.jqlScope.jql;
            auxObj.setJQLValue(jql);
            auxObj.setSelectedValues(config.jqlScope.values);
        }

        auxObj=System.getAngularObject('BillingHierarchy',true);
        if (isDefined(config.billingHierarchy)) auxObj.setValue(config.billingHierarchy);
        auxObj=System.getAngularObject('AdvanceHierarchy',true);
        if (isDefined(config.advanceHierarchy)) auxObj.setValue(config.advanceHierarchy);

        auxObj=System.getAngularObject('manualFieldDefinitions',true);
        if (isDefined(config.otherFieldDefinitions)){
            auxObj.setElements(config.otherFieldDefinitions);
            System.webapp.setIssueOtherFields(config.otherFieldDefinitions); 
            System.getAngularObject('selInterestOtherFields',true).reloadItems();
        }
        
        auxObj=System.getAngularObject('selInterestOtherFields',true);
        if (isDefined(config.useOtherFields)) auxObj.setSelectedValues(config.useOtherFields);

        self.updateCorrelators();
        
    }
    onChangeInterest(event){
        this.updateCorrelators();
    }
    updateCorrelators(){
        var arrFields=[];
        
        var auxObj=System.getAngularObject('selInterestFields',true);
        var arrValues=auxObj.getSelectedValues();
        arrFields=arrFields.concat(arrValues);
        
        auxObj=System.getAngularObject('selInterestOtherFields',true);
        arrValues=auxObj.getSelectedValues();
        arrFields=arrFields.concat(arrValues);

        auxObj=System.getAngularObject('selInterestIssueLinkTypes',true);
        var arrLinks=auxObj.getSelectedValues();
        
        System.getAngularObject('BillingHierarchy',true).fillFields(arrFields);
        System.getAngularObject('AdvanceHierarchy',true).fillFields(arrFields);
        System.getAngularObject('BillingHierarchy',true).fillLinks(arrLinks);
        System.getAngularObject('AdvanceHierarchy',true).fillLinks(arrLinks);
    }
    loadDefaultReport(){
        var self=this;
        var fileName="defaultReportConfig.json";
        self.addStep("Loading default config file from Storage",function(){
            System.webapp.loadFileFromStorage(fileName);
        });
        self.addStep("Applying default config ",function(sRelativePath,content){
            if (content!=""){
                var dfReport=JSON.parse(content);
                self.applyConfig(dfReport);
            }
            self.continueTask();
        });
        self.continueTask();
    }
    onChangeIssueLinkTypesConfiguration(arrTypes){
        var self=this;
        log("applying issue link types conf:"+arrTypes.length);
        System.webapp.setIssueLinkTypes(arrTypes); 
        System.getAngularObject('selInterestIssueLinkTypes',true).reloadItems();
        self.updateCorrelators();
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
        self.updateCorrelators();
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