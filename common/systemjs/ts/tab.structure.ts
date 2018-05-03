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
        var dfReport={};
        var auxObj=System.getAngularObject('selInterestFields',true);
        var arrValues=auxObj.getSelectedValues();
        dfReport["selInterestFields"]=arrValues;
        auxObj=System.getAngularObject('selIssuesToReport',true);
        var jql=auxObj.getJQLValue();
        arrValues=auxObj.getSelectedValues();
        dfReport["selIssuesToReport"]={jql:jql,values:arrValues};
        auxObj=System.getAngularObject('BillingHierarchy',true);
        var value=auxObj.getValue();
        dfReport["BillingHierarchy"]=value;
        auxObj=System.getAngularObject('AdvanceHierarchy',true);
        value=auxObj.getValue();
        dfReport["AdvanceHierarchy"]=value;
        auxObj=System.getAngularObject('linkTypesConfiguration',true);
        value=auxObj.getElements();
        dfReport["linkTypesConfiguration"]=value;
        var fileName="defaultReportConfig.json";
        var contentType=System.webapp.getContentTypeFromExtension(fileName);
        contentType.isCacheable=true;
        var content=JSON.stringify(dfReport);
        System.webapp.saveFileToStorage(fileName,content,contentType);
    }
    applyConfig(config){
        var self=this;
        var auxObj;
        auxObj=System.getAngularObject('linkTypesConfiguration',true);
        if (isDefined(config.linkTypesConfiguration)){
            auxObj.setElements(config.linkTypesConfiguration);
            System.webapp.setIssueLinkTypes(config.linkTypesConfiguration); 
            System.getAngularObject('BillingHierarchy',true).updateIssueLinkTypes();
            System.getAngularObject('AdvanceHierarchy',true).updateIssueLinkTypes();
        }
        auxObj=System.getAngularObject('selInterestFields',true);
        if (isDefined(config.selInterestFields)) auxObj.setSelectedValues(config.selInterestFields]);
        auxObj=System.getAngularObject('selIssuesToReport',true);
        if (isDefined(config.selIssuesToReport)) {
            var jql=config.selIssuesToReport.jql;
            auxObj.setJQLValue(jql);
            auxObj.setSelectedValues(config.selIssuesToReport.values);
        }
        auxObj=System.getAngularObject('BillingHierarchy',true);
        if (isDefined(config.BillingHierarchy)) auxObj.setValue(config.BillingHierarchy);
        auxObj=System.getAngularObject('AdvanceHierarchy',true);
        if (isDefined(config.AdvanceHierarchy)) auxObj.setValue(config.AdvanceHierarchy);
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
        var jira=System.webapp.getJira();
        jira.setIssueLinkTypes(arrTypes); 
    }
}