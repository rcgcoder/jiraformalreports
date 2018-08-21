import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabConfig',
  templateUrl: System.composeUrl('systemjs/html/tab.config.html'),
})
export class TabConfig {
    
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabConfig';
    configurations: [];
    configurationIssue: object;
    setConfiguration(issue,arrConfigurations){
        var self=this;
        self.configurationIssue=issue;
        var reportIssueInfo=System.getAngularDomObject(self.name+"_reportIssue");
        reportIssueInfo.html(self.configurationIssue.key +" - "+  self.configurationIssue.fields.summary);

        if (isDefined(arrConfigurations)){
            self.configurations=arrConfigurations;
            self.configurations.sort(function(a,b){
                if (a.timestamp<b.timestamp){
                   return 1;
                } else if (a.timestamp>b.timestamp){
                   return -1;
                } 
                return 0;
            });
            var selConfs=System.getAngularObject("selConfigurations",true);
            var arrOptions=[];
            self.configurations.forEach(function(conf){
                arrOptions.push({key:conf.timestamp,name:"Configuration "+arrOptions.length+" "+conf.date,description:conf.comment});
            });
            selConfs.fillOptions(arrOptions);
        }
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
        var self=this;
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

        auxObj=$('#toggle_AlertErrors');
        dfReport["AlertErrors"]=(auxObj.attr("checked")=="checked");

        auxObj=$('#toggle_EnsureDependentIssues');
        dfReport["getIssuesNotInScope"]=(auxObj.attr("checked")=="checked");

        auxObj=$('#toggle_EpicLinkRelations');
        dfReport["withEpicLinkRelations"]=(auxObj.attr("checked")=="checked");
        
        
        auxObj=$('#toggle_ExpandAllRows');
        dfReport["expandAllRows"]=(auxObj.attr("checked")=="checked");

        auxObj=$('#toggle_ResultInteractive');
        dfReport["interactiveResult"]=(auxObj.attr("checked")=="checked");

        auxObj=$('#toggle_FullView');
        dfReport["fullView"]=(auxObj.attr("checked")=="checked");

        auxObj=$('#toggle_ShowCheckingElements');
        dfReport["withComprobations"]=(auxObj.attr("checked")=="checked");
        

        auxObj=$('#toggle_RootsByProject');
        dfReport["rootsByProject"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_ForceReloadFiles');
        dfReport["ForceReloadFiles"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_SaveResult');
        dfReport["SaveResult"]=(auxObj.attr("checked")=="checked");
        auxObj=$('#toggle_NewWindow');
        dfReport["NewWindow"]=(auxObj.attr("checked")=="checked");
        

        auxObj=$('#toggle_ResetLeafPrecomputations');
        dfReport["ResetLeafPrecomputations"]=(auxObj.attr("checked")=="checked");
        
        auxObj=$('#toggle_DontLoadLeafPrecomputations');
        dfReport["DontLoadLeafPrecomputations"]=(auxObj.attr("checked")=="checked");

        auxObj=$('#toggle_ForceSaveLeafPrecomputations');
        dfReport["ForceSaveLeafPrecomputations"]=(auxObj.attr("checked")=="checked");
        
        auxObj=$('#toggle_ExcludeProjects');
        dfReport["excludeProjects"]=(auxObj.attr("checked")=="checked");
        auxObj=System.getAngularObject('selExcludedProjects',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["excludedProjectsList"]=arrValues;
        
        
        
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
        
        debugger;
        auxObj=System.getAngularObject('excludeFunction',true);
        value=auxObj.getValue();
        dfReport["excludeFunction"]=value;
        dfReport["excludeFunctionEnabled"]=auxObj.isEnabled();

        auxObj=System.getAngularObject('relatedIssuesFind',true);
        dfReport["relatedIssuesFindFunction"]=value;
        dfReport["relatedIssuesFindFunctionEnabled"]=auxObj.isEnabled();
 
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

        auxObj=System.getAngularObject('listModels',true);
        value=auxObj.getElements();
        dfReport["listModels"]=value;
        
        auxObj=System.getAngularObject('listDefaultVariables',true);
        value=auxObj.getElements();
        dfReport["listDefaultVariables"]=value;

        auxObj=System.getAngularObject('listReportsHistory',true);
        value=auxObj.getElements();
        dfReport["listReportsHistory"]=value;

        auxObj=System.getAngularObject('selReport',true);
        jql=auxObj.getJQLValue();
        arrValues=auxObj.getSelectedValues();
        dfReport["jqlReports"]={jql:jql,values:arrValues};
        
        auxObj=System.getAngularObject('selReportModel',true);
        arrValues=auxObj.getSelectedValues();
        var arrOptions=auxObj.getOptions();
        dfReport["selReportModel"]={selected:arrValues,options:arrOptions};

        auxObj=System.getAngularObject("selUsersCanResetLeafs",true);
        arrValues=auxObj.getSelectedValues();
        dfReport["UsersCanResetLeafs"]=arrValues;
        
        auxObj=System.getAngularObject("ChildAdjustment",true);
        dfReport["BillingElementAdjustFunction"]=auxObj.getValue();
        auxObj=System.getAngularObject("AdvanceAdjustment",true);
        dfReport["AdvanceElementAdjustFunction"]=auxObj.getValue();
        
        var arrDates=["ReportInitDate","ReportEndDate","ContractInitDate",
                          "ContractEndDate", "ContractAdvancedDate"];
        dfReport['dates']={};
        arrDates.forEach(function(dateParam){
            auxObj=System.getAngularDomObject(dateParam)[0];
            dfReport['dates'][dateParam]=auxObj.value;
        });
        auxObj=$('#toggle_AdvancedWorks');
        dfReport['dates']["withAdvancedWorks"]=(auxObj.attr("checked")=="checked");
        
        
        return dfReport;
    }
    applyConfig(config){
        var self=this;
        var auxObj;

        auxObj=$('#toggle_ReuseLoadedIssues');
        if(isDefined(config.reuseIssues)&&config.reuseIssues)auxObj.attr("checked","checked");
        auxObj=$('#toggle_RootsByJQL');
        if(isDefined(config.rootsByJQL)&&config.rootsByJQL)auxObj.attr("checked","checked");

        auxObj=$('#toggle_EnsureDependentIssues');
        if(isDefined(config.getIssuesNotInScope)&&config.getIssuesNotInScope)auxObj.attr("checked","checked");
        
        auxObj=$('#toggle_RootsByProject');
        if(isDefined(config.rootsByProject)&&config.rootsByProject)auxObj.attr("checked","checked");
        auxObj=$('#toggle_ForceReloadFiles');
        if(isDefined(config.ForceReloadFiles)&&config.ForceReloadFiles)auxObj.attr("checked","checked");

        auxObj=$('#toggle_NewWindow');
        if(isDefined(config.NewWindow)&&config.NewWindow)auxObj.attr("checked","checked");
        
        
        auxObj=$('#toggle_ResetLeafPrecomputations');
        if(isDefined(config.ResetLeafPrecomputations)&&config.ResetLeafPrecomputations)auxObj.attr("checked","checked");

        auxObj=$('#toggle_DontLoadLeafPrecomputations');
        if(isDefined(config.DontLoadLeafPrecomputations)&&config.DontLoadLeafPrecomputations)auxObj.attr("checked","checked");

        auxObj=$('#toggle_EpicLinkRelations');
        if(isDefined(config.withEpicLinkRelations)&&config.withEpicLinkRelations)auxObj.attr("checked","checked");
        
        auxObj=$('#toggle_ForceSaveLeafPrecomputations');
        if(isDefined(config.ForceSaveLeafPrecomputations)&&config.ForceSaveLeafPrecomputations)auxObj.attr("checked","checked");
        
        auxObj=$('#toggle_ResultInteractive');
        if(isDefined(config.interactiveResult)&&config.interactiveResult)auxObj.attr("checked","checked");

        auxObj=$('#toggle_ExpandAllRows');
        if(isDefined(config.expandAllRows)&&config.expandAllRows)auxObj.attr("checked","checked");
        
        
        auxObj=$('#toggle_FullView');
        if(isDefined(config.fullView)&&config.fullView)auxObj.attr("checked","checked");
        
        auxObj=$('#toggle_SaveResult');
        if(isDefined(config.SaveResult)&&config.SaveResult)auxObj.attr("checked","checked");

        auxObj=$('#toggle_ShowCheckingElements');
        if(isDefined(config.withComprobations)&&config.withComprobations)auxObj.attr("checked","checked");

        auxObj=$('#toggle_AlertErrors');
        if(isDefined(config.AlertErrors)&&config.AlertErrors)auxObj.attr("checked","checked");
        
        
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
        
        auxObj=$('#toggle_ExcludeProjects');
        if(isDefined(config.excludeProjects)&&config.excludeProjects)auxObj.attr("checked","checked");

        auxObj=System.getAngularObject('selExcludedProjects',true);
        if (isDefined(config.excludedProjectsList)) auxObj.setSelectedValues(config.excludedProjectsList);
        
        
        
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

        auxObj=System.getAngularObject('excludeFunction',true);
        if (isDefined(config.excludeFunction)) auxObj.setValue(config.excludeFunction);
        if (isDefined(config.excludeFunctionEnabled)) auxObj.setEnabled(config.excludeFunctionEnabled);

        auxObj=System.getAngularObject('relatedIssuesFind',true);
        if (isDefined(config.relatedIssuesFindFunction)) auxObj.setValue(config.relatedIssuesFindFunction);
        if (isDefined(config.relatedIssuesFindFunctionEnabled)) auxObj.setEnabled(config.relatedIssuesFindFunctionEnabled);
        
        
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

        
        auxObj=System.getAngularObject('listModels',true);
        if (isDefined(config.listModels)){
            auxObj.setElements(config.listModels);
        }
        
        auxObj=System.getAngularObject('listDefaultVariables',true);
        if (isDefined(config.listDefaultVariables)){
            auxObj.setElements(config.listDefaultVariables);
        }
        
        auxObj=System.getAngularObject('listReportsHistory',true);
        if (isDefined(config.listReportsHistory)){
            auxObj.setElements(config.listReportsHistory);
        }
        
        auxObj=System.getAngularObject('selReport',true);
        if (isDefined(config.jqlReports)) {
            var jql=config.jqlReports.jql;
            auxObj.setJQLValue(jql);
            auxObj.setSelectedValues(config.jqlReports.values);
        }

        auxObj=System.getAngularObject('selReportModel',true);
        if (isDefined(config.selReportModel)){
            var arrValues=config.selReportModel.selected;
            var arrOptions=config.selReportModel.options;
            auxObj.fillOptions(arrOptions);
            auxObj.setSelectedValues(arrValues);
        }
        
        auxObj=System.getAngularObject("selUsersCanResetLeafs",true);
        if (isDefined(config.UsersCanResetLeafs)){
            auxObj.setSelectedValues(config.UsersCanResetLeafs);
        }
                
        auxObj=System.getAngularObject("ChildAdjustment",true);
        if (isDefined(config["BillingElementAdjustFunction"])){
            auxObj.setValue(config["BillingElementAdjustFunction"]);
        }
        auxObj=System.getAngularObject("AdvanceAdjustment",true);
        if (isDefined(config["AdvanceElementAdjustFunction"])){
            auxObj.setValue(config["AdvanceElementAdjustFunction"]);
        }

        if (isDefined(config['dates'])){
            var arrDates=["ReportInitDate","ReportEndDate","ContractInitDate",
                          "ContractEndDate", "ContractAdvancedDate"];
            arrDates.forEach(function(dateParam){
                if (isDefined(config['dates'][dateParam])){
                    auxObj=System.getAngularDomObject(dateParam)[0];
                    auxObj.value=config['dates'][dateParam];
                }
            });
            if (isDefined(config['dates']["withAdvancedWorks"])&&config['dates']["withAdvancedWorks"]){
                auxObj=$('#toggle_AdvancedWorks');
                auxObj.attr("checked","checked");
            }
        }
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
    onChangeConfiguration(event){
        var self=this;
        log("Change configuration:"+event);
        self.configurations.forEach(function(conf){
            if (conf.timestamp==event){
                self.applyConfig(conf);
            }
        });
       
    }
    onGetFullListOfFields($event){
        var self=this;
        var jira=System.webapp.getJira();
        var hsAllFields;
        self.addStep("getting the total list of fields.....",function(){
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
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
    onGetFullListOfIssueLinkTypes(){
        var self=this;
        var jira=System.webapp.getJira();
        var hsAllFields;
        self.addStep("getting the total list of issue link types.....",function(){
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
    onChangeListOfModels(){
        var self=this;
        var selReportModel=System.getAngularObject("selReportModel",true);
        var modelsSrc=System.getAngularObject("listModels",true);
        var arrModels=modelsSrc.getElements();
        var url="";
        var urlParts; 
        var reportModel=[];
        arrModels.forEach(function(model){
            url=model[1];
            urlParts=url.split("pages/");
            urlParts=urlParts[1].split("/");
            reportModel.push({key:urlParts[0],name:urlParts[1]});
        });
        selReportModel.fillOptions(reportModel);
        selReportModel.setSelectedValues(reportModel[0].key);
    }
}