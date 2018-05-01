import { Component,EventEmitter, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "../components/advSelector";
@Component({
  selector: 'jqlSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jqlSelector.html'),
})
export class jqlSelector {
    @Input() name: string = 'jqlSelector';
    @Input() typeDescriptor: string = 'elements';
    @Input() multiple: string = "false";
    @Input() maxCharsInSelect: integer = 17;
    @Input() openDialogCaption: string = '...';
    @Input() jql: string = '';
    

    isRetrievingData: boolean : false;
    internal_issueList: []=[];
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("PostProcessing:"+self.name);
            System.bindObj(self);
            var theJQLBox=self.getJQLBox()[0];
            theJQLBox.value=self.jql;
        });
    }
    
    doOpenJQL(){
        var win = window.open("https://paega2.atlassian.net/issues/?jql=" + this.jql, '_blank');
        win.focus();
    }
    getJQLBox(){
        return $(AJS.$('[name="'+this.name+'-jqlEdit"]')[0]);
    }
    getJQLValue(){
        var sJQL=this.getJQLBox().val();
        return sJQL;
    }
    setJQLValue(sJQL){
        this.getJQLBox().val(sJQL);
    }
    getSelector(){
        var self=this;
        var objSel=System.getAngularObject(self.name+"-advSelector",true);
        return objSel;
    }
    
    getSelectedValues(){
        return this.getSelector().getSelectedValues();
    }
    setSelectedValues(selectedElems: []) {
        var self=this;
        self.refreshResults(); // this adds steps to refresh all results
        // when refreshresults finished select the issues
        var fncAddSelectElementsStep=function(){
            System.webapp.addStep("Selecting Items",function(){
                self.getSelector().setSelectedValues(selectedElems);
                self.event_InternalFinishedJQLRetrieveData=undefined;
                System.webapp.continueTask();
            });
        }
        self.event_InternalFinishedJQLRetrieveData=fncAddSelectElementsStep;
        System.webapp.continueTask();
    }
    refreshResults(){
        System.webapp.addStep("lost step... to avoid the default continueTask of getValuesAsync",function(){
        });
        this.getSelector().getValuesAsync();
    }
    event_InternalFinishedJQLRetrieveData(){
        log("do nothing");
    }
    event_FinishedJQLRetrieveData(){
        var self=this;
        log("Finished JQL Retrieving data.... it will continue populating tables");
        if (typeof self.event_InternalFinishedJQLRetrieveData!=="undefined"){
            self.event_InternalFinishedJQLRetrieveData();
        }
    }
    onAdvSelectorRetrieveData(theAdvSelector){
        var self=this;
        self.isRetrievingData=true;
        log("Retrieving table data on jqlSelector");
        var sJQL=self.getJQLValue();
        if (sJQL==""){
            log("Empty JQL is not allowed");
            self.isRetrievingData=false;
            self.internal_issueList=[];
            return System.webapp.continueTask([self.internal_issueList]);
        }
        if (self.jql==sJQL){
            log("Same jql:"+sJQL);
            self.isRetrievingData=false;
            return System.webapp.continueTask([self.internal_issueList]);
        } 
        log("Diferent jql:"+sJQL);
        self.jql=sJQL;
        System.webapp.addStep("Getting issues from JQL:"+sJQL, function(){
            System.webapp.getJQLIssues(sJQL);
        });
        System.webapp.addStep("Retrieving issues once the search is done",function(issueList){
            log(issueList.length);
            var arrIssues=[];
            for (var i=0;i<issueList.length;i++){
                var issue=issueList[i];
                arrIssues.push({key:issue.key,name:issue.fields.summary,description:issue.fields.summary});
            }
            self.internal_issueList=arrIssues;
            self.isRetrievingData=false;
            self.event_FinishedJQLRetrieveData();
            System.webapp.continueTask([arrIssues]);
        });
        System.webapp.continueTask();
    }
}