import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "../components/advSelector";
@Component({
  selector: 'jiraSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/jiraSelector.html'),
})
export class jiraSelector extends advSelector {
    @Input() jiraProperty: string = 'fields';

    getJira(){
        return system.webapp.getJira();
    }
    
    onRetrieveTableData(theDlgSelector){
        var self=this;
        log("Retrieving table data on jiraSelector property:"+self.jiraProperty);
        var theSelect=self.getSelect();
        var arrOptions=self.getJira()[self.jiraProperty];
        self.fillOptions(arrOptions);
        super.onRetrieveTableData(theDlgSelector);
    }
}