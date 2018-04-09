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
    doTestNearley(){
        System.getAngularObject('advSelector[name="selProjects"]').testNearley();
    }
    doOpenJQL(){
        var win = window.open("https://paega2.atlassian.net/issues/?jql=", '_blank');
        win.focus();
        var fncCheckUrl=function(){
            try {
                log(win.location.href);
            }
            catch(err) {
                log("Error"+err);
            }
            setTimeout(fncCheckUrl,1000);
        }
        this.tabOpened=win;
        fncCheckUrl();
    }

    @Input() header: string = 'this is header';   
    @Input() footer: string = 'this is footer';
}