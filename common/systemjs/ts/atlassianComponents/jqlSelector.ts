import { Component, Input, Output, OnInit } from '@angular/core';
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
        return AJS.$('[name="'+this.name+'-jqlEdit"]');
    }
    onAdvSelectorRetrieveData(theAdvSelector){
        var self=this;
        log("Retrieving table data on jqlSelector");
        var theJQLBox=self.getJQLBox()[0];
        var sJQL=theJQLBox.value;
        if (sJQL==""){
            log("Empty JQL is not allowed");
            System.webapp.continueTask([[]]);
            return;
        }
        if (self.jql==sJQL){
            log("Same jql:"+sJQL);
            System.webapp.continueTask([self.internal_issueList]);
        } else {
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
                System.webapp.continueTask([arrIssues]);
            });
            System.webapp.continueTask();
        }
    }
}