import { Component, Input, Output } from '@angular/core';

@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html')
})

export class TabReports {
    constructor(){
        System.addPostProcess(function(){
            var theList=$("#ulDwarfers");
            console.log("List items:"+theList.length);
            console.log("Updating List");
            theList.append('<li><a href="#">Menu item Dyn</a></li>');
            
            AJS.$("#select2-example").auiSelect2();
            log("TabReports constructor called");
            AJS.$("#select2-example").append('<option value="test">Dyn Created</option>');
        });
    }
    onSelectedProjects(selectedPrjs: []) {
        for (let i=0;i<selectedPrjs.length;i++){
            log("Selected:"+selectedPrjs[i]);
        }
    }    
    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}