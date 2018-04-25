import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "../components/advSelector";
@Component({
  selector: 'jiraSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraSelector.html'),
})
export class jiraSelector extends advSelector {
    @Input() atlassianObjectProperty: string = 'fields';
    @Input() atlassianAplication: string = 'jira';
    getPropertyValues(){
        var obj;
        if (this.atlassianAplication.toUpperCase()=="JIRA"){
            obj=System.webapp.getJira();
        } else if (this.atlassianAplication.toUpperCase()=="CONFLUENCE"){
            obj=System.webapp.getConfluence();
        }
        return obj[this.atlassianObjectProperty];
    }
    
    onRetrieveTableData(theDlgSelector){
        var self=this;
        log("Retrieving table data on jiraSelector property:"+self.jiraProperty);
        var theSelect=self.getSelect();
        var arrOptions=self.getPropertyValues();
        self.fillOptions(arrOptions);
        super.onRetrieveTableData(theDlgSelector);
    }
}