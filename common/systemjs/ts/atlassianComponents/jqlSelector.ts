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
        System.webapp.addStep("Refreshing values from jql",function(){
            return self.refreshResults(); // this adds steps to refresh all results
        });
        
        System.webapp.addStep("Selecting Items",function(){
            return self.getSelector().setSelectedValues(selectedElems);
        });
    }
    refreshResults(){
        var self=this;
        log("Refreshing Results of:"+self.name);
        var fork=System.webapp.addStep("Getting values:"+self.name, function(){
            log("processing step Getting Values(get values async):"+self.name);
            self.getSelector().getValuesAsync();
            log("launched get values async:"+self.name);
        },0,1,undefined,undefined,undefined,"INNER",undefined);
    }
    onAdvSelectorRetrieveData(theAdvSelector){
        //debugger;
        var self=this;
        self.isRetrievingData=true;
        log("Retrieving table data on jqlSelector");
        var sJQL=self.getJQLValue();
        if (sJQL==""){
            log("Empty JQL is not allowed");
            self.isRetrievingData=false;
            self.internal_issueList=[];
            theAdvSelector.retrieved(self.internal_issueList);
            return self.internal_issueList;
        }
        if (self.jql==sJQL){
            log("Same jql:"+sJQL);
            self.isRetrievingData=false;
            theAdvSelector.retrieved(self.internal_issueList);
            return self.internal_issueList;
        } 
        log("Diferent jql:"+sJQL);
        self.jql=sJQL;
        System.webapp.addStep("Getting issues from JQL:"+sJQL, function(){
            return System.webapp.getJQLIssues(sJQL);
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
            theAdvSelector.retrieved(arrIssues);
            return arrIssues;
        });
    }
}