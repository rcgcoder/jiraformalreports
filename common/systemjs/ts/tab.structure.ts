import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
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
            System.getAngularObject('BillingHierarchy',true).updateIssueLinkTypes();
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
        log("applying issue link types conf:"+arrTypes.length);
        System.webapp.setIssueLinkTypes(arrTypes); 
        System.getAngularObject('BillingHierarchy',true).updateIssueLinkTypes();
        System.getAngularObject('AdvanceHierarchy',true).updateIssueLinkTypes();
        System.getAngularObject('selInterestIssueLinkTypes',true).reloadItems();

    }
    onChangeManualIssueFieldDefinitions(arrFields){
        log("applying custom field manual definitions");
    }
    executeReport(){
        var self=this;
        System.webapp.addStep("Executing Report", function(){
            var theConfig=self.getActualReportConfig();
            var auxObj=System.getAngularObject('selInterestFields',true);
            theConfig["allFields"]=auxObj.getAllElements();
            var theReport=new jrfReport(theConfig);
            theReport.execute();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
    onGetFullListOfFields($event){
        log("getting the total list of fields.....");
        var self=this;
        var jira=System.webapp.getJira();
        var auxObj=System.getAngularObject('selScope',true);
        var jql=auxObj.getJQLValue();
        var hsAllFields;
        var arrValues=auxObj.getSelectedValues();
        if ((arrValues.length==0)&&(jql!="")){
            System.webapp.addStep("Getting all field names of jql:"+jql,function(){
                jira.getFieldFullList(jql);
            });
        } else if ((arrValues.length==0)&&(jql=="")){
            System.webapp.addStep("Getting all field names of ALL ISSUES",function(){
                jira.getFieldFullList();
            });
        } else {
            System.webapp.addStep("Getting all field names of the list",function(){
                var sIssues="";
                for (var i=0;i<arrValues.length;i++){
                    if (i<0){
                       sIssues+=",";
                    }
                    sIssues+=arrValues[i];
                }
                jira.getFieldFullList("id in ("+sIssues+")");
            });
        }
        System.webapp.addStep("Getting all field names of the list",function(hsFields){
            var intFields=System.getAngularObject('selInterestFields',true);
            hsAllFields=hsFields;
            var arrAllFields=intFields.getAllElements();
            var hsIdentified=newHashMap();
            var arrRestField=[];
            log("There is "+ hsFields.length()+" fields in all issues");
            for (var i=0;i<arrAllFields.length;i++){
                hsIdentified.add(arrAllFields[i].key,arrAllFields[i]);
            }
                
            var fncProcessNode=System.webapp.createManagedCallback(function(objStep){
                var objStepKey=objStep.actualNode.key;
                if (!hsIdentified.exists(objStepKey)){
                    arrRestField.push(objStepKey);
                }
            });
            var fncProcessEnd=System.webapp.createManagedCallback(function(objStep){
                var objStepEnd=objStep;
                System.webapp.continueTask([arrRestField]);
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
        System.webapp.addStep("Update selection table",function(arrRestFields){
            log("After discard identificied there is "+ arrRestFields.length+"/"+hsAllFields.length()+" fields in all issues");
            var fieldDefs=System.getAngularObject('manualFieldDefinitions',true);
            fieldDefs.setElements(arrRestFields);
        });
        System.webapp.continueTask();
    }
}