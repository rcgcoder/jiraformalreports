import { Component, Input, Output, OnInit } from '@angular/core';


@Component({
  selector: 'tabReports',
  templateUrl: System.composeUrl('systemjs/html/tab.reports.html')
})

export class TabReports {
    tabOpened:{}='';
    ngOnInit() {
        var self=this;
        System.addPostProcess(function(){
            log("TabReports constructor called");
            var theList=$("#ulDwarfers");
            console.log("List items:"+theList.length);
            console.log("Updating List");
            theList.append('<li><a href="#">Menu item Dyn</a></li>');
            
            //AJS.$("#select2-example").append('<option value="test">Dyn Created</option>');
            //System.bindObj(self);
        });
    }

    doOpenJQL(){
        var win = window.open("https://paega2.atlassian.net/issues/?jql=", '_blank');
        win.focus();
    }   
    selProjects_getData($event){
        System.webapp.continueTask([System.webapp.getListProjects()]);
    }
    selTypes_getData($event){
        System.webapp.continueTask([System.webapp.getListIssueTypes()]);
        
    }
    selLabels_getData($event){
        System.webapp.continueTask([System.webapp.getListLabels()]);
        
    }
    selEpics_getData($event){
        System.webapp.continueTask([System.webapp.getListEpics()]);
        
    }
    selFilters_getData($event){
        System.webapp.continueTask([System.webapp.getListFilters()]);
    }
    selFields_getData($event){
        System.webapp.continueTask([System.webapp.getListFields()]);
    }

    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}