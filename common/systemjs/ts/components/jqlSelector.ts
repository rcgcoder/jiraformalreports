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
        log("Retrienving table data on jqlSelector");
        var theSelect=this.getSelect();
        var theJQLBox=this.getJQLBox()[0];
        var sJQL=theJQLBox.text();
        if (this.prev_jql==sJQL){
            log("Same jql:"+sJQL);
        } else {
            log("Diferent jql:"+sJQL);
            this.prev_jql=sJQL;
        }
        super.onRetrieveTableData(theDlgSelector);
    }
}