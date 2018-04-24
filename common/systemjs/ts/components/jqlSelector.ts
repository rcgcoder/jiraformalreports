import { Component, Input, Output, OnInit } from '@angular/core';
import {advSelector} from "./advSelector";
@Component({
  selector: 'jqlSelector',
  templateUrl: System.composeUrl('systemjs/html/components/jqlSelector.html'),
})
export class jqlSelector extends advSelector {
    doOpenJQL(){
        var win = window.open("https://paega2.atlassian.net/issues/?jql=", '_blank');
        win.focus();
    }
    
    onRetrieveTableData(theDlgSelector){
        log("Retrienving table data on jqlSelector");
        super.onRetrieveTableData(theDlgSelector);
/*        var theSelect=this.getSelect();
        var nOps=theSelect[0].length; 
        var arrTable=[];
        for (var i=0;i<nOps;i++){
            var opt=theSelect[0][i];
            var key=opt.value;
            var name=opt.text;
            var isSelected=opt.selected;
            var description=name;
            var bLocated=false;
            for (var j=0;(!bLocated)&&(j<this.elements.length);j++){
                var elem=this.elements[j];
                if (elem.key==key){
                    bLocated=true;
                    if (typeof elem.description!=="undefined"){
                        description=elem.description;
                    }
                }
            }
            arrTable.push({key:key,name:description,selected:isSelected});
        }
        theDlgSelector.populateTable(arrTable);
*/
    }
}