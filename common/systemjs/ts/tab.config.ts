import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabConfig',
  templateUrl: System.composeUrl('systemjs/html/tab.config.html'),
})
export class TabConfig {
    
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabConfig';
    configurations: array;
    configurationIssue: object;
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
        tabs.selectTabByTitle("Config");
    }
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
            System.webapp.getTaskManager().extendObject(self);
        });
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
    saveDefaultReport(){
        var self=this;
        var actualConfig=self.getActualReportConfig();
        var fileName="defaultReportConfig.json";
        var contentType=System.webapp.getContentTypeFromExtension(fileName);
        contentType.isCacheable=true;
        var content=JSON.stringify(actualConfig);
        self.addStep("Saving configuration...",function(){
            self.addStep("Save to Storage the Config",function(){
                System.webapp.saveFileToStorage(fileName,content,contentType);
            });
            self.addStep("Save to attachment of Issue:"+self.configurationIssue.key,function(){
                var jira=System.webapp.getJira();
                jira.addAttachmentObject(self.configurationIssue.key,actualConfig,fileName,"Added new versión of Report Configuration ");
            });
            self.continueTask();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
    getActualReportConfig(){
        var dfReport={};
        var auxObj;
        var arrValues;
        var jql;
        var value;
        
        dfReport["Vendor"]="Jira Formal Reports";
        dfReport["timestamp"]=""+Date.now();
        dfReport["date"]=Date();
        dfReport["comment"]="";
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
        
        var arrFunctions=["AdvanceProgressFunction","BillingProgressFunction",
                          "AdvanceTotalEstimatedFunction","BillingTotalEstimatedFunction"];
        arrFunctions.forEach(function(textareaName){
            auxObj=System.getAngularDomObject(textareaName)[0];
            dfReport[textareaName]=auxObj.value;
        });
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

        var arrFunctions=["AdvanceProgressFunction","BillingProgressFunction",
                          "AdvanceTotalEstimatedFunction","BillingTotalEstimatedFunction"];
        arrFunctions.forEach(function(textareaName){
            auxObj=System.getAngularDomObject(textareaName)[0];
            if (isDefined(config[textareaName])){
                auxObj.value=config[textareaName];
            }
        });
        
        System.getAngularObject("tabConfig",true).updateCorrelators();
        
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

}