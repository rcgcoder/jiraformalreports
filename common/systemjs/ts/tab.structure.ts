import { Component, Input, Output } from '@angular/core';
@Component({
  selector: 'tabStructure',
  templateUrl: System.composeUrl('systemjs/html/tab.structure.html'),
})
export class TabStructure {
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
    @Input() name: string = 'tabStructure';
/*    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            System.bindObj(self);
        });
    }
 */
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
        var fileName="defaultReportConfig.json";
        var contentType=System.webapp.getContentTypeFromExtension(fileName);
        contentType.isCacheable=true;
        var content=JSON.stringify(dfReport);
        System.webapp.saveFileToStorage(fileName,content,contentType);
    }
    applyConfig(config){
        var self=this;
        var auxObj=System.getAngularObject('selInterestFields',true);
        auxObj.setSelectedValues(config.selInterestFields]);
        auxObj=System.getAngularObject('selIssuesToReport',true);
        var jql=config.selIssuesToReport.jql;
        auxObj.setJQLValue(jql);
        var issuesToReport=auxObj;
        System.webapp.addStep("Loading JQL Issues",function(){
            System.webapp.addStep("Refreshing jql results",function(){
                issuesToReport.refreshResults();
            });
        });
        System.webapp.addStep("Selecting default issues",function(){
            issuesToReport.setSelectedValues(config.selIssuesToReport.values);
            System.webapp.continueTask();
        });
        
        auxObj=System.getAngularObject('BillingHierarchy',true);
        auxObj.setValue(config.BillingHierarchy);
        auxObj=System.getAngularObject('AdvanceHierarchy',true);
        auxObj.setValue(config.AdvanceHierarchy);
        System.webapp.continueTask();
    }
    loadDefaultReport(){
        var self=this;
        var dfReport={};
        var fileName="defaultReportConfig.json";
        var contentType=System.webapp.getContentTypeFromExtension(fileName);
        contentType.isCacheable=true;
        var content=JSON.stringify(dfReport);
        System.webapp.addStep("Loading default config file from Storage",function(){
            System.webapp.loadFileFromStorage(fileName);
        });
        System.webapp.addStep("Applying default config ",function(sRelativePath,content){
            if (content!=""){
                dfReport=JSON.parse(content);
                self.applyConfig(dfReport);
            }
            System.webapp.continueTask();
        });
        System.webapp.continueTask();
    }
}