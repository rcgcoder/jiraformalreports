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
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
            var toggle = $('#toggle_DebugLogs');
            toggle.change(function(e) {
                self.report.config.logDebug=(toggle.attr("checked")=="checked");
            });
            
        });
    }
 
    onGetBillingRelationships(event){
        log("GettingRelationships");
        System.webapp.continueTask([System.webapp.getListRelations()]);
    }
    onGetBillingFields(event){
       log("structure fields event.... onGetBillingFields");
       System.webapp.continueTask([System.webapp.getListFields()]);
    }
    onLoadIssuesTest(event){
        var self=this;
        var fork=System.webapp.addStep("Testing Load Issues:"+self.name, function(){
            log("Testing end:"+self.name);
            System.webapp.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
//        System.webapp.continueTask();
        
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
        
        auxObj=$('#toggle_DebugLogs');
        dfReport["logDebug"]=(auxObj.attr("checked")=="checked");
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
        System.webapp.addStep("Loading default config file from Storage",function(){
            System.webapp.loadFileFromStorage(fileName);
        });
        System.webapp.addStep("Applying default config ",function(sRelativePath,content){
            if (content!=""){
                var dfReport=JSON.parse(content);
                self.applyConfig(dfReport);
            }
            System.webapp.continueTask();
        });
        System.webapp.continueTask();
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
        System.webapp.addStep("Updating and processing report...", function(){
            var bDontReload=isDefined(window.jrfReport);
            System.webapp.addStep("Refresh de Commit Id for update de report class", function(){
                var antCommitId=System.webapp.github.commitId;
                System.webapp.pushCallback(function(){
                   log("commit updated");
                   if (antCommitId!=System.webapp.github.commitId){
                       bDontReload=false;
                   }
                   System.webapp.continueTask();
                });
                System.webapp.github.updateLastCommit();
            });
            System.webapp.addStep("Dynamic load de report class", function(){
                if (bDontReload){
                    System.webapp.continueTask();
                } else {
                    var arrFiles=[                  
                                 "js/jrfReport.js"
                                 ]; //test
                    System.webapp.loadRemoteFiles(arrFiles);
                }
            });
            System.webapp.addStep("Executing Report", function(){
                var theConfig=self.getActualReportConfig();
                var auxObj=System.getAngularObject('selInterestFields',true);
                theConfig["allFields"]=auxObj.getAllElements();
                var theReport=new jrfReport(theConfig);
                self.report=theReport;
                theReport.execute(bDontReload);
            });
            System.webapp.continueTask();
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
        System.webapp.addStep("Getting all field names from scope issues",function(){
            var jql=self.getScopeNormalizedJQL();
            log("Scope Normalized jql:["+jql+"]");
            jira.getFieldFullList(jql);
        });
        System.webapp.addStep("Getting all field names of the list",function(hsFields){
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
                System.webapp.continueTask([hsResultFields]);
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
        System.webapp.addStep("Update selection table",function(hsResultFields){
            log("After discard identificied there is "+ hsResultFields.length()+"/"+hsAllFields.length()+" fields in all issues");
            var fieldDefs=System.getAngularObject('manualFieldDefinitions',true);
            var arrResultElements=[];
            var fncToItem=function(elem){
                arrResultElements.push([elem,elem]);
            }
            hsResultFields.walk(fncToItem);
            fieldDefs.setElements(arrResultElements);
            System.webapp.continueTask();
                
        });
        System.webapp.continueTask();
    }
    onGetFullListOfIssueTypes(){
        log("getting the total list of issue link types.....");
        var self=this;
        var jira=System.webapp.getJira();
        var hsAllFields;
        System.webapp.addStep("Getting all issue link types of Scope",function(){
            var jql=self.getScopeNormalizedJQL();
            log("Scope Normalized jql:["+jql+"]");
            jira.getIssueLinkFullList(jql);
        });
        System.webapp.addStep("Update selection table",function(hsLinkTypes){
            var selLinkTypes=System.getAngularObject('linkTypesConfiguration',true);
            var arrResultElements=[];
            var fncToItem=function(elem){
                arrResultElements.push(elem);
            }
            hsLinkTypes.walk(fncToItem);
            selLinkTypes.setElements(arrResultElements);
            System.webapp.continueTask();
        });
        System.webapp.continueTask();
    }
}