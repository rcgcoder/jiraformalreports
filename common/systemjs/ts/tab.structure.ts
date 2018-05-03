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
        var content=JSON.stringify(dfReport);
        System.webapp.saveFileToStorage(fileName,content,contentType);
    }
    getActualReportConfig(){
        var dfReport={};
        var auxObj;
        var arrValues;
        var jql;
        var value;
        
        auxObj=$('#toggle_RootsByJQL');
        dfReport["toggle_RootsByJQL"]=auxObj.attr("checked");
        auxObj=$('#toggle_RootsByProject');
        dfReport["toggle_RootsByProject"]=auxObj.attr("checked");
        
        auxObj=System.getAngularObject('selProjectsToReport',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["selProjectsToReport"]=arrValues;

        auxObj=System.getAngularObject('selInterestIssueLinkTypes',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["selInterestIssueLinkTypes"]=arrValues;
        
        auxObj=System.getAngularObject('selInterestFields',true);
        arrValues=auxObj.getSelectedValues();
        dfReport["selInterestFields"]=arrValues;
        auxObj=System.getAngularObject('selIssuesToReport',true);
        jql=auxObj.getJQLValue();
        arrValues=auxObj.getSelectedValues();
        dfReport["selIssuesToReport"]={jql:jql,values:arrValues};
        auxObj=System.getAngularObject('BillingHierarchy',true);
        value=auxObj.getValue();
        dfReport["BillingHierarchy"]=value;
        auxObj=System.getAngularObject('AdvanceHierarchy',true);
        value=auxObj.getValue();
        dfReport["AdvanceHierarchy"]=value;
        auxObj=System.getAngularObject('linkTypesConfiguration',true);
        value=auxObj.getElements();
        dfReport["linkTypesConfiguration"]=value;
        return dfReport;
    }
    applyConfig(config){
        var self=this;
        var auxObj;
        auxObj=$('#toggle_RootsByJQL');
        if(isDefined(config.toggle_RootsByJQL))auxObj.attr("checked",config.toggle_RootsByJQL);
        auxObj=$('#toggle_RootsByProject');
        if(isDefined(config.toggle_RootsByProject))auxObj.attr("checked",config.toggle_RootsByProject);

        auxObj=System.getAngularObject('linkTypesConfiguration',true);
        if (isDefined(config.linkTypesConfiguration)){
            auxObj.setElements(config.linkTypesConfiguration);
            System.webapp.setIssueLinkTypes(config.linkTypesConfiguration); 
            System.getAngularObject('BillingHierarchy',true).updateIssueLinkTypes();
            System.getAngularObject('selInterestIssueLinkTypes',true).reloadItems();
        }
        auxObj=System.getAngularObject('selProjectsToReport',true);
        if (isDefined(config.selProjectsToReport)) auxObj.setSelectedValues(config.selProjectsToReport);

        auxObj=System.getAngularObject('selInterestIssueLinkTypes',true);
        if (isDefined(config.selInterestIssueLinkTypes)) auxObj.setSelectedValues(config.selInterestIssueLinkTypes);
        
        auxObj=System.getAngularObject('selInterestFields',true);
        if (isDefined(config.selInterestFields)) auxObj.setSelectedValues(config.selInterestFields);
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
        System.webapp.setIssueLinkTypes(arrTypes); 
        System.getAngularObject('BillingHierarchy',true).updateIssueLinkTypes();
        System.getAngularObject('AdvanceHierarchy',true).updateIssueLinkTypes();
        System.getAngularObject('selInterestIssueLinkTypes',true).reloadItems();

    }
    executeReport(){
        var self=this;
        System.webapp.addStep("Executing Report", function(){
            var theConfig=self.getActualReportConfig();
            var theReport=new jrfReport(theConfig);
            theReport.execute();
        },0,1,undefined,undefined,undefined,"GLOBAL_RUN",undefined);
    }
}