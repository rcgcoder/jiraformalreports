import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "../components/advSelector";
@Component({
  selector: 'jqlSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraSelector.html'),
})
export class jiraSelector extends advSelector {
    
    onRetrieveTableData(theDlgSelector){
        var self=this;
        var theSuper=_super;
        log("Retrieving table data on jqlSelector");
        var theSelect=self.getSelect();
        var theJQLBox=self.getJQLBox()[0];
        var sJQL=theJQLBox.value;
        if (self.prev_jql==sJQL){
            log("Same jql:"+sJQL);
            super.onRetrieveTableData(theDlgSelector);
        } else {
            log("Diferent jql:"+sJQL);
            self.setDialogWaiting(true);
            self.prev_jql=sJQL;
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
                self.fillOptions(arrIssues);
                theSuper.prototype.onRetrieveTableData.call(self, theDlgSelector);
                self.setDialogWaiting(false);
                System.webapp.continueTask();
            });
            System.webapp.continueTask();
        }
    }
}