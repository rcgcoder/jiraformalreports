import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "./advSelector";
@Component({
  selector: 'jqlSelector',
  templateUrl: System.composeUrl('systemjs/html/components/jqlSelector.html'),
})
export class jqlSelector extends advSelector {
    prev_jql="";
    doOpenJQL(){
        var win = window.open("https://paega2.atlassian.net/issues/?jql=", '_blank');
        win.focus();
    }
    getJQLBox(){
        return AJS.$('[name="'+this.name+'-jqlEdit"]');
    }
    
    onRetrieveTableData(theDlgSelector){
        var self=this;
        var theSuper=_super;
        log("Retrieving table data on jqlSelector");
        var theSelect=this.getSelect();
        var theJQLBox=this.getJQLBox()[0];
        var sJQL=theJQLBox.value;
        if (this.prev_jql==sJQL){
            log("Same jql:"+sJQL);
            super.onRetrieveTableData(theDlgSelector);
        } else {
            log("Diferent jql:"+sJQL);
            this.prev_jql=sJQL;
            System.webapp.addStep("Getting issues from JQL:"+sJQL, function(){
                System.webapp.getJQLIssues(sJQL);
            });
            System.webapp.addStep("Retrieving issues once the search is done",function(issueList){
                log(issueList.length);
                var arrIssues=[];
                for (var i=0;i<issueList.length;i++){
                    var issue=issueList[i];
                    arrIssues.push({key:issue.key,name:issue.key,description:issue.fields.summary});
                }
                self.fillOptions(arrIssues);
                theSuper.prototype.onRetrieveTableData.call(self, theDlgSelector);
            });
            System.webapp.continueTask();
            
        }
    }
}