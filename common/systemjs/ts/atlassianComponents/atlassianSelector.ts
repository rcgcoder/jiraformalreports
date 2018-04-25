import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "../components/advSelector";
@Component({
  selector: 'atlassianSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/atlassianSelector.html'),
})
export class atlassianSelector extends advSelector {
    @Input() atlassianObjectProperty: string = 'fields';
    @Input() atlassianAplication: string = 'jira';
    @Input() retrieveDataFunction: string ='';
    @Input() retrieveDataAsyncFunction: string ='';
    ngOnInit() {
        super.ngOnInit();
        var self=this;
        System.addPostProcess(function(){
            self.onRetrieveTableData();
        });
    }

    getPropertyValues(){
        if (this.retrieveDataFunction==""){
            var obj;
            if (this.atlassianAplication.toUpperCase()=="JIRA"){
                obj=System.webapp.getJira();
            } else if (this.atlassianAplication.toUpperCase()=="CONFLUENCE"){
                obj=System.webapp.getConfluence();
            }
            return obj[this.atlassianObjectProperty];
        } else {
            var fn = Function(this.retrieveDataFunction);
            return fn();
        }
    }
    
    onRetrieveTableData(theDlgSelector){
        var self=this;
        log("Retrieving table data on jiraSelector property:"+self.jiraProperty);
        var theSelect=self.getSelect();
        var arrOptions=self.getPropertyValues();
        self.fillOptions(arrOptions);
        if (typeof theDlgSelector!=="undefined"){
            super.onRetrieveTableData(theDlgSelector);
        }
    }
}