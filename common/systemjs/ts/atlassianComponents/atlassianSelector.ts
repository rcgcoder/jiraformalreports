import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "../components/advSelector";
@Component({
  selector: 'atlassianSelector',
  templateUrl: System.composeUrl('systemjs/html/atlassianComponents/atlassianSelector.html'),
})
export class atlassianSelector extends advSelector {
    @Input() atlassianObjectProperty: string = undefined;
    @Input() atlassianObjectFunction: string = undefined;
    @Input() atlassianAplication: string = undefined;
    @Output() onRetrieveData = new EventEmitter<{}>();
    ngOnInit() {
        super.ngOnInit();
        var self=this;
        System.addPostProcess(function(){
            self.onRetrieveTableData();
        });
    }

    getPropertyValues(){
        var obj;
        if (this.atlassianAplication.toUpperCase()=="JIRA"){
            obj=System.webapp.getJira();
        } else if (this.atlassianAplication.toUpperCase()=="CONFLUENCE"){
            obj=System.webapp.getConfluence();
        }
        if (typeof this.atlassianObjectProperty!=="undefined"){
            return obj[this.atlassianObjectProperty];
        } else {
            return obj[this.atlassianObjectFunction]();
        }
    }
    
    onRetrieveTableData(theDlgSelector){
        var self=this;
        log("Retrieving table data on jiraSelector");
        var theSelect=self.getSelect();
        var arrOptions=[];
        if ((typeof self.atlassianObjectProperty!=="undefined") 
                || 
            (typeof self.atlassianObjectFunction!=="undefined")
            || 
            (typeof self.atlassianAplication!=="undefined")
            ){
            arrOptions=self.getPropertyValues();
        } else {
            this.onRetrieveData.emit();
            return;
        }
        self.fillOptions(arrOptions);
        if (typeof theDlgSelector!=="undefined"){
            super.onRetrieveTableData(theDlgSelector);
        }
    }
}