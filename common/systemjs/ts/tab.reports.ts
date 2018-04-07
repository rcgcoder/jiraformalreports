import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html')
})

export class TabReports {
    constructor(){
        System.addPostProcess(function(){
            log("TabReports constructor called");
            var theList=$("#ulDwarfers");
            console.log("List items:"+theList.length);
            console.log("Updating List");
            theList.append('<li><a href="#">Menu item Dyn</a></li>');
            
            AJS.$('[name="prjFiller"]').auiSelect2();
            //AJS.$("#select2-example").append('<option value="test">Dyn Created</option>');
        });
    }
    onSelectedProjects(selectedPrjs: []) {
        log("Processing selection event");

        for (let i=0;i<selectedPrjs.length;i++){
            log("Selected:"+selectedPrjs[i]);
        }
        log("Processing selection event Finished");
    }
        
    onRetrieveAllProjects(theDlgPrjSelector){
        var wApp=System.webapp;
        var arrTable=wApp.getListProjects();
        theDlgPrjSelector.populateTable(arrTable);
    }
    onRetrievePreviousSelectedProjects(theDlgPrjSelector){
        theDlgPrjSelector.selectItems();
    }

    getProjects(){
        log("getting Projects");
        return ["C","D","E"];
    }
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}